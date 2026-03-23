import { motion } from 'framer-motion';
import { Bell, Shield, Eye, Globe } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const settingsSections = [
  {
    title: 'Notifications',
    icon: Bell,
    settings: [
      { id: 'email', label: 'Email Notifications', desc: 'Receive updates via email', defaultChecked: true },
      { id: 'push', label: 'Push Notifications', desc: 'Browser push notifications', defaultChecked: false },
      { id: 'updates', label: 'Status Updates', desc: 'Get notified when issue status changes', defaultChecked: true },
    ],
  },
  {
    title: 'Privacy',
    icon: Shield,
    settings: [
      { id: 'profile', label: 'Public Profile', desc: 'Allow others to see your profile', defaultChecked: true },
      { id: 'activity', label: 'Activity Visibility', desc: 'Show your activity to others', defaultChecked: false },
    ],
  },
  {
    title: 'Appearance',
    icon: Eye,
    settings: [
      { id: 'compact', label: 'Compact View', desc: 'Use compact card layout', defaultChecked: false },
    ],
  },
  {
    title: 'Language',
    icon: Globe,
    settings: [
      { id: 'english', label: 'English', desc: 'Use English as display language', defaultChecked: true },
    ],
  },
];

const SettingsPage = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your preferences.</p>

        <div className="mt-6 space-y-6">
          {settingsSections.map((section, si) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * si }}
                className="bg-card rounded-xl border border-border p-5 shadow-card"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Icon className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                </div>
                <div className="space-y-4">
                  {section.settings.map((s) => (
                    <div key={s.id} className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">{s.label}</Label>
                        <p className="text-xs text-muted-foreground">{s.desc}</p>
                      </div>
                      <Switch defaultChecked={s.defaultChecked} />
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
