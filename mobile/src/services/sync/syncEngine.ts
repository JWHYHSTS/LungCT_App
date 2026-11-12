import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { firestore } from '../firebase/firebaseConfig';
import { localStorageService } from '../storage';
import { notifyPatientListeners } from '../storage/patientRepository';
import { notifyCaseListeners } from '../storage/caseRepository';
import type {
  AIPredictionResultEntity,
  CaseEntity,
  PatientEntity,
} from '../storage/types';
import type {
  PendingSyncStats,
  SyncStatusSnapshot,
  SyncSummary,
} from './types';

type SyncListener = (snapshot: SyncStatusSnapshot) => void;

/**
 * Động cơ Đồng bộ Đám mây 2 chiều (Outbox Queue & Cloud Sync Engine).
 *
 * Kiến trúc Local-First:
 * 1. Mọi thao tác thêm/sửa bệnh nhân và ca khám đều ghi ngay vào kho mã hóa cục bộ với `syncState = 'pending'`.
 * 2. Khi thiết bị có mạng Internet, `SyncEngine.syncAll()` thực hiện:
 *    - PUSH (Đẩy lên): Ghi các bản ghi `pending` của bác sĩ lên Cloud Firestore (`/patients`, `/cases`),
 *      đính kèm trường `doctorId = ownerId` để khớp chặt chẽ với `infra/firebase/firestore.rules`.
 *      Sau khi Firestore xác nhận ghi thành công, cập nhật `syncState = 'synced'` (chỉ khi revision chưa tăng).
 *    - PULL (Kéo về): Tải các bản ghi của chính bác sĩ đó từ Firestore về hợp nhất an toàn vào thiết bị
 *      theo chiến lược kiểm tra revision (phát hiện xung đột nếu dữ liệu cục bộ đang pending).
 * 3. Đảm bảo Single-flight: Chống chạy song song gây race condition nếu người dùng bấm đồng bộ liên tiếp.
 */
export class SyncEngine {
  private static currentSnapshot: SyncStatusSnapshot = {
    status: 'idle',
    lastSummary: null,
  };

  private static listeners: Set<SyncListener> = new Set();
  private static activeSyncPromise: Promise<SyncSummary> | null = null;

  public static subscribeSyncStatus(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.currentSnapshot);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public static getSnapshot(): SyncStatusSnapshot {
    return this.currentSnapshot;
  }

  private static updateSnapshot(next: SyncStatusSnapshot) {
    this.currentSnapshot = next;
    this.listeners.forEach((listener) => {
      try {
        listener(next);
      } catch (err) {
        console.warn('[SyncEngine] Lỗi listener:', err);
      }
    });
  }

  /**
   * Đếm số lượng thay đổi cục bộ đang chờ đồng bộ (`syncState === 'pending'`).
   */
  public static async getPendingStats(ownerId: string): Promise<PendingSyncStats> {
    if (!ownerId) {
      return { pendingPatients: 0, pendingCases: 0, totalPending: 0 };
    }
    try {
      await localStorageService.initialize();
      const { patients, cases } = await localStorageService.getPendingSyncItems(ownerId);
      return {
        pendingPatients: patients.length,
        pendingCases: cases.length,
        totalPending: patients.length + cases.length,
      };
    } catch (err) {
      console.warn('[SyncEngine] Không thể đọc thống kê hàng đợi:', err);
      return { pendingPatients: 0, pendingCases: 0, totalPending: 0 };
    }
  }

  /**
   * Thực thi chu trình đồng bộ Outbox (Push -> Pull) giữa SQLite cục bộ và Cloud Firestore.
   */
  public static async syncAll(ownerId: string, isOnline: boolean): Promise<SyncSummary> {
    if (this.activeSyncPromise) {
      return this.activeSyncPromise;
    }

    this.activeSyncPromise = this.runSyncInternal(ownerId, isOnline).finally(() => {
      this.activeSyncPromise = null;
    });

    return this.activeSyncPromise;
  }

