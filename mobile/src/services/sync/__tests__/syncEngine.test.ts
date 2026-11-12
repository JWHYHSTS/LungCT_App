import { getDocs, setDoc } from 'firebase/firestore';
import { SyncEngine } from '../syncEngine';
import { localStorageService } from '../../storage';
import type { CaseEntity, PatientEntity } from '../../storage/types';

jest.mock('firebase/firestore', () => ({
  collection: jest.fn((_db, name) => ({ path: name })),
  doc: jest.fn((_db, col, id) => ({ path: `${col}/${id}` })),
  query: jest.fn((colRef) => colRef),
  where: jest.fn(),
  setDoc: jest.fn(),
  getDocs: jest.fn(),
}));

jest.mock('../../firebase/firebaseConfig', () => ({
  firestore: {},
  auth: {},
}));

describe('SYNC-01: SyncEngine Outbox & Cloud Firestore Tests', () => {
  const ownerId = 'doc-firebase-uid-123';

  const mockPendingPatient: PatientEntity = {
    patientId: 'pat-001',
    ownerId,
    patientCode: 'BN-001',
    fullName: 'Nguyễn Văn A',
    dateOfBirth: '10/05/1970',
    sex: 'MALE',
    status: 'ACTIVE',
    revision: 1,
    syncState: 'pending',
    createdAt: '2026-11-12T08:00:00.000Z',
    updatedAt: '2026-11-12T08:00:00.000Z',
  };

  const mockPendingCase: CaseEntity = {
    caseId: 'case-001',
    caseCode: 'CA-2026-000001',
    patientId: 'pat-001',
    ownerId,
    scanDate: '2026-11-12',
    clinicalNote: 'Ho kéo dài',
    doctorComment: 'Theo dõi nốt mờ',
    status: 'COMPLETED',
    revision: 2,
    syncState: 'pending',
    createdAt: '2026-11-12T08:05:00.000Z',
    updatedAt: '2026-11-12T08:10:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('1. Offline mode: Không gọi Firestore và giữ an toàn dữ liệu cục bộ', async () => {
    const res = await SyncEngine.syncAll(ownerId, false);

    expect(res.status).toBe('offline');
    expect(res.pushedPatients).toBe(0);
    expect(res.pushedCases).toBe(0);
    expect(setDoc).not.toHaveBeenCalled();
    expect(getDocs).not.toHaveBeenCalled();
  });

  test('2. Tài khoản test nội bộ (usr-doc-01) được bỏ qua không đẩy lên Cloud', async () => {
    const res = await SyncEngine.syncAll('usr-doc-01', true);

    expect(res.status).toBe('idle');
    expect(setDoc).not.toHaveBeenCalled();
  });

  test('3. Push thành công bệnh nhân và ca bệnh pending lên Firestore kèm doctorId', async () => {
    jest.spyOn(localStorageService, 'initialize').mockResolvedValueOnce(undefined);
    jest.spyOn(localStorageService, 'getPendingSyncItems').mockResolvedValueOnce({
      patients: [mockPendingPatient],
      cases: [mockPendingCase],
    });
    jest.spyOn(localStorageService, 'getAllPredictionsForOwner').mockResolvedValueOnce([
      {
        resultId: 'res-1',
        imageId: 'img-1',
        imageVersion: 1,
        classificationStatus: 'PASS',
        scores: [0.1, 0.85, 0.05],
        label: 'MALIGNANT',
        explanationStatus: 'UNAVAILABLE',
        modelVersion: 'Adaptive_ViT_FP32_v1',
        preprocessingVersion: 'Nearest_Float32_v1',
        executionSource: 'LOCAL',
        mode: 'REAL',
        startedAt: '2026-11-12T08:06:00.000Z',
        finishedAt: '2026-11-12T08:06:00.200Z',
        durationMs: 200,
        state: 'CURRENT',
      },
    ]);
    jest.spyOn(localStorageService, 'getImagesByCaseId').mockResolvedValueOnce([
      {
        imageId: 'img-1',
        caseId: 'case-001',
        ownerId,
        imageVersion: 1,
        orderIndex: 1,
        source: 'LIBRARY',
        mimeType: 'image/png',
        width: 512,
        height: 512,
        byteSize: 2048,
        sha256: 'abc',
        localFileRef: '/data/slice1.png',
        state: 'ACTIVE',
        createdAt: '2026-11-12T08:05:30.000Z',
      },
    ]);

    const markPatSpy = jest
      .spyOn(localStorageService, 'markPatientSynced')
      .mockResolvedValueOnce(true);
    const markCaseSpy = jest
      .spyOn(localStorageService, 'markCaseSynced')
      .mockResolvedValueOnce(true);

    (setDoc as jest.Mock).mockResolvedValue(undefined);
    (getDocs as jest.Mock).mockResolvedValue({ docs: [] });

    const res = await SyncEngine.syncAll(ownerId, true);

    expect(res.status).toBe('success');
    expect(res.pushedPatients).toBe(1);
    expect(res.pushedCases).toBe(1);
    expect(res.errors).toHaveLength(0);

    // Kiểm tra payload bệnh nhân gửi lên có doctorId & không chứa undefined
    expect(setDoc).toHaveBeenCalledTimes(2);
    const patientPayload = (setDoc as jest.Mock).mock.calls[0][1];
    expect(patientPayload.doctorId).toBe(ownerId);
    expect(patientPayload.patientCode).toBe('BN-001');
    expect(patientPayload.phone).toBeNull();

    // Kiểm tra payload ca bệnh có doctorId và tóm tắt AI
    const casePayload = (setDoc as jest.Mock).mock.calls[1][1];
    expect(casePayload.doctorId).toBe(ownerId);
    expect(casePayload.aiSummary.latestLabel).toBe('MALIGNANT');
    expect(casePayload.aiSummary.analyzedCount).toBe(1);

    expect(markPatSpy).toHaveBeenCalledWith(ownerId, 'pat-001', 1);
    expect(markCaseSpy).toHaveBeenCalledWith(ownerId, 'case-001', 2);
  });

  test('4. Pull dữ liệu từ Firestore và phát hiện xung đột an toàn nếu local đang pending', async () => {
    jest.spyOn(localStorageService, 'initialize').mockResolvedValueOnce(undefined);
    jest.spyOn(localStorageService, 'getPendingSyncItems').mockResolvedValueOnce({
      patients: [],
      cases: [],
    });
    jest.spyOn(localStorageService, 'getAllPredictionsForOwner').mockResolvedValueOnce([]);

    const upsertPatSpy = jest
      .spyOn(localStorageService, 'upsertPatientFromCloud')
      .mockResolvedValueOnce('inserted');
    const upsertCaseSpy = jest
      .spyOn(localStorageService, 'upsertCaseFromCloud')
      .mockResolvedValueOnce('conflict');

    // Lần gọi getDocs 1 (patients), Lần gọi getDocs 2 (cases)
    (getDocs as jest.Mock)
      .mockResolvedValueOnce({
        docs: [
          {
            id: 'pat-remote-1',
            data: () => ({
              patientId: 'pat-remote-1',
              patientCode: 'BN-999',
              fullName: 'Trần Thị B',
              dateOfBirth: '01/01/1980',
              sex: 'FEMALE',
              status: 'ACTIVE',
              revision: 3,
            }),
          },
        ],
      })
      .mockResolvedValueOnce({
        docs: [
          {
            id: 'case-conflict-1',
            data: () => ({
              caseId: 'case-conflict-1',
              caseCode: 'CA-2026-000999',
              patientId: 'pat-remote-1',
              scanDate: '2026-11-11',
              status: 'DRAFT',
              revision: 5,
            }),
          },
        ],
      });

    const res = await SyncEngine.syncAll(ownerId, true);

    expect(upsertPatSpy).toHaveBeenCalledTimes(1);
    expect(upsertCaseSpy).toHaveBeenCalledTimes(1);
    expect(res.pulledPatients).toBe(1);
    expect(res.pulledCases).toBe(0);
    expect(res.conflicts).toBe(1);
    expect(res.status).toBe('success');
  });

  test('5. getPendingStats trả về tổng số mục pending chính xác', async () => {
    jest.spyOn(localStorageService, 'initialize').mockResolvedValueOnce(undefined);
    jest.spyOn(localStorageService, 'getPendingSyncItems').mockResolvedValueOnce({
      patients: [mockPendingPatient],
      cases: [mockPendingCase],
    });

    const stats = await SyncEngine.getPendingStats(ownerId);
    expect(stats.pendingPatients).toBe(1);
    expect(stats.pendingCases).toBe(1);
    expect(stats.totalPending).toBe(2);
  });
});

