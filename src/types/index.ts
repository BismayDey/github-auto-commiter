export interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
}

export interface CommitConfig {
  repository: string;
  branch: string;
  frequency: 'hourly' | 'daily' | 'weekly';
  startDate: string;
  endDate: string | null;
  commitMessage: string;
}

export interface CommitStatus {
  active: boolean;
  lastCommit: string | null;
  nextCommit: string | null;
  totalCommits: number;
}

export interface CommitRecord {
  id: string;
  repository: string;
  timestamp: Date;
  status: 'success' | 'failed' | 'pending';
  commitHash?: string;
  message: string;
  error?: string;
}

export interface GithubCredentials {
  username: string;
  token: string;
}