import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useIssueStore, IssueStatus } from '@/store/issueStore';
import { useAuthStore } from '@/store/authStore';
import { IssueCard } from '@/components/dashboard/IssueCard';

const statusFilters: { value: 'all' | IssueStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

const MyIssues = () => {
  const [filter, setFilter] = useState<'all' | IssueStatus>('all');
  const [search, setSearch] = useState('');
  const { issues, updateStatus } = useIssueStore();
  const { user } = useAuthStore();

  const canChangeStatus = user?.role === 'authority' || user?.role === 'admin';

  const filtered = issues.filter((i) => {
    if (filter !== 'all' && i.status !== filter) return false;
    if (search && !i.description.toLowerCase().includes(search.toLowerCase()) && !i.location.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-foreground">My Issues</h1>
        <p className="text-muted-foreground text-sm mt-1">Track and manage reported issues.</p>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search issues..."
              className="pl-9"
            />
          </div>
          <div className="flex gap-1.5">
            {statusFilters.map((s) => (
              <button
                key={s.value}
                onClick={() => setFilter(s.value)}
                className={`text-xs px-3 py-2 rounded-lg font-medium transition-all ${
                  filter === s.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 mt-6 sm:grid-cols-2">
          {filtered.map((issue, i) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              delay={0.05 * i}
              showActions={canChangeStatus}
              onStatusChange={updateStatus}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No issues found.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default MyIssues;
