export interface StageHistoryEntry {
  from: string;
  to: string;
  at: string;
  by?: string;
  note?: string;
}

export interface Application {
  id: string;
  candidateName: string;
  role: string;
  currentStage: string;
  stageHistory: StageHistoryEntry[];
  appliedAt: string;
  // Add other relevant fields
}
