import { create } from 'zustand';

export type IssueStatus = 'pending' | 'in-progress' | 'resolved';
export type IssueCategory = 'plumbing' | 'electrical' | 'cleaning' | 'security' | 'infrastructure' | 'noise' | 'other';

export interface Issue {
  id: string;
  category: IssueCategory;
  description: string;
  location: string;
  imageUrl?: string;
  status: IssueStatus;
  reportedBy: string;
  reportedAt: Date;
  updatedAt: Date;
}

interface IssueState {
  issues: Issue[];
  addIssue: (issue: Omit<Issue, 'id' | 'status' | 'reportedAt' | 'updatedAt'>) => void;
  updateStatus: (id: string, status: IssueStatus) => void;
}

const sampleIssues: Issue[] = [
  {
    id: '1',
    category: 'plumbing',
    description: 'Water leakage in the basement parking area near Block A entrance.',
    location: 'Block A - Basement Parking',
    status: 'pending',
    reportedBy: 'Rahul Sharma',
    reportedAt: new Date('2026-03-10'),
    updatedAt: new Date('2026-03-10'),
  },
  {
    id: '2',
    category: 'electrical',
    description: 'Streetlight near garden area not working for the past 3 days.',
    location: 'Central Garden Path',
    status: 'in-progress',
    reportedBy: 'Priya Patel',
    reportedAt: new Date('2026-03-08'),
    updatedAt: new Date('2026-03-11'),
  },
  {
    id: '3',
    category: 'cleaning',
    description: 'Garbage not collected from Block C dustbin area since Monday.',
    location: 'Block C - Dustbin Area',
    status: 'resolved',
    reportedBy: 'Amit Kumar',
    reportedAt: new Date('2026-03-05'),
    updatedAt: new Date('2026-03-07'),
  },
  {
    id: '4',
    category: 'security',
    description: 'CCTV camera near main gate is showing blurry footage.',
    location: 'Main Gate',
    status: 'pending',
    reportedBy: 'Neha Gupta',
    reportedAt: new Date('2026-03-11'),
    updatedAt: new Date('2026-03-11'),
  },
  {
    id: '5',
    category: 'infrastructure',
    description: 'Cracks appearing on the walking path near the playground.',
    location: 'Playground Area',
    status: 'in-progress',
    reportedBy: 'Vikram Singh',
    reportedAt: new Date('2026-03-06'),
    updatedAt: new Date('2026-03-09'),
  },
];

export const useIssueStore = create<IssueState>((set) => ({
  issues: sampleIssues,
  addIssue: (issue) =>
    set((state) => ({
      issues: [
        {
          ...issue,
          id: String(Date.now()),
          status: 'pending',
          reportedAt: new Date(),
          updatedAt: new Date(),
        },
        ...state.issues,
      ],
    })),
  updateStatus: (id, status) =>
    set((state) => ({
      issues: state.issues.map((i) =>
        i.id === id ? { ...i, status, updatedAt: new Date() } : i
      ),
    })),
}));
