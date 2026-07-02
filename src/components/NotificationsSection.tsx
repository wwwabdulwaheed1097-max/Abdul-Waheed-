import { Heart, MessageCircle, UserPlus, AtSign, MessageSquareDashed, CheckCheck } from 'lucide-react';
import { Notification, User } from '../types';

interface NotificationsSectionProps {
  notifications: Notification[];
  users: User[];
  onMarkRead: () => void;
  theme: 'light' | 'dark' | 'glass';
}

export default function NotificationsSection({
  notifications,
  users,
  onMarkRead,
  theme
}: NotificationsSectionProps) {

  const getNotifIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-purple-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-sky-500" />;
      case 'mention':
        return <AtSign className="w-5 h-5 text-amber-500" />;
      case 'message':
        return <MessageSquareDashed className="w-5 h-5 text-teal-500" />;
    }
  };

  const getNotifText = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return 'liked your post';
      case 'comment':
        return 'commented on your post';
      case 'follow':
        return 'started following you';
      case 'mention':
        return 'mentioned you in a post';
      case 'message':
        return 'sent you a message';
    }
  };

  const containerStyle = theme === 'glass'
    ? 'bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-white/20 dark:border-zinc-800/20 shadow-md'
    : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 shadow-sm';

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-24">
      
      {/* Title & Clear Action Row */}
      <div className="flex justify-between items-center px-2">
        <h3 className="font-display font-extrabold text-xl text-zinc-900 dark:text-zinc-50">Pulse Activity</h3>
        
        {notifications.some(n => !n.isRead) && (
          <button
            id="btn-mark-all-read"
            onClick={onMarkRead}
            className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 active:scale-95 transition-transform"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* List items */}
      <div className="space-y-3">
        {notifications.map(notif => {
          const sender = users.find(u => u.id === notif.senderId);
          if (!sender) return null;

          return (
            <div
              key={notif.id}
              id={`notif-item-${notif.id}`}
              className={`p-4 rounded-2xl border flex gap-4 items-start relative overflow-hidden transition-all hover:-translate-y-0.5 ${containerStyle} ${
                !notif.isRead 
                  ? 'border-l-4 border-l-purple-500 bg-purple-500/5 dark:bg-purple-500/10' 
                  : ''
              }`}
            >
              <div className="mt-1">
                {getNotifIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <img src={sender.avatarUrl} alt={sender.displayName} className="w-8 h-8 rounded-full object-cover" />
                  <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{sender.displayName}</span>
                  <span className="text-[10px] text-zinc-400">@{sender.username}</span>
                </div>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                  {getNotifText(notif.type)}
                  {notif.message && (
                    <span className="italic block mt-1 px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                      "{notif.message}"
                    </span>
                  )}
                </p>

                <span className="text-[9px] font-semibold text-zinc-400 block mt-2">
                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Unread dot */}
              {!notif.isRead && (
                <div className="w-2.5 h-2.5 rounded-full bg-pink-500 absolute top-4 right-4 animate-pulse" />
              )}
            </div>
          );
        })}

        {notifications.length === 0 && (
          <div className="text-center py-16 text-zinc-400 select-none">
            <CheckCheck className="w-12 h-12 text-zinc-200 dark:text-zinc-800 mx-auto mb-4" />
            <p className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">Quiet frequencies here</p>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto mt-1">
              You will see likes, comment activities, messaging alerts, and followers here when people interact with you.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
