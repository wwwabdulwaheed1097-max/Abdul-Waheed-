import { useState } from 'react';
import { Search as SearchIcon, Users, Hash, FileText, CheckCircle2 } from 'lucide-react';
import { Post, User } from '../types';

interface SearchSectionProps {
  posts: Post[];
  users: User[];
  onOpenProfile: (userId: string) => void;
  onLikePost: (postId: string) => void;
  theme: 'light' | 'dark' | 'glass';
}

export default function SearchSection({
  posts,
  users,
  onOpenProfile,
  onLikePost,
  theme
}: SearchSectionProps) {
  const [query, setQuery] = useState('');
  const [searchTab, setSearchTab] = useState<'all' | 'users' | 'posts' | 'hashtags'>('all');

  const filteredUsers = users.filter(user => 
    user.displayName.toLowerCase().includes(query.toLowerCase()) ||
    user.username.toLowerCase().includes(query.toLowerCase()) ||
    user.bio.toLowerCase().includes(query.toLowerCase())
  );

  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(query.toLowerCase()) ||
    post.hashtags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
  );

  // Group matched hashtags
  const hashtagCounts: { [tag: string]: number } = {};
  posts.forEach(post => {
    post.hashtags.forEach(tag => {
      if (tag.toLowerCase().includes(query.toLowerCase())) {
        hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
      }
    });
  });
  const filteredHashtags = Object.entries(hashtagCounts).map(([tag, count]) => ({ tag, count }));

  const containerStyle = theme === 'glass'
    ? 'bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-white/20 dark:border-zinc-800/20'
    : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800';

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24">
      
      {/* Immersive Search Box */}
      <div className={`p-4 rounded-3xl border shadow-sm ${containerStyle}`}>
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
          <input
            id="explore-search-input"
            type="text"
            placeholder="Search Pulse creators, coding logs, #hashtags, sound waves..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-zinc-900 dark:text-zinc-50 font-medium transition-all"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex gap-2 mt-4 border-t border-zinc-100 dark:border-zinc-800/40 pt-3">
          {[
            { id: 'all', label: 'All Results', icon: SearchIcon },
            { id: 'users', label: 'Pulse Creators', icon: Users },
            { id: 'posts', label: 'Tech Logs', icon: FileText },
            { id: 'hashtags', label: 'Trending Hashtags', icon: Hash }
          ].map(tab => {
            const Icon = tab.icon;
            const active = searchTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`search-tab-btn-${tab.id}`}
                onClick={() => setSearchTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  active 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results view */}
      <div className="space-y-6">
        
        {/* MATCHED USERS SECTION */}
        {(searchTab === 'all' || searchTab === 'users') && filteredUsers.length > 0 && (
          <div className="space-y-3">
            {searchTab === 'all' && query && (
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Matched Creators</h4>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredUsers.map(user => (
                <div 
                  key={user.id}
                  id={`search-result-user-${user.id}`}
                  onClick={() => onOpenProfile(user.id)}
                  className={`p-4 rounded-2xl border shadow-sm hover:shadow-md cursor-pointer flex gap-3 items-center ${containerStyle}`}
                >
                  <img src={user.avatarUrl} alt={user.displayName} className="w-11 h-11 rounded-full object-cover border border-zinc-100" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-display font-semibold text-sm text-zinc-900 dark:text-zinc-50 truncate hover:underline">
                        {user.displayName}
                      </span>
                      {user.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 fill-sky-500" />}
                    </div>
                    <span className="text-xs text-zinc-400 block truncate">@{user.username}</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">{user.bio}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MATCHED HASHTAGS SECTION */}
        {(searchTab === 'all' || searchTab === 'hashtags') && filteredHashtags.length > 0 && (
          <div className="space-y-3">
            {searchTab === 'all' && query && (
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mt-4">Hashtags</h4>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredHashtags.map(({ tag, count }) => (
                <button
                  key={tag}
                  id={`search-result-hashtag-${tag}`}
                  onClick={() => setQuery(`#${tag}`)}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between shadow-sm hover:border-purple-500/30 ${containerStyle}`}
                >
                  <span className="font-semibold text-xs text-zinc-800 dark:text-zinc-200">#{tag}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold">
                    {count} {count === 1 ? 'post' : 'posts'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MATCHED POSTS SECTION */}
        {(searchTab === 'all' || searchTab === 'posts') && filteredPosts.length > 0 && (
          <div className="space-y-3">
            {searchTab === 'all' && query && (
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mt-4">Matched Posts</h4>
            )}
            <div className="space-y-4">
              {filteredPosts.map(post => {
                const author = users.find(u => u.id === post.userId);
                return (
                  <div 
                    key={post.id}
                    id={`search-result-post-${post.id}`}
                    onClick={() => onOpenProfile(post.userId)}
                    className={`p-4 rounded-2xl border shadow-sm hover:shadow-md cursor-pointer ${containerStyle}`}
                  >
                    <div className="flex gap-2 items-center mb-2">
                      <img src={author?.avatarUrl} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{author?.displayName}</span>
                      <span className="text-[10px] text-zinc-400">@{author?.username}</span>
                    </div>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-3 leading-relaxed">
                      {post.content}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Blank state */}
        {query && filteredUsers.length === 0 && filteredPosts.length === 0 && filteredHashtags.length === 0 && (
          <div className="text-center py-12 text-zinc-400">
            <p className="font-semibold text-sm">No wave frequencies matched "{query}"</p>
            <p className="text-xs mt-1">Try typing "design", "coding", "modular", or "travel" to catch some rich creative vibes.</p>
          </div>
        )}

        {!query && (
          <div className="text-center py-12 text-zinc-400 select-none">
            <SearchIcon className="w-12 h-12 text-purple-500/20 mx-auto mb-4" />
            <p className="font-display font-semibold text-sm text-zinc-700 dark:text-zinc-300">Discover Pulse Network</p>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1 leading-relaxed">
              Find inspiring designers, creative sound creators, explore active discussion hashtags, and view recent technical postings.
            </p>
          </div>
        )}

      </div>

    </div>
  );
}
