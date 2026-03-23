import { IssueStatus } from '@/store/issueStore';

interface StatusBadgeProps {
  status: IssueStatus;
}

const statusConfig: Record<IssueStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'status-pending' },
  'in-progress': { label: 'In Progress', className: 'status-in-progress' },
  resolved: { label: 'Resolved', className: 'status-resolved' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
}
