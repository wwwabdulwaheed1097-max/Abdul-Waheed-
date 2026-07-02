import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { 
  Heart, MessageCircle, Share2, Bookmark, BarChart3, Image, Video, 
  Smile, Send, MoreHorizontal, ShieldAlert, Ban, EyeOff, Sparkles, CheckCircle2,
  Pin, PinOff, Calendar, Languages, Check, Copy, AlertTriangle, Trash2, Clock, CheckCircle
} from 'lucide-react';
import { Post, User, Comment } from '../types';

interface FeedSectionProps {
  posts: Post[];
  users: User[];
  currentUser: User | null;
  comments: { [postId: string]: Comment[] };
  savedPosts: string[];
  onCreatePost: (type: 'text' | 'image' | 'video' | 'poll', content: string, mediaUrl?: string, videoUrl?: string, pollData?: { question: string; options: string[] }) => void;
  onLikePost: (postId: string) => void;
  onSavePost: (postId: string) => void;
  onVotePoll: (postId: string, optionId: string) => void;
  onAddComment: (postId: string, content: string) => void;
  onReportContent: (type: 'post' | 'comment' | 'user', contentId: string, reason: string) => void;
  onBlockUser: (userId: string) => void;
  onOpenProfile: (userId: string) => void;
  theme: 'light' | 'dark' | 'glass';
}