  private static async runSyncInternal(ownerId: string, isOnline: boolean): Promise<SyncSummary> {
    const nowIso = new Date().toISOString();

    if (!isOnline) {
      const offlineSummary: SyncSummary = {
        status: 'offline',
        pushedPatients: 0,
        pushedCases: 0,
        pulledPatients: 0,
        pulledCases: 0,
        conflicts: 0,
        errors: ['Thiết bị đang ngoại tuyến (Offline). Dữ liệu được giữ an toàn trên máy.'],
        syncedAt: nowIso,
      };
      this.updateSnapshot({ status: 'offline', lastSummary: offlineSummary });
      return offlineSummary;
    }

    // Không đồng bộ tài khoản test nội bộ hoặc chưa đăng nhập
    if (!ownerId || ownerId === 'usr-doc-01') {
      const skipSummary: SyncSummary = {
        status: 'idle',
        pushedPatients: 0,
        pushedCases: 0,
        pulledPatients: 0,
        pulledCases: 0,
        conflicts: 0,
        errors: [],
        syncedAt: nowIso,
      };
      this.updateSnapshot({ status: 'idle', lastSummary: skipSummary });
      return skipSummary;
    }

    this.updateSnapshot({ ...this.currentSnapshot, status: 'syncing' });

    const summary: SyncSummary = {
      status: 'success',
      pushedPatients: 0,
      pushedCases: 0,
      pulledPatients: 0,
      pulledCases: 0,
      conflicts: 0,
      errors: [],
      syncedAt: nowIso,
    };

    try {
      await localStorageService.initialize();
      const pending = await localStorageService.getPendingSyncItems(ownerId);
      const allPredictions = await localStorageService.getAllPredictionsForOwner(ownerId);

      // 1. PUSH PATIENTS
      for (const patient of pending.patients) {
        try {
          const patientDocRef = doc(firestore, 'patients', patient.patientId);
          await setDoc(
            patientDocRef,
            {
              patientId: patient.patientId,
              ownerId,
              doctorId: ownerId,
              patientCode: patient.patientCode,
              fullName: patient.fullName,
              dateOfBirth: patient.dateOfBirth,
              sex: patient.sex,
              phone: patient.phone ?? null,
              address: patient.address ?? null,
              symptoms: patient.symptoms ?? null,
              history: patient.history ?? null,
              note: patient.note ?? null,
              status: patient.status,
              revision: patient.revision,
              createdAt: patient.createdAt,
              updatedAt: patient.updatedAt,
              trashedAt: patient.trashedAt ?? null,
              syncedAt: nowIso,
            },
            { merge: true },
          );

          await localStorageService.markPatientSynced(ownerId, patient.patientId, patient.revision);
          summary.pushedPatients += 1;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          summary.errors.push(`Lỗi đẩy bệnh nhân ${patient.patientCode}: ${msg}`);
        }
      }

      // 2. PUSH CASES
      for (const caseItem of pending.cases) {
        try {
          const images = await localStorageService.getImagesByCaseId(ownerId, caseItem.caseId);
          const casePreds = images
            .map((img) =>
              allPredictions.find((p) => p.imageId === img.imageId && p.state === 'CURRENT'),
            )
            .filter(
              (p): p is AIPredictionResultEntity =>
                Boolean(p && p.classificationStatus === 'PASS'),
            );

          const labelCounts = { benign: 0, malignant: 0, normal: 0 };
          casePreds.forEach((p) => {
            if (p.label === 'BENIGN') labelCounts.benign += 1;
            else if (p.label === 'MALIGNANT') labelCounts.malignant += 1;
            else if (p.label === 'NORMAL') labelCounts.normal += 1;
          });

          const latestPred = casePreds[casePreds.length - 1];

          const caseDocRef = doc(firestore, 'cases', caseItem.caseId);
          await setDoc(
            caseDocRef,
            {
              caseId: caseItem.caseId,
              caseCode: caseItem.caseCode,
              patientId: caseItem.patientId,
              ownerId,
              doctorId: ownerId, // Bắt buộc khớp Security Rules
              scanDate: caseItem.scanDate,
              clinicalNote: caseItem.clinicalNote ?? '',
              doctorComment: caseItem.doctorComment ?? '',
              status: caseItem.status,
              completionVersion: caseItem.completionVersion ?? null,
              completedAt: caseItem.completedAt ?? null,
              isPartial: Boolean(caseItem.isPartial),
              amendmentReason: caseItem.amendmentReason ?? null,
              revision: caseItem.revision,
              createdAt: caseItem.createdAt,
              updatedAt: caseItem.updatedAt,
              trashedAt: caseItem.trashedAt ?? null,
              imageCount: images.length,
              aiSummary: {
                analyzedCount: casePreds.length,
                labelCounts,
                latestLabel: latestPred?.label ?? null,
                latestScores: latestPred?.scores ?? null,
                latestDurationMs: latestPred?.durationMs ?? null,
                modelVersion: latestPred?.modelVersion ?? null,
              },
              syncedAt: nowIso,
            },
            { merge: true },
          );

          await localStorageService.markCaseSynced(ownerId, caseItem.caseId, caseItem.revision);
          summary.pushedCases += 1;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          summary.errors.push(`Lỗi đẩy ca bệnh ${caseItem.caseCode}: ${msg}`);
        }
      }

      // 3. PULL PATIENTS
      try {
        const patientsQuery = query(
          collection(firestore, 'patients'),
          where('ownerId', '==', ownerId),
        );
        const patientSnaps = await getDocs(patientsQuery);
        for (const docSnap of patientSnaps.docs) {
          const d = docSnap.data();
          const remotePatient: PatientEntity = {
            patientId: d.patientId || docSnap.id,
            ownerId,
            patientCode: d.patientCode || '',
            fullName: d.fullName || '',
            dateOfBirth: d.dateOfBirth || '',
            sex: d.sex || 'OTHER',
            phone: d.phone ?? undefined,
            address: d.address ?? undefined,
            symptoms: d.symptoms ?? undefined,
            history: d.history ?? undefined,
            note: d.note ?? undefined,
            status: d.status === 'TRASHED' ? 'TRASHED' : 'ACTIVE',
            revision: typeof d.revision === 'number' ? d.revision : 1,
            syncState: 'synced',
            createdAt: d.createdAt || nowIso,
            updatedAt: d.updatedAt || nowIso,
            trashedAt: d.trashedAt ?? undefined,
          };

          const mergeOutcome = await localStorageService.upsertPatientFromCloud(
            ownerId,
            remotePatient,
          );
          if (mergeOutcome === 'inserted' || mergeOutcome === 'updated') {
            summary.pulledPatients += 1;
          } else if (mergeOutcome === 'conflict') {
            summary.conflicts += 1;
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        summary.errors.push(`Lỗi tải danh sách bệnh nhân từ đám mây: ${msg}`);
      }

      // 4. PULL CASES
      try {
        const casesQuery = query(
          collection(firestore, 'cases'),
          where('doctorId', '==', ownerId),
        );
        const caseSnaps = await getDocs(casesQuery);
        for (const docSnap of caseSnaps.docs) {
          const d = docSnap.data();
          const remoteCase: CaseEntity = {
            caseId: d.caseId || docSnap.id,
            caseCode: d.caseCode || '',
            patientId: d.patientId || '',
            ownerId,
            scanDate: d.scanDate || nowIso.substring(0, 10),
            clinicalNote: d.clinicalNote ?? undefined,
            doctorComment: d.doctorComment ?? undefined,
            status:
              d.status === 'COMPLETED'
                ? 'COMPLETED'
                : d.status === 'TRASHED'
                  ? 'TRASHED'
                  : 'DRAFT',
            completionVersion: d.completionVersion ?? undefined,
            completedAt: d.completedAt ?? undefined,
            isPartial: Boolean(d.isPartial),
            amendmentReason: d.amendmentReason ?? undefined,
            revision: typeof d.revision === 'number' ? d.revision : 1,
            syncState: 'synced',
            createdAt: d.createdAt || nowIso,
            updatedAt: d.updatedAt || nowIso,
            trashedAt: d.trashedAt ?? undefined,
          };

          const mergeOutcome = await localStorageService.upsertCaseFromCloud(ownerId, remoteCase);
          if (mergeOutcome === 'inserted' || mergeOutcome === 'updated') {
            summary.pulledCases += 1;
          } else if (mergeOutcome === 'conflict') {
            summary.conflicts += 1;
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        summary.errors.push(`Lỗi tải danh sách ca bệnh từ đám mây: ${msg}`);
      }

      if (summary.errors.length > 0) {
        summary.status = 'error';
      }

      this.updateSnapshot({ status: summary.status, lastSummary: summary });

      // Phát thông báo cập nhật lại danh sách cho các màn hình Bác sĩ
      notifyPatientListeners();
      notifyCaseListeners();

      return summary;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const errSummary: SyncSummary = {
        ...summary,
        status: 'error',
        errors: [...summary.errors, msg],
      };
      this.updateSnapshot({ status: 'error', lastSummary: errSummary });
      return errSummary;
    }
  }
}

