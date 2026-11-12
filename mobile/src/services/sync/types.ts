export type SyncStatusState = 'idle' | 'syncing' | 'success' | 'error' | 'offline';

export interface PendingSyncStats {
  pendingPatients: number;
  pendingCases: number;
  totalPending: number;
}

export interface SyncSummary {
  status: SyncStatusState;
  pushedPatients: number;
  pushedCases: number;
  pulledPatients: number;
  pulledCases: number;
  conflicts: number;
  errors: string[];
  syncedAt: string;
}

export interface SyncStatusSnapshot {
  status: SyncStatusState;
  lastSummary: SyncSummary | null;
}