const POST_PRESETS = [
  { label: 'Sunset Glow', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=450&fit=crop' },
  { label: 'Digital Abstract', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=450&fit=crop' },
  { label: 'Cozy Workspace', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop' },
];

const SUGGESTED_CAPTIONS = [
  "Riding the synthesized sine waves. 🎹✨ There is nothing quite like a fully analog modular setup. #ModularWave #PulseSynthesizer",
  "Pulsing through the digital cosmos. 🌌 Let's build a new audio patch today! #CosmicSound #SynthArt",
  "Late night coffee and lo-fi loops. ☕️🎧 Sometimes the simplest chord progression tells the deepest story. #LofiPulsing",
  "Unleashing creative loops onto the grid. What frequency are we tuning into tonight? ⚡️ #SynthesizerCreators #PulseSocial"
];

const AI_STYLE_PRESETS = [
  { label: 'Cosmic Cyberpunk', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&h=450&fit=crop', desc: 'Glowing neons & tech-wave grids' },
  { label: 'Solar Dream', url: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=800&h=450&fit=crop', desc: 'Golden hours & natural canyons' },
  { label: 'Retro Vaporwave', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&h=450&fit=crop', desc: 'Pink-cyan wireframe lattices' },
  { label: 'Minimal Vector', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=450&fit=crop', desc: 'Abstract shapes & elegant noise' }
];

interface PostDraft {
  id: string;
  type: 'text' | 'image' | 'video' | 'poll';
  content: string;
  mediaUrl?: string;
  videoUrl?: string;
  createdAt: string;
}

interface ScheduledPost {
  id: string;
  type: 'text' | 'image' | 'video' | 'poll';
  content: string;
  mediaUrl?: string;
  videoUrl?: string;
  scheduledTime: string;
  createdAt: string;
}

export default function FeedSection({
  posts,
  users,
  currentUser,
  comments,
  savedPosts,
  onCreatePost,
  onLikePost,
  onSavePost,
  onVotePoll,
  onAddComment,
  onReportContent,
  onBlockUser,
  onOpenProfile,
  theme
}: FeedSectionProps) {
  const [postType, setPostType] = useState<'text' | 'image' | 'video' | 'poll'>('text');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  
  // Poll State
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  // UI state for posts
  const [activeMenuPost, setActiveMenuPost] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<{ [postId: string]: boolean }>({});
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Infinite scroll simulation
  const [visibleCount, setVisibleCount] = useState(5);
  const [loadingMore, setLoadingMore] = useState(false);

  // Remaining user specification states (AI, Pinned, Drafts, Schedules)
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [activeAIVibe, setActiveAIVibe] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiModerationBlocked, setAiModerationBlocked] = useState(false);
  const [aiModerationNotice, setAiModerationNotice] = useState('');

  // Drafts & Scheduled states
  const [drafts, setDrafts] = useState<PostDraft[]>(() => 
    JSON.parse(localStorage.getItem('pulse_drafts') || '[]')
  );
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>(() => 
    JSON.parse(localStorage.getItem('pulse_scheduled_posts') || '[]')
  );
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [scheduleTimeInput, setScheduleTimeInput] = useState('');

  // Pinned Posts state
  const [pinnedPostIds, setPinnedPostIds] = useState<string[]>(() => 
    JSON.parse(localStorage.getItem('pulse_pinned_posts') || '[]')
  );

  // AI Translation state
  const [translatingPostId, setTranslatingPostId] = useState<string | null>(null);
  const [translatedContent, setTranslatedContent] = useState<{ [postId: string]: string }>({});

  // Sync Drafts, Schedules, and Pinned to Local Storage
  useEffect(() => {
    localStorage.setItem('pulse_drafts', JSON.stringify(drafts));
  }, [drafts]);

  useEffect(() => {
    localStorage.setItem('pulse_scheduled_posts', JSON.stringify(scheduledPosts));
  }, [scheduledPosts]);

  useEffect(() => {
    localStorage.setItem('pulse_pinned_posts', JSON.stringify(pinnedPostIds));
  }, [pinnedPostIds]);

  // Auto-hide toast
  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toastMessage]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
  };

  // Run AI Moderation checking logic
  const checkAIModeration = (text: string): boolean => {
    const sensitiveWords = ['scam', 'spam', 'hack', 'abuse', 'cheat', 'harmful', 'exploit', 'phishing'];
    const matched = sensitiveWords.find(word => text.toLowerCase().includes(word));
    if (matched) {
      setAiModerationBlocked(true);
      setAiModerationNotice(`! AI MODERATION DETECTED HARMFUL / UNSAFE CONTENT: Your post contains the sensitive token "${matched}". Pulse network policies enforce strict rules guarding against spam, exploits, or abuse. Please modify or discard.`);
      return false;
    }
    setAiModerationBlocked(false);
    setAiModerationNotice('');
    return true;
  };

  const handleCreatePostSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim() && postType === 'text') return;

    // AI Moderation Scan check
    if (!checkAIModeration(content)) {
      triggerToast('Post blocked by AI moderation. Please check flags.');
      return;
    }

    if (postType === 'poll') {
      const validOptions = pollOptions.filter(opt => opt.trim() !== '');
      if (validOptions.length < 2 || !pollQuestion.trim()) {
        triggerToast('Please provide a question and at least 2 options.');
        return;
      }
      onCreatePost('poll', content, undefined, undefined, {
        question: pollQuestion,
        options: validOptions
      });
    } else {
      onCreatePost(
        postType,
        content,
        mediaUrl || undefined,
        videoUrl || undefined
      );
    }

    // Reset Form
    resetForm();
    triggerToast('Post created successfully! ⚡️');
  };

  const resetForm = () => {
    setContent('');
    setMediaUrl('');
    setVideoUrl('');
    setPollQuestion('');
    setPollOptions(['', '']);
    setPostType('text');
    setActiveAIVibe('');
    setAiModerationBlocked(false);
    setAiModerationNotice('');
    setShowSchedulePicker(false);
    setScheduleTimeInput('');
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const handlePollOptionChange = (index: number, val: string) => {
    const updated = [...pollOptions];
    updated[index] = val;
    setPollOptions(updated);
  };

  const handleShare = (postId: string) => {
    const link = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(link).then(() => {
      triggerToast('Post link copied to clipboard! 🔗');
    });
  };

  const handleCommentSubmit = (postId: string) => {
    const text = commentInputs[postId] || '';
    if (!text.trim()) return;
    onAddComment(postId, text);
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    triggerToast('Comment added!');
  };

  const loadMorePosts = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 5);
      setLoadingMore(false);
    }, 800);
  };

  // AI Content Generator functions
  const handleSuggestAICaption = () => {
    setAiLoading(true);
    setTimeout(() => {
      const idx = Math.floor(Math.random() * SUGGESTED_CAPTIONS.length);
      setContent(SUGGESTED_CAPTIONS[idx]);
      setAiLoading(false);
      triggerToast('AI caption suggested and loaded! ✨');
    }, 700);
  };

  const handleApplyAITone = (vibe: string) => {
    if (!content.trim()) {
      triggerToast('Type some text first so the AI can refine your tone!');
      return;
    }
    setAiLoading(true);
    setTimeout(() => {
      let refined = content.replace(/🔮|✨|⚡️|🌟|🚀/g, '').trim();
      if (vibe === 'mystical') {
        refined = `🔮 ✨ "${refined}" ✨ 🔮\nLet the synthesized waves speak to the void. #AuraVibes`;
      } else if (vibe === 'cyberpunk') {
        refined = `⚡️ [SYS_LOCK // ${refined.toUpperCase()}] // WAVE_LOCK_ACTIVE ⚡️`;
      } else if (vibe === 'inspiring') {
        refined = `🌟 "${refined}" 🌟 Keep making waves, loops, and building beautiful synthesizers! 🚀 #PulseLoop`;
      }
      setContent(refined);
      setActiveAIVibe(vibe);
      setAiLoading(false);
      triggerToast(`AI tone refined to ${vibe.toUpperCase()}! 💫`);
    }, 600);
  };

  const handleGenerateAIImage = (presetUrl: string, styleLabel: string) => {
    setAiLoading(true);
    setTimeout(() => {
      setMediaUrl(presetUrl);
      setPostType('image');
      setAiLoading(false);
      triggerToast(`AI asset style "${styleLabel}" generated & selected! 🎨`);
    }, 800);
  };

  // Draft Actions
  const handleSaveDraft = () => {
    if (!content.trim() && !mediaUrl) {
      triggerToast('Cannot save empty draft!');
      return;
    }
    const newDraft: PostDraft = {
      id: `draft_${Date.now()}`,
      type: postType,
      content,
      mediaUrl: mediaUrl || undefined,
      videoUrl: videoUrl || undefined,
      createdAt: new Date().toISOString()
    };
    setDrafts([newDraft, ...drafts]);
    triggerToast('Post draft saved securely! 💾');
    resetForm();
  };

  const handleLoadDraft = (draft: PostDraft) => {
    setPostType(draft.type);
    setContent(draft.content);
    setMediaUrl(draft.mediaUrl || '');
    setVideoUrl(draft.videoUrl || '');
    setDrafts(prev => prev.filter(d => d.id !== draft.id));
    triggerToast('Draft restored to composer!');
  };

  const handleDeleteDraft = (draftId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDrafts(prev => prev.filter(d => d.id !== draftId));
    triggerToast('Draft deleted.');
  };

  // Scheduled Post Actions
  const handleScheduleSubmit = () => {
    if (!scheduleTimeInput) {
      triggerToast('Please choose a scheduling date and time.');
      return;
    }
    if (!content.trim() && !mediaUrl) {
      triggerToast('Cannot schedule an empty post!');
      return;
    }
    const newScheduled: ScheduledPost = {
      id: `sched_${Date.now()}`,
      type: postType,
      content,
      mediaUrl: mediaUrl || undefined,
      videoUrl: videoUrl || undefined,
      scheduledTime: scheduleTimeInput,
      createdAt: new Date().toISOString()
    };
    setScheduledPosts([newScheduled, ...scheduledPosts]);
    triggerToast(`Post scheduled for ${new Date(scheduleTimeInput).toLocaleString()}! 📅`);
    resetForm();
  };

  const handleDeleteScheduled = (id: string) => {
    setScheduledPosts(prev => prev.filter(s => s.id !== id));
    triggerToast('Scheduled post cancelled.');
  };

  // Pinned Actions
  const handleTogglePin = (postId: string) => {
    const isPinned = pinnedPostIds.includes(postId);
    if (isPinned) {
      setPinnedPostIds(prev => prev.filter(id => id !== postId));
      triggerToast('Post unpinned from top of feed.');
    } else {
      setPinnedPostIds([postId, ...pinnedPostIds]);
      triggerToast('Post pinned to top of feed! 📌');
    }
    setActiveMenuPost(null);
  };

  // AI Translate Action
  const handleTranslatePost = (postId: string, originalText: string) => {
    if (translatedContent[postId]) {
      // Revert to original
      const updated = { ...translatedContent };
      delete updated[postId];
      setTranslatedContent(updated);
      return;
    }

    setTranslatingPostId(postId);
    setTimeout(() => {
      // Pick a smart target translation based on active system lang
      const activeSysLang = localStorage.getItem('pulse_lang') || 'en';
      let translated = "";
      if (activeSysLang === 'es') {
        translated = `¡Ondas sintetizadas traducidas! 🔮 "${originalText}" (Traducido automáticamente del Pulse AI Engine)`;
      } else if (activeSysLang === 'fr') {
        translated = `Ondes de synthétiseur traduites ! 🔮 "${originalText}" (Traduit automatiquement par Pulse AI)`;
      } else if (activeSysLang === 'ja') {
        translated = `シンセウェーブ翻訳完了！🔮 "${originalText}" (Pulse AI 自動翻訳)`;
      } else {
        translated = `Pulse AI Translated Waveform: 🔮 "${originalText}" (Translated to global English by Pulse DeepMind Translation)`;
      }
      setTranslatedContent(prev => ({ ...prev, [postId]: translated }));
      setTranslatingPostId(null);
      triggerToast('Post translated instantly by AI! 🌐');
    }, 700);
  };

  // Sort posts putting Pinned Posts AT THE TOP
  const sortedPosts = [...posts].sort((a, b) => {
    const aPinned = pinnedPostIds.includes(a.id);
    const bPinned = pinnedPostIds.includes(b.id);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const containerStyle = theme === 'glass'
    ? 'bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-white/20 dark:border-zinc-800/20'
    : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800';

  const inputStyle = 'w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all';

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div id="toast" className="fixed top-6 left-1/2 transform -translate-x-1/2 px-5 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black font-medium text-sm rounded-full shadow-2xl z-[250] flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-purple-400 dark:text-purple-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Create Post Composer */}
      {currentUser && (
        <div className={`p-5 rounded-3xl border shadow-sm transition-all ${containerStyle}`}>
          <div className="flex gap-4">
            <img 
              src={currentUser.avatarUrl} 
              alt="Avatar" 
              className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1">
              <textarea
                id="post-textarea"
                placeholder="What's pulsing on your mind? Use #hashtags or @mentions..."
                value={content}
                onChange={e => {
                  setContent(e.target.value);
                  // Run dynamic moderation check
                  checkAIModeration(e.target.value);
                }}
                rows={3}
                className="w-full bg-transparent border-0 resize-none text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-0 text-md placeholder-zinc-400 dark:placeholder-zinc-500"
              />

              {/* AI Moderation warning popup panel */}
              {aiModerationBlocked && (
                <div id="ai-mod-warning" className="mb-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs font-bold animate-pulse flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{aiModerationNotice}</span>
                </div>
              )}

              {/* Dynamic Inputs Based on Type */}
              {postType === 'image' && (
                <div className="space-y-3 mt-3 animate-fade-in">
                  <input
                    id="post-image-input"
                    type="url"
                    placeholder="Paste image URL (e.g. https://...)"
                    value={mediaUrl}
                    onChange={e => setMediaUrl(e.target.value)}
                    className={inputStyle}
                  />
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {POST_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        id={`post-preset-${idx}`}
                        type="button"
                        onClick={() => setMediaUrl(preset.url)}
                        className="px-3 py-1 text-xs font-semibold rounded-full border border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 active:scale-95 transition-all shrink-0"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  {mediaUrl && (
                    <div className="aspect-video rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm">
                      <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              )}

              {postType === 'video' && (
                <div className="space-y-3 mt-3 animate-fade-in">
                  <input
                    id="post-video-input"
                    type="url"
                    placeholder="Paste MP4 Video URL (e.g. https://...)"
                    value={videoUrl}
                    onChange={e => setVideoUrl(e.target.value)}
                    className={inputStyle}
                  />
                  {videoUrl && (
                    <div className="aspect-video rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm bg-black">
                      <video src={videoUrl} controls className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              )}

              {postType === 'poll' && (
                <div className="space-y-3 mt-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50 animate-fade-in">
                  <input
                    id="poll-question-input"
                    type="text"
                    placeholder="Ask a community question..."
                    value={pollQuestion}
                    onChange={e => setPollQuestion(e.target.value)}
                    className={inputStyle}
                  />
                  <div className="space-y-2">
                    {pollOptions.map((opt, idx) => (
                      <input
                        key={idx}
                        id={`poll-option-input-${idx}`}
                        type="text"
                        placeholder={`Option ${idx + 1}`}
                        value={opt}
                        onChange={e => handlePollOptionChange(idx, e.target.value)}
                        className={`${inputStyle} py-2 text-sm`}
                      />
                    ))}
                  </div>
                  {pollOptions.length < 5 && (
                    <button
                      id="btn-add-poll-option"
                      type="button"
                      onClick={handleAddPollOption}
                      className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 mt-1"
                    >
                      + Add Option
                    </button>
                  )}
                </div>
              )}

              {/* Advanced Scheduling block */}
              {showSchedulePicker && (
                <div id="schedule-picker-panel" className="mt-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/80 animate-fade-in space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold">
                    <Calendar className="w-4 h-4" />
                    <span>Schedule Post Release</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      id="schedule-time-picker"
                      type="datetime-local"
                      value={scheduleTimeInput}
                      onChange={e => setScheduleTimeInput(e.target.value)}
                      className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-purple-500 font-bold text-xs"
                    />
                    <button
                      id="btn-confirm-schedule"
                      type="button"
                      onClick={handleScheduleSubmit}
                      className="px-4 py-2 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 shadow-sm active:scale-95"
                    >
                      Apply Schedule
                    </button>
                  </div>
                </div>
              )}

              {/* Expandable AI ASSISTANT PANEL */}
              {showAIPanel && (
                <div id="ai-assistant-panel" className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 border border-purple-500/10 animate-fade-in space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-500 animate-spin" />
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">Pulse AI Creator Assistant</span>
                    </div>
                    {aiLoading && (
                      <span className="text-[10px] text-purple-500 animate-pulse font-semibold">AI is analyzing waves...</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Caption suggestions & Tone */}
                    <div className="space-y-2">
                      <span className="font-bold text-zinc-400 uppercase text-[9px] block">Acoustic Copywriting</span>
                      <button
                        id="btn-ai-caption"
                        type="button"
                        onClick={handleSuggestAICaption}
                        className="w-full text-left py-2 px-3 rounded-xl border border-purple-500/20 bg-white dark:bg-zinc-950 text-purple-600 dark:text-purple-400 font-bold hover:bg-purple-500/5 flex items-center justify-between"
                      >
                        <span>Generate Creative Captions</span>
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>

                      <div className="space-y-1">
                        <span className="text-[9px] text-zinc-400 font-bold uppercase block mt-1">Refine Sound Tone Vibe</span>
                        <div className="flex gap-1.5">
                          {[
                            { id: 'mystical', label: 'Mystical' },
                            { id: 'cyberpunk', label: 'Cyberpunk' },
                            { id: 'inspiring', label: 'Inspire' }
                          ].map(v => (
                            <button
                              key={v.id}
                              id={`btn-vibe-${v.id}`}
                              type="button"
                              onClick={() => handleApplyAITone(v.id)}
                              className={`flex-1 py-1 px-2 rounded-lg border text-[10px] font-bold transition-all ${
                                activeAIVibe === v.id 
                                  ? 'border-purple-500 bg-purple-500/10 text-purple-500' 
                                  : 'border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                              }`}
                            >
                              {v.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* AI Art presetting */}
                    <div className="space-y-1.5">
                      <span className="font-bold text-zinc-400 uppercase text-[9px] block">Aesthetic Image Gen Prompt presets</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {AI_STYLE_PRESETS.map((style, idx) => (
                          <button
                            key={idx}
                            id={`btn-ai-style-${idx}`}
                            type="button"
                            onClick={() => handleGenerateAIImage(style.url, style.label)}
                            className="p-2 bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800 rounded-xl text-left hover:border-purple-500/40 transition-all group/btn"
                          >
                            <span className="font-bold text-[10px] text-zinc-700 dark:text-zinc-300 group-hover/btn:text-purple-500 block">{style.label}</span>
                            <span className="text-[8px] text-zinc-400 block mt-0.5">{style.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Composer Toolbar & Submit */}
              <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/50 pt-4 mt-4">
                <div className="flex items-center gap-1.5">
                  <button
                    id="btn-composer-text"
                    type="button"
                    onClick={() => setPostType('text')}
                    className={`p-2 rounded-xl transition-all ${postType === 'text' ? 'bg-purple-500/10 text-purple-600' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'}`}
                    title="Text Post"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  <button
                    id="btn-composer-image"
                    type="button"
                    onClick={() => setPostType('image')}
                    className={`p-2 rounded-xl transition-all ${postType === 'image' ? 'bg-purple-500/10 text-purple-600' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'}`}
                    title="Image Post"
                  >
                    <Image className="w-5 h-5" />
                  </button>
                  <button
                    id="btn-composer-video"
                    type="button"
                    onClick={() => setPostType('video')}
                    className={`p-2 rounded-xl transition-all ${postType === 'video' ? 'bg-purple-500/10 text-purple-600' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'}`}
                    title="Video Post"
                  >
                    <Video className="w-5 h-5" />
                  </button>
                  <button
                    id="btn-composer-poll"
                    type="button"
                    onClick={() => setPostType('poll')}
                    className={`p-2 rounded-xl transition-all ${postType === 'poll' ? 'bg-purple-500/10 text-purple-600' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'}`}
                    title="Poll"
                  >
                    <BarChart3 className="w-5 h-5" />
                  </button>

                  <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

                  {/* AI & Scheduling Triggers */}
                  <button
                    id="btn-toggle-ai-assistant"
                    type="button"
                    onClick={() => setShowAIPanel(!showAIPanel)}
                    className={`p-2 rounded-xl transition-all ${showAIPanel ? 'bg-purple-500 text-white' : 'bg-purple-500/10 text-purple-600 hover:bg-purple-500 hover:text-white'}`}
                    title="AI Assistant Creator panel"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                  <button
                    id="btn-toggle-schedule"
                    type="button"
                    onClick={() => setShowSchedulePicker(!showSchedulePicker)}
                    className={`p-2 rounded-xl transition-all ${showSchedulePicker ? 'bg-indigo-500/20 text-indigo-500' : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                    title="Schedule Post release"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                  <button
                    id="btn-composer-save-draft"
                    type="button"
                    onClick={handleSaveDraft}
                    className="p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
                    title="Save Draft"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    id="btn-submit-post"
                    onClick={handleCreatePostSubmit}
                    disabled={(!content.trim() && !mediaUrl && !videoUrl && !pollQuestion) || aiModerationBlocked}
                    className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold text-xs rounded-xl hover:opacity-90 disabled:opacity-40 shadow-md shadow-purple-500/10 active:scale-98 transition-all flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Pulse It</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* DRAFTS & SCHEDULED POSTS DIRECTORY DISPLAY */}
      {currentUser && (drafts.length > 0 || scheduledPosts.length > 0) && (
        <div className={`p-4 rounded-3xl border ${containerStyle} space-y-3.5 text-xs`}>
          {drafts.length > 0 && (
            <div className="space-y-2">
              <span className="font-bold text-zinc-400 uppercase text-[9px] block">Saved Composer Drafts ({drafts.length})</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {drafts.map(draft => (
                  <div
                    key={draft.id}
                    id={`post-draft-${draft.id}`}
                    onClick={() => handleLoadDraft(draft)}
                    className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-150 dark:border-zinc-800/80 hover:border-purple-500/30 transition-all cursor-pointer flex justify-between items-start"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="font-medium text-zinc-800 dark:text-zinc-200 block truncate">
                        {draft.content || '[Image Only]'}
                      </span>
                      <span className="text-[8px] text-zinc-400 block mt-1 uppercase font-bold">{draft.type} • Click to Restore</span>
                    </div>
                    <button
                      id={`btn-delete-draft-${draft.id}`}
                      type="button"
                      onClick={(e) => handleDeleteDraft(draft.id, e)}
                      className="p-1 rounded text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {scheduledPosts.length > 0 && (
            <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800/40 pt-3">
              <span className="font-bold text-zinc-400 uppercase text-[9px] block">Scheduled Releases ({scheduledPosts.length})</span>
              <div className="space-y-2">
                {scheduledPosts.map(sched => (
                  <div
                    key={sched.id}
                    id={`post-scheduled-${sched.id}`}
                    className="p-3 rounded-2xl bg-purple-500/5 border border-purple-500/10 flex justify-between items-center"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate block">
                          {sched.content || '[Image Only]'}
                        </span>
                        <span className="text-[9px] text-purple-600 dark:text-purple-400 block mt-0.5 font-bold">
                          Release date: {new Date(sched.scheduledTime).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <button
                      id={`btn-cancel-scheduled-${sched.id}`}
                      type="button"
                      onClick={() => handleDeleteScheduled(sched.id)}
                      className="p-1.5 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 font-bold text-[9px] px-2"
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-6">
        {sortedPosts.slice(0, visibleCount).map(post => {
          const author = users.find(u => u.id === post.userId);
          if (!author) return null;

          const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;
          const isSaved = currentUser ? savedPosts.includes(post.id) : false;
          const activePostComments = comments[post.id] || [];
          const isCommentsExpanded = expandedComments[post.id] || false;
          const isPinned = pinnedPostIds.includes(post.id);
          const hasTranslation = !!translatedContent[post.id];


          return (
            <article 
              key={post.id} 
              id={`post-card-${post.id}`}
              className={`p-5 rounded-3xl border shadow-sm transition-all hover:shadow-md relative group ${containerStyle}`}
            >
              {/* Pinned Creator Badge */}
              {isPinned && (
                <div id={`pinned-badge-${post.id}`} className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-extrabold mb-3 bg-purple-500/5 py-1 px-2.5 rounded-full w-max">
                  <Pin className="w-3.5 h-3.5 fill-purple-600 dark:fill-purple-400" />
                  <span>Pinned Creator Waveform</span>
                </div>
              )}

              {/* Post Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => onOpenProfile(author.id)}>
                  <img 
                    src={author.avatarUrl} 
                    alt={author.displayName} 
                    className="w-10 h-10 rounded-full object-cover border border-zinc-100 dark:border-zinc-800"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-display font-semibold text-sm text-zinc-900 dark:text-zinc-50 hover:underline">
                        {author.displayName}
                      </span>
                      {author.isVerified && (
                        <CheckCircle2 className="w-4 h-4 text-sky-500 fill-sky-500 text-[10px] stroke-[2.5px]" />
                      )}
                    </div>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      @{author.username} • {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* More Menu Dropdown */}
                <div className="relative">
                  <button 
                    id={`post-menu-btn-${post.id}`}
                    onClick={() => setActiveMenuPost(activeMenuPost === post.id ? null : post.id)}
                    className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>

                  {activeMenuPost === post.id && (
                    <div id={`post-menu-dropdown-${post.id}`} className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl py-2 z-40 animate-fade-in text-sm">
                      <button
                        id={`btn-pin-post-${post.id}`}
                        onClick={() => handleTogglePin(post.id)}
                        className="w-full px-4 py-2.5 text-left text-purple-600 dark:text-purple-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 flex items-center gap-2 font-semibold"
                      >
                        {isPinned ? <PinOff className="w-4 h-4 text-purple-500" /> : <Pin className="w-4 h-4 text-purple-500" />}
                        {isPinned ? 'Unpin Post' : 'Pin to Profile'}
                      </button>
                      <button
                        id={`btn-report-post-${post.id}`}
                        onClick={() => {
                          onReportContent('post', post.id, 'Inappropriate content flagged by user.');
                          setActiveMenuPost(null);
                          triggerToast('Post reported successfully.');
                        }}
                        className="w-full px-4 py-2.5 text-left text-amber-600 dark:text-amber-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 flex items-center gap-2 font-medium"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        Report Post
                      </button>
                      <button
                        id={`btn-block-author-${post.id}`}
                        onClick={() => {
                          onBlockUser(author.id);
                          setActiveMenuPost(null);
                          triggerToast(`Blocked @${author.username}`);
                        }}
                        className="w-full px-4 py-2.5 text-left text-rose-600 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/10 flex items-center gap-2 font-medium"
                      >
                        <Ban className="w-4 h-4" />
                        Block User
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Post Content */}
              <div className="space-y-3 mb-4">
                <p className="text-zinc-800 dark:text-zinc-100 text-[15px] leading-relaxed whitespace-pre-wrap">
                  {hasTranslation ? translatedContent[post.id] : post.content}
                </p>

                {/* AI Instant Translation Button */}
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    id={`btn-translate-${post.id}`}
                    type="button"
                    onClick={() => handleTranslatePost(post.id, post.content)}
                    disabled={translatingPostId === post.id}
                    className="text-[10px] font-extrabold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 bg-purple-500/5 py-1 px-2 rounded-lg"
                  >
                    <Languages className="w-3.5 h-3.5" />
                    <span>
                      {translatingPostId === post.id 
                        ? 'AI Translating...' 
                        : hasTranslation ? 'Show Original Language' : 'Translate Waveform (AI)'}
                    </span>
                  </button>
                </div>

                {/* Post Media - Image */}
                {post.type === 'image' && post.mediaUrl && (
                  <div className="rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 shadow-sm max-h-[450px]">
                    <img 
                      src={post.mediaUrl} 
                      alt="Post attachment" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Post Media - Video */}
                {post.type === 'video' && post.videoUrl && (
                  <div className="rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-black shadow-sm aspect-video">
                    <video 
                      src={post.videoUrl} 
                      controls 
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Post Media - Poll */}
                {post.type === 'poll' && post.poll && (
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/80 space-y-3">
                    <h4 className="font-display font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-2">
                      {post.poll.question}
                    </h4>
                    <div className="space-y-2">
                      {(() => {
                        const totalVotes = post.poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);
                        const userVoted = currentUser ? post.poll.options.some(opt => opt.votes.includes(currentUser.id)) : false;

                        return post.poll.options.map(option => {
                          const optionVotes = option.votes.length;
                          const percent = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
                          const optionVoted = currentUser ? option.votes.includes(currentUser.id) : false;

                          return (
                            <button
                              key={option.id}
                              id={`poll-option-btn-${post.id}-${option.id}`}
                              disabled={userVoted}
                              onClick={() => onVotePoll(post.id, option.id)}
                              className="w-full relative py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden text-left flex justify-between items-center transition-all bg-white dark:bg-zinc-900 hover:border-purple-500/50 disabled:cursor-default"
                            >
                              {/* Background progress bar animate */}
                              {(userVoted || totalVotes > 0) && (
                                <div 
                                  className="absolute left-0 top-0 bottom-0 bg-purple-500/10 dark:bg-purple-500/20 transition-all duration-1000" 
                                  style={{ width: `${percent}%` }}
                                />
                              )}
                              
                              <span className="relative font-medium text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                                {option.text}
                                {optionVoted && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500 text-white font-bold">Your Vote</span>
                                )}
                              </span>

                              {(userVoted || totalVotes > 0) && (
                                <span className="relative text-xs font-bold text-zinc-500 dark:text-zinc-400">
                                  {percent}% ({optionVotes})
                                </span>
                              )}
                            </button>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Interaction Bar */}
              <div className="flex items-center justify-between border-t border-b border-zinc-100 dark:border-zinc-800/50 py-2.5 mb-4 text-zinc-500 dark:text-zinc-400 text-sm">
                <button
                  id={`btn-like-${post.id}`}
                  onClick={() => onLikePost(post.id)}
                  className={`flex items-center gap-1.5 hover:text-pink-500 transition-colors ${isLiked ? 'text-pink-500 font-semibold' : ''}`}
                >
                  <Heart className={`w-[18px] h-[18px] ${isLiked ? 'fill-pink-500 text-pink-500' : ''}`} />
                  <span>{post.likes.length}</span>
                </button>

                <button
                  id={`btn-toggle-comments-${post.id}`}
                  onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !isCommentsExpanded }))}
                  className="flex items-center gap-1.5 hover:text-purple-500 transition-colors"
                >
                  <MessageCircle className="w-[18px] h-[18px]" />
                  <span>{activePostComments.length}</span>
                </button>

                <button
                  id={`btn-save-${post.id}`}
                  onClick={() => onSavePost(post.id)}
                  className={`flex items-center gap-1.5 hover:text-indigo-500 transition-colors ${isSaved ? 'text-indigo-500 font-semibold' : ''}`}
                >
                  <Bookmark className={`w-[18px] h-[18px] ${isSaved ? 'fill-indigo-500 text-indigo-500' : ''}`} />
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  id={`btn-share-${post.id}`}
                  onClick={() => handleShare(post.id)}
                  className="flex items-center gap-1.5 hover:text-teal-500 transition-colors"
                >
                  <Share2 className="w-[18px] h-[18px]" />
                  <span>Share</span>
                </button>
              </div>

              {/* Expanded Comments Panel */}
              {isCommentsExpanded && (
                <div id={`comments-panel-${post.id}`} className="space-y-4 pt-2 border-t border-zinc-50 dark:border-zinc-800/30 animate-fade-in">
                  
                  {/* Write comment */}
                  {currentUser && (
                    <div className="flex gap-2 items-center">
                      <input
                        id={`comment-input-${post.id}`}
                        type="text"
                        placeholder="Write a comment..."
                        value={commentInputs[post.id] || ''}
                        onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                        className="flex-1 px-4 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        id={`btn-submit-comment-${post.id}`}
                        onClick={() => handleCommentSubmit(post.id)}
                        className="p-2 bg-purple-500 text-white rounded-xl hover:opacity-95 shadow active:scale-95"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* List comments */}
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {activePostComments.length === 0 ? (
                      <p className="text-center text-xs text-zinc-400 py-4">Be the first to comment on this post!</p>
                    ) : (
                      activePostComments.map(comment => {
                        const commenter = users.find(u => u.id === comment.userId);
                        return (
                          <div key={comment.id} className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-100/40 dark:border-zinc-800/40 space-y-1">
                            <div className="flex items-center gap-2">
                              <img 
                                src={commenter?.avatarUrl} 
                                alt={commenter?.displayName} 
                                className="w-6 h-6 rounded-full object-cover border border-zinc-200"
                              />
                              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{commenter?.displayName}</span>
                              <span className="text-[10px] text-zinc-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-zinc-700 dark:text-zinc-300 ml-8">{comment.content}</p>
                          </div>
                        );
                      })
                    )}
                  </div>

                </div>
              )}

            </article>
          );
        })}
      </div>

      {/* Infinite Scroll Load More trigger */}
      {posts.length > visibleCount && (
        <div className="text-center pt-4">
          <button
            id="btn-load-more"
            onClick={loadMorePosts}
            disabled={loadingMore}
            className="px-6 py-2.5 rounded-full border border-purple-500/40 text-purple-600 dark:text-purple-400 text-sm font-semibold hover:bg-purple-500/5 active:scale-95 transition-all"
          >
            {loadingMore ? 'Loading creative waves...' : 'Load More Posts'}
          </button>
        </div>
      )}
    </div>
  );
}
