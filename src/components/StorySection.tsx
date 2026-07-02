import { useState, useEffect, FormEvent } from 'react';
import { Plus, X, Heart, Flame, Smile, ThumbsUp } from 'lucide-react';
import { Story, User } from '../types';

interface StorySectionProps {
  stories: Story[];
  users: User[];
  currentUser: User | null;
  onCreateStory: (mediaUrl: string, mediaType: 'image' | 'video') => void;
  onReactStory: (storyId: string, emoji: string) => void;
  theme: 'light' | 'dark' | 'glass';
}

const PRESET_STORIES = [
  'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&h=1000&fit=crop', // nature
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=1000&fit=crop', // cooking
  'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=600&h=1000&fit=crop', // city night
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&h=1000&fit=crop', // cinema
];

export default function StorySection({
  stories,
  users,
  currentUser,
  onCreateStory,
  onReactStory,
  theme
}: StorySectionProps) {
  const [activeStoryUser, setActiveStoryUser] = useState<string | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [showAddStory, setShowAddStory] = useState(false);
  const [storyUrl, setStoryUrl] = useState('');
  const [storyType, setStoryType] = useState<'image' | 'video'>('image');

  // Filter out expired stories (older than 24h)
  const activeStories = stories.filter(
    s => new Date(s.expiresAt).getTime() > Date.now()
  );

  // Group stories by user
  const userStoryGroups: { [userId: string]: Story[] } = {};
  activeStories.forEach(story => {
    if (!userStoryGroups[story.userId]) {
      userStoryGroups[story.userId] = [];
    }
    userStoryGroups[story.userId].push(story);
  });

  const storyUsers = Object.keys(userStoryGroups).map(uid => 
    users.find(u => u.id === uid)
  ).filter(Boolean) as User[];

  // Auto progression for viewing stories
  useEffect(() => {
    if (!activeStoryUser) return;
    const userStories = userStoryGroups[activeStoryUser] || [];
    if (userStories.length === 0) return;

    const timer = setTimeout(() => {
      if (activeStoryIndex < userStories.length - 1) {
        setActiveStoryIndex(prev => prev + 1);
      } else {
        // End of stories for this user
        setActiveStoryUser(null);
        setActiveStoryIndex(0);
      }
    }, 5000); // 5 seconds per story

    return () => clearTimeout(timer);
  }, [activeStoryUser, activeStoryIndex]);

  const handleOpenStories = (userId: string) => {
    setActiveStoryUser(userId);
    setActiveStoryIndex(0);
  };

  const handleCreatePresetStory = (url: string) => {
    onCreateStory(url, 'image');
    setShowAddStory(false);
  };

  const handleCreateCustomStory = (e: FormEvent) => {
    e.preventDefault();
    if (!storyUrl) return;
    onCreateStory(storyUrl, storyType);
    setStoryUrl('');
    setShowAddStory(false);
  };

  const currentViewingStories = activeStoryUser ? (userStoryGroups[activeStoryUser] || []) : [];
  const activeStory = currentViewingStories[activeStoryIndex];

  const glassStyle = theme === 'glass'
    ? 'bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-white/20 dark:border-zinc-800/20'
    : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800';

  return (
    <div className="w-full">
      {/* Horizontal Story Scroller */}
      <div className="flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-none scroll-smooth">
        {/* Create Story Button */}
        {currentUser && (
          <div className="flex flex-col items-center flex-shrink-0 cursor-pointer" onClick={() => setShowAddStory(true)}>
            <div className="relative w-16 h-16 rounded-full p-[3px] border border-zinc-200 dark:border-zinc-800 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 transition-all hover:scale-105">
              <img 
                src={currentUser.avatarUrl} 
                alt="Your Profile" 
                className="w-full h-full rounded-full object-cover grayscale-xs"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-gradient-to-tr from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white border-2 border-white dark:border-zinc-950 shadow-sm">
                <Plus className="w-4 h-4 stroke-[2.5px]" />
              </div>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Your Story</span>
          </div>
        )}

        {/* Story Users */}
        {storyUsers.map(user => {
          const isCurrentUser = user.id === currentUser?.id;
          if (isCurrentUser) return null; // Already handled above

          return (
            <div 
              key={user.id} 
              id={`story-user-${user.id}`}
              className="flex flex-col items-center flex-shrink-0 cursor-pointer"
              onClick={() => handleOpenStories(user.id)}
            >
              <div className="relative w-16 h-16 rounded-full p-[3px] bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center transition-transform hover:scale-105 shadow-md shadow-purple-500/10">
                <div className="w-full h-full rounded-full p-[2px] bg-white dark:bg-zinc-900">
                  <img 
                    src={user.avatarUrl} 
                    alt={user.displayName} 
                    className="w-full h-full rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              <span className="text-xs text-zinc-700 dark:text-zinc-300 mt-1 font-medium max-w-[70px] truncate text-center">
                {user.displayName}
              </span>
            </div>
          );
        })}
      </div>

      {/* Add Story Modal */}
      {showAddStory && (
        <div id="add-story-modal" className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl ${glassStyle} border border-white/20`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-display font-bold text-zinc-900 dark:text-zinc-50">Create a Story</h3>
              <button 
                id="btn-close-story-modal"
                onClick={() => setShowAddStory(false)} 
                className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Presets Grid */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2 block">Choose a beautiful preset</label>
              <div className="grid grid-cols-4 gap-3">
                {PRESET_STORIES.map((url, idx) => (
                  <button
                    key={idx}
                    id={`preset-story-${idx}`}
                    onClick={() => handleCreatePresetStory(url)}
                    className="aspect-[9/16] rounded-xl overflow-hidden relative group border border-white/10 shadow-sm transition-transform active:scale-95"
                  >
                    <img src={url} alt="Preset story" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <Plus className="w-6 h-6 text-white opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <form onSubmit={handleCreateCustomStory} className="space-y-4">
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
                <label className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2 block">Or paste a custom URL</label>
                <input
                  id="story-url-input"
                  type="url"
                  placeholder="https://example.com/story-image.jpg"
                  value={storyUrl}
                  onChange={e => setStoryUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Type:</span>
                <label className="flex items-center gap-1 text-sm text-zinc-700 dark:text-zinc-300">
                  <input
                    type="radio"
                    name="story-type"
                    checked={storyType === 'image'}
                    onChange={() => setStoryType('image')}
                    className="accent-purple-500"
                  />
                  Photo
                </label>
                <label className="flex items-center gap-1 text-sm text-zinc-700 dark:text-zinc-300">
                  <input
                    type="radio"
                    name="story-type"
                    checked={storyType === 'video'}
                    onChange={() => setStoryType('video')}
                    className="accent-purple-500"
                  />
                  Video
                </label>
              </div>

              <button
                id="btn-publish-story"
                type="submit"
                disabled={!storyUrl}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-40 shadow-lg shadow-purple-500/20 active:scale-98 transition-all"
              >
                Publish Story
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Story Viewer Overlay */}
      {activeStoryUser && activeStory && (
        <div id="story-viewer" className="fixed inset-0 bg-zinc-950/95 z-[200] flex flex-col items-center justify-center">
          <div className="relative w-full max-w-lg aspect-[9/16] bg-black md:rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            
            {/* Top progress indicator bars */}
            <div className="absolute top-4 left-4 right-4 flex gap-1 z-30">
              {currentViewingStories.map((_, idx) => (
                <div key={idx} className="flex-1 h-[3px] bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-white rounded-full transition-all duration-5000 linear ${
                      idx < activeStoryIndex 
                        ? 'w-full' 
                        : idx === activeStoryIndex 
                          ? 'animate-story-progress' 
                          : 'w-0'
                    }`}
                    style={{
                      animationDuration: '5000ms',
                      animationTimingFunction: 'linear',
                      animationFillMode: 'forwards'
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Author info & close button */}
            <div className="absolute top-8 left-4 right-4 flex justify-between items-center z-30">
              <div className="flex items-center gap-2">
                <img 
                  src={users.find(u => u.id === activeStoryUser)?.avatarUrl} 
                  alt="Author" 
                  className="w-8 h-8 rounded-full border border-white/40 object-cover"
                />
                <span className="text-white text-sm font-semibold tracking-wide drop-shadow">
                  {users.find(u => u.id === activeStoryUser)?.displayName}
                </span>
                <span className="text-white/60 text-xs drop-shadow">
                  {new Date(activeStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <button 
                id="btn-close-viewer"
                onClick={() => { setActiveStoryUser(null); setActiveStoryIndex(0); }}
                className="p-1 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main story media */}
            <div className="flex-1 flex items-center justify-center bg-zinc-900 relative">
              {activeStory.mediaType === 'video' ? (
                <video 
                  src={activeStory.mediaUrl} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover"
                />
              ) : (
                <img 
                  src={activeStory.mediaUrl} 
                  alt="Story content" 
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Interactive Story Reactions and Feedback Bar */}
            <div className="absolute bottom-6 left-4 right-4 flex flex-col gap-3 z-30">
              <div className="flex items-center justify-center gap-4 bg-black/50 backdrop-blur-lg px-4 py-2.5 rounded-full border border-white/10">
                {[
                  { emoji: '🔥', icon: Flame, color: 'text-amber-500' },
                  { emoji: '❤️', icon: Heart, color: 'text-pink-500' },
                  { emoji: '😂', icon: Smile, color: 'text-yellow-400' },
                  { emoji: '👍', icon: ThumbsUp, color: 'text-sky-400' }
                ].map(({ emoji, icon: Icon, color }) => {
                  const hasReacted = activeStory.reactions.some(
                    r => r.userId === currentUser?.id && r.emoji === emoji
                  );
                  return (
                    <button
                      key={emoji}
                      id={`react-story-${activeStory.id}-${emoji}`}
                      onClick={() => onReactStory(activeStory.id, emoji)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all active:scale-90 hover:bg-white/10 ${
                        hasReacted ? 'bg-white/20 scale-105 border border-white/20' : 'bg-transparent'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${color}`} />
                      <span className="text-white text-xs font-bold">
                        {activeStory.reactions.filter(r => r.emoji === emoji).length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
