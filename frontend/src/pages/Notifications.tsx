import { motion } from 'framer-motion';
import { Bell, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const notifications = [
  {
    id: '1',
    title: 'Issue Resolved',
    message: 'Your report about garbage collection in Block C has been resolved.',
    icon: CheckCircle,
    time: '2 hours ago',
    type: 'success' as const,
  },
  {
    id: '2',
    title: 'Status Updated',
    message: 'Streetlight repair near garden area is now in progress.',
    icon: Clock,
    time: '5 hours ago',
    type: 'info' as const,
  },
  {
    id: '3',
    title: 'New Issue Reported',
    message: 'A new plumbing issue has been reported in Block A basement.',
    icon: AlertCircle,
    time: '1 day ago',
    type: 'warning' as const,
  },
  {
    id: '4',
    title: 'Issue Assigned',
    message: 'CCTV camera issue at main gate has been assigned to maintenance team.',
    icon: Bell,
    time: '2 days ago',
    type: 'info' as const,
  },
];

const typeStyles = {
  success: 'bg-success/10 text-success',
  info: 'status-in-progress',
  warning: 'status-pending',
};

const Notifications = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        <p className="text-muted-foreground text-sm mt-1">Stay updated on your community issues.</p>

        <div className="mt-6 space-y-3">
          {notifications.map((n, i) => {
            const Icon = n.icon;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 * i }}
                className="bg-card rounded-xl border border-border p-4 hover-lift shadow-card flex items-start gap-3"
              >
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${typeStyles[n.type]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{n.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1.5">{n.time}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default Notifications;
