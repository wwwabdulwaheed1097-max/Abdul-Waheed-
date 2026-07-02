import { useState, useRef, useEffect, FormEvent } from 'react';
import { Heart, MessageCircle, Share2, Plus, Volume2, VolumeX, ChevronUp, ChevronDown, CheckCircle2 } from 'lucide-react';
import { ShortVideo, User } from '../types';

interface ShortsSectionProps {
  shortVideos: ShortVideo[];
  users: User[];
  currentUser: User | null;
  onLikeShort: (shortId: string) => void;
  onFollowCreator: (creatorId: string) => void;
  theme: 'light' | 'dark' | 'glass';
}

export default function ShortsSection({
  shortVideos,
  users,
  currentUser,
  onLikeShort,
  onFollowCreator,
  theme
}: ShortsSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState<{ [id: string]: { author: string; avatar: string; text: string }[] }>({
    short_1: [
      { author: 'Alex Rivers', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop', text: 'Clean spin! Which pressing is that?' },
      { author: 'Marcus Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop', text: 'Audiophile grade setup indeed' }
    ]
  });

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const handleNext = () => {
    if (activeIndex < shortVideos.length - 1) {
      setActiveIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex(prev => prev - 1);
    }
  };

  // Play/Pause current video on index change
  useEffect(() => {
    videoRefs.current.forEach((ref, idx) => {
      if (ref) {
        if (idx === activeIndex) {
          ref.play().catch(e => console.log('Autoplay blocked initially', e));
        } else {
          ref.pause();
        }
      }
    });
  }, [activeIndex]);

  const activeShort = shortVideos[activeIndex];
  if (!activeShort) return <div className="text-center text-zinc-500 py-12">No PulseShorts available yet.</div>;

  const creator = users.find(u => u.id === activeShort.userId);
  const isLiked = currentUser ? activeShort.likes.includes(currentUser.id) : false;
  const isFollowing = currentUser && creator ? currentUser.following.includes(creator.id) : false;

  const handleLike = () => {
    onLikeShort(activeShort.id);
  };

  const handleCommentSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser) return;
    const newComment = {
      author: currentUser.displayName,
      avatar: currentUser.avatarUrl,
      text: commentText
    };
    setCommentsList(prev => ({
      ...prev,
      [activeShort.id]: [...(prev[activeShort.id] || []), newComment]
    }));
    setCommentText('');
  };

  return (
    <div className="max-w-md mx-auto h-[calc(100vh-120px)] relative flex bg-zinc-950 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
      
      {/* Video Autoplay player */}
      <div className="flex-1 h-full relative flex items-center justify-center bg-black">
        <video
          ref={el => { videoRefs.current[activeIndex] = el; }}
          src={activeShort.videoUrl}
          loop
          muted={isMuted}
          playsInline
          autoPlay
          className="w-full h-full object-cover"
        />

        {/* Video Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />

        {/* Sound Toggle */}
        <button
          id="btn-shorts-sound-toggle"
          onClick={() => setIsMuted(!isMuted)}
          className="absolute top-4 right-4 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full z-10 backdrop-blur-md active:scale-90 transition-transform"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        {/* Swipe Guides / Nav Buttons */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
          <button
            id="btn-shorts-prev"
            onClick={handlePrev}
            disabled={activeIndex === 0}
            className="p-2 bg-black/40 hover:bg-black/60 disabled:opacity-20 text-white rounded-full backdrop-blur-md transition-transform active:scale-95"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <button
            id="btn-shorts-next"
            onClick={handleNext}
            disabled={activeIndex === shortVideos.length - 1}
            className="p-2 bg-black/40 hover:bg-black/60 disabled:opacity-20 text-white rounded-full backdrop-blur-md transition-transform active:scale-95"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Interactions Floating list */}
        <div className="absolute right-4 bottom-24 flex flex-col gap-5 items-center z-10">
          
          {/* Creator Avatar with follow option */}
          {creator && (
            <div className="relative">
              <img
                src={creator.avatarUrl}
                alt={creator.displayName}
                className="w-11 h-11 rounded-full object-cover border-2 border-white"
              />
              {currentUser && creator.id !== currentUser.id && !isFollowing && (
                <button
                  id={`btn-shorts-follow-${creator.id}`}
                  onClick={() => onFollowCreator(creator.id)}
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gradient-to-tr from-pink-500 to-purple-500 text-white rounded-full p-0.5 shadow border border-black"
                >
                  <Plus className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Like */}
          <button
            id={`btn-shorts-like-${activeShort.id}`}
            onClick={handleLike}
            className="flex flex-col items-center gap-1 text-white hover:text-pink-500 active:scale-90 transition-all"
          >
            <div className="p-3 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md">
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-pink-500 text-pink-500' : ''}`} />
            </div>
            <span className="text-xs font-bold">{activeShort.likes.length}</span>
          </button>

          {/* Comments */}
          <button
            id="btn-shorts-comments-toggle"
            onClick={() => setCommentsOpen(true)}
            className="flex flex-col items-center gap-1 text-white hover:text-purple-400 active:scale-90 transition-all"
          >
            <div className="p-3 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md">
              <MessageCircle className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold">{(commentsList[activeShort.id] || []).length}</span>
          </button>

          {/* Share */}
          <button
            id="btn-shorts-share"
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/shorts/${activeShort.id}`);
              alert('Short video link copied to clipboard! 🔗');
            }}
            className="flex flex-col items-center gap-1 text-white hover:text-teal-400 active:scale-90 transition-all"
          >
            <div className="p-3 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md">
              <Share2 className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold">Share</span>
          </button>

        </div>

        {/* Video Footer Info overlay */}
        <div className="absolute bottom-4 left-4 right-16 z-10 text-white flex flex-col gap-2 select-none">
          {creator && (
            <div className="flex items-center gap-2">
              <span className="font-display font-semibold text-sm hover:underline flex items-center gap-1">
                {creator.displayName}
                {creator.isVerified && <CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400" />}
              </span>
              <span className="text-white/60 text-xs">@{creator.username}</span>
            </div>
          )}
          <p className="text-sm line-clamp-2 leading-relaxed text-zinc-100">
            {activeShort.caption}
          </p>
          <div className="flex gap-2 flex-wrap">
            {activeShort.hashtags.map(tag => (
              <span key={tag} className="text-xs font-semibold text-purple-300">
                #{tag}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Side drawer for comments overlay */}
      {commentsOpen && (
        <div id="shorts-comments-overlay" className="absolute inset-x-0 bottom-0 bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800 h-2/3 rounded-t-3xl z-30 p-5 flex flex-col animate-slide-up">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-800">
            <span className="text-sm font-bold text-white">Comments</span>
            <button
              id="btn-close-shorts-comments"
              onClick={() => setCommentsOpen(false)}
              className="text-zinc-400 hover:text-white text-xs font-semibold"
            >
              Close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {(commentsList[activeShort.id] || []).map((c, idx) => (
              <div key={idx} className="flex gap-3">
                <img src={c.avatar} alt={c.author} className="w-7 h-7 rounded-full object-cover" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-zinc-300">{c.author}</span>
                  </div>
                  <p className="text-sm text-zinc-100 mt-0.5">{c.text}</p>
                </div>
              </div>
            ))}
            {(commentsList[activeShort.id] || []).length === 0 && (
              <div className="text-center text-xs text-zinc-500 py-8">Be the first to comment on this short clip!</div>
            )}
          </div>

          <form onSubmit={handleCommentSubmit} className="mt-4 flex gap-2">
            <input
              id="shorts-comment-input"
              type="text"
              placeholder="Add comment..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              className="flex-1 bg-zinc-800 border-0 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <button
              id="btn-shorts-comment-submit"
              type="submit"
              className="px-4 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 active:scale-95"
            >
              Post
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
