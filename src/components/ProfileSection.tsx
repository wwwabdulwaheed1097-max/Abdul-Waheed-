import { useState } from 'react';
import { CheckCircle2, MapPin, Calendar, Heart, MessageCircle, FileText, Bookmark, Users } from 'lucide-react';
import { User, Post, Comment } from '../types';

interface ProfileSectionProps {
  userId: string;
  users: User[];
  posts: Post[];
  currentUser: User | null;
  comments: { [postId: string]: Comment[] };
  savedPosts: string[];
  onFollowUser: (targetUserId: string) => void;
  onLikePost: (postId: string) => void;
  onSavePost: (postId: string) => void;
  theme: 'light' | 'dark' | 'glass';
}

export default function ProfileSection({
  userId,
  users,
  posts,
  currentUser,
  comments,
  savedPosts,
  onFollowUser,
  onLikePost,
  onSavePost,
  theme
}: ProfileSectionProps) {
  const [profileTab, setProfileTab] = useState<'posts' | 'saved'>('posts');

  const profileUser = users.find(u => u.id === userId) || currentUser;
  if (!profileUser) return <div className="text-center text-zinc-500 py-12">User profile not found.</div>;

  const userPosts = posts.filter(p => p.userId === profileUser.id);
  const userSavedPosts = posts.filter(p => savedPosts.includes(p.id));

  const isMe = profileUser.id === currentUser?.id;
  const isFollowing = currentUser?.following.includes(profileUser.id);

  const containerStyle = theme === 'glass'
    ? 'bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-white/20 dark:border-zinc-800/20 shadow-lg'
    : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 shadow-sm';

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24">
      {/* Profile Header Block */}
      <div className={`rounded-3xl border overflow-hidden ${containerStyle}`}>
        {/* Cover image */}
        <div className="h-48 relative bg-zinc-200 dark:bg-zinc-800">
          <img 
            src={profileUser.coverUrl} 
            alt="Cover background" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Profile Stats and Info overlapping cover */}
        <div className="px-6 pb-6 relative">
          <div className="flex justify-between items-end -mt-16 mb-4">
            <img
              src={profileUser.avatarUrl}
              alt={profileUser.displayName}
              className="w-28 h-28 rounded-full border-4 border-white dark:border-zinc-900 object-cover shadow-md bg-zinc-100"
              referrerPolicy="no-referrer"
            />
            
            {/* Follow/Unfollow button or Edit placeholder */}
            {!isMe && currentUser && (
              <button
                id={`btn-profile-follow-${profileUser.id}`}
                onClick={() => onFollowUser(profileUser.id)}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md ${
                  isFollowing
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/50'
                    : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90 shadow-purple-500/20'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow Creator'}
              </button>
            )}
            {isMe && (
              <span className="px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs font-semibold select-none border border-zinc-200/50 dark:border-zinc-800/20">
                Host Account
              </span>
            )}
          </div>

          {/* Identity details */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <h2 className="font-display font-extrabold text-2xl text-zinc-900 dark:text-zinc-50">
                {profileUser.displayName}
              </h2>
              {profileUser.isVerified && (
                <CheckCircle2 className="w-5 h-5 text-sky-500 fill-sky-500 stroke-[2.5px]" />
              )}
            </div>
            <span className="text-sm font-semibold text-zinc-400 block">@{profileUser.username}</span>
          </div>

          {/* Bio text */}
          <p className="mt-4 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal whitespace-pre-wrap">
            {profileUser.bio}
          </p>

          {/* Metadata lines */}
          <div className="flex flex-wrap gap-4 mt-4 text-xs font-semibold text-zinc-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              Pulse Cloud Ingress
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Joined {new Date(profileUser.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}
            </span>
          </div>

          {/* Follow statistics row */}
          <div className="flex gap-6 mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800/50">
            <div className="flex items-baseline gap-1">
              <span className="font-display font-extrabold text-lg text-zinc-900 dark:text-zinc-50">
                {profileUser.followersCount.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-zinc-400">followers</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-display font-extrabold text-lg text-zinc-900 dark:text-zinc-50">
                {profileUser.followingCount.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-zinc-400">following</span>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs list (Posts vs Saved) */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 font-semibold text-sm">
        <button
          id="profile-tab-btn-posts"
          onClick={() => setProfileTab('posts')}
          className={`flex-1 py-3 text-center border-b-2 transition-all flex items-center justify-center gap-2 ${
            profileTab === 'posts'
              ? 'border-purple-500 text-purple-600 dark:text-purple-400 font-bold'
              : 'border-transparent text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Postings ({userPosts.length})</span>
        </button>
        {isMe && (
          <button
            id="profile-tab-btn-saved"
            onClick={() => setProfileTab('saved')}
            className={`flex-1 py-3 text-center border-b-2 transition-all flex items-center justify-center gap-2 ${
              profileTab === 'saved'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-600'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved Bookmarks ({userSavedPosts.length})</span>
          </button>
        )}
      </div>

      {/* Grid of actual posts */}
      <div className="space-y-4">
        {profileTab === 'posts' ? (
          userPosts.map(post => {
            const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;
            return (
              <div key={post.id} className={`p-5 rounded-2xl border ${containerStyle}`}>
                <p className="text-sm text-zinc-800 dark:text-zinc-100 whitespace-pre-wrap">{post.content}</p>
                {post.mediaUrl && post.type === 'image' && (
                  <img src={post.mediaUrl} alt="post item" className="mt-3 rounded-xl w-full object-cover max-h-60" />
                )}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/40 text-xs text-zinc-400 font-bold">
                  <button id={`btn-profile-like-${post.id}`} onClick={() => onLikePost(post.id)} className={`flex items-center gap-1 hover:text-pink-500 ${isLiked ? 'text-pink-500' : ''}`}>
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-pink-500 text-pink-500' : ''}`} />
                    <span>{post.likes.length}</span>
                  </button>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{(comments[post.id] || []).length}</span>
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          userSavedPosts.map(post => {
            const author = users.find(u => u.id === post.userId);
            return (
              <div key={post.id} className={`p-5 rounded-2xl border ${containerStyle}`}>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 mb-1 block">Saved from @{author?.username}</span>
                <p className="text-sm text-zinc-800 dark:text-zinc-100 whitespace-pre-wrap">{post.content}</p>
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/40 text-xs text-zinc-400 font-bold">
                  <button id={`btn-profile-saved-like-${post.id}`} onClick={() => onLikePost(post.id)} className="flex items-center gap-1 hover:text-pink-500">
                    <Heart className="w-4 h-4" />
                    <span>{post.likes.length}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}

        {profileTab === 'posts' && userPosts.length === 0 && (
          <div className="text-center py-12 text-zinc-400">No creative waves shared yet. Write your first post on the Home page!</div>
        )}

        {profileTab === 'saved' && userSavedPosts.length === 0 && (
          <div className="text-center py-12 text-zinc-400">No bookmarks saved yet. Click the bookmark icon on posts in the feed!</div>
        )}
      </div>

    </div>
  );
}
