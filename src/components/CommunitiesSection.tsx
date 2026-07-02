import React, { useState } from 'react';
import { 
  Users, Calendar, Clock, MapPin, Plus, Check, CheckCircle, Ticket, 
  ChevronRight, MessageSquare, Heart, Bookmark, UserPlus, ShieldAlert,
  ArrowUpRight, Users2, Sparkles, Search, SlidersHorizontal, HelpCircle, 
  ArrowUp, ArrowDown, Send, CheckSquare, X, Info
} from 'lucide-react';
import { User, Post } from '../types';

interface CommunitiesSectionProps {
  currentUser: User | null;
  users: User[];
  theme: 'light' | 'dark' | 'glass';
}

interface Community {
  id: string;
  name: string;
  slug: string;
  desc: string;
  image: string;
  membersCount: number;
  isJoined: boolean;
  category: string;
}

interface CreativeEvent {
  id: string;
  title: string;
  desc: string;
  date: string;
  time: string;
  location: string;
  rsvps: number;
  isRsvped: boolean;
  image: string;
}

interface QAItem {
  id: string;
  groupId: string;
  userId: string;
  question: string;
  votes: string[];
  answers: {
    id: string;
    userId: string;
    content: string;
    createdAt: string;
  }[];
  createdAt: string;
}

const STOCK_COMMUNITIES: Community[] = [
  { id: 'g1', name: 'Modular Synth Synthesists', slug: 'synth-builders', desc: 'A collective of LFO enthusiasts, patch wire wizards, and modular artists exchanging creative signal flows.', image: 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=400&h=300&fit=crop', membersCount: 1420, isJoined: true, category: 'Hardware' },
  { id: 'g2', name: 'Ambient Wave Designers', slug: 'ambient-waves', desc: 'Dedicated to compiling pure sine waves, deep field recordings, and organic granular soundscapes.', image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&h=300&fit=crop', membersCount: 980, isJoined: false, category: 'Production' },
  { id: 'g3', name: 'Vite & Frontend Creators', slug: 'vite-frontend', desc: 'UI designers and developers building high-fidelity visual web applications with Tailwind CSS and React.', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop', membersCount: 2310, isJoined: false, category: 'Technology' }
];

const STOCK_EVENTS: CreativeEvent[] = [
  { id: 'e1', title: 'Eurorack Synthesizer Showcase 2026', desc: 'A live collaborative broadcast with modular synthesists demonstrating custom hardware setups and LFO soundscapes.', date: '2026-07-15', time: '18:00 UTC', location: 'Tokyo Modular Synth Hub & Live Stream', rsvps: 242, isRsvped: false, image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&h=300&fit=crop' },
  { id: 'e2', title: 'Ambient Waves Hackathon & Jam', desc: 'Create and submit a 60-second ambient loop based on organic field recordings. Winner gains premium synthesiser licenses!', date: '2026-08-01', time: '12:00 UTC', location: 'Pulse Global Metaverse', rsvps: 124, isRsvped: true, image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=300&fit=crop' }
];

const STOCK_QA: QAItem[] = [
  {
    id: 'q1',
    groupId: 'g1',
    userId: 'user_3',
    question: 'How do you prevent frequency masking when blending two high-resonance analogue filters?',
    votes: ['user_1', 'user_4'],
    answers: [
      { id: 'a1', userId: 'user_4', content: 'Try using a sidechained peak compressor or cutting 300Hz manually on the secondary low pass filter! It cleans up the analog warmth nicely.', createdAt: new Date(Date.now() - 3600000).toISOString() }
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export default function CommunitiesSection({ currentUser, users, theme }: CommunitiesSectionProps) {
  const [activeTab, setActiveTab] = useState<'groups' | 'events'>('groups');
  const [communities, setCommunities] = useState<Community[]>(STOCK_COMMUNITIES);
  const [selectedGroup, setSelectedGroup] = useState<Community | null>(null);
  const [groupTab, setGroupTab] = useState<'feed' | 'qa'>('feed');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Group posting states
  const [groupFeed, setGroupFeed] = useState<{ [groupId: string]: Post[] }>({
    'g1': [
      {
        id: 'gp1',
        userId: 'u2', // Clara_Wave
        type: 'text',
        content: 'Check out this fresh patch layout! Routing a dual LFO filter through standard granular delay for that warm tape vibe.',
        hashtags: ['modular', 'eurorack', 'lfo'],
        mentions: [],
        likes: ['u1'],
        commentsCount: 3,
        sharesCount: 1,
        savedBy: [],
        createdAt: new Date().toISOString()
      }
    ]
  });
  const [typedGroupPost, setTypedGroupPost] = useState('');

  // QA Forum states
  const [qaItems, setQaItems] = useState<QAItem[]>(STOCK_QA);
  const [newQuestion, setNewQuestion] = useState('');
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState('');

  // Events states
  const [events, setEvents] = useState<CreativeEvent[]>(STOCK_EVENTS);
  const [ticketModalEvent, setTicketModalEvent] = useState<CreativeEvent | null>(null);
  const [selectedTicketTier, setSelectedTicketTier] = useState<'standard' | 'vip'>('standard');
  const [tiltAngle, setTiltAngle] = useState({ x: 0, y: 0 });

  // Creation Modals
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupCategory, setNewGroupCategory] = useState('Hardware');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupImage, setNewGroupImage] = useState('https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&h=300&fit=crop');

  // Toggle Join community
  const handleToggleJoinGroup = (gId: string) => {
    setCommunities(prev => prev.map(c => {
      if (c.id === gId) {
        const nextJoined = !c.isJoined;
        return {
          ...c,
          isJoined: nextJoined,
          membersCount: nextJoined ? c.membersCount + 1 : c.membersCount - 1
        };
      }
      return c;
    }));

    // Update current selected group as well
    if (selectedGroup && selectedGroup.id === gId) {
      setSelectedGroup(prev => prev ? {
        ...prev,
        isJoined: !prev.isJoined,
        membersCount: !prev.isJoined ? prev.membersCount + 1 : prev.membersCount - 1
      } : null);
    }
  };

  // Create post in group
  const handlePostToGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !typedGroupPost.trim() || !currentUser) return;

    const newPost: Post = {
      id: `gp_${Date.now()}`,
      userId: currentUser.id,
      type: 'text',
      content: typedGroupPost,
      hashtags: [selectedGroup.slug],
      mentions: [],
      likes: [],
      commentsCount: 0,
      sharesCount: 0,
      savedBy: [],
      createdAt: new Date().toISOString()
    };

    setGroupFeed(prev => ({
      ...prev,
      [selectedGroup.id]: [newPost, ...(prev[selectedGroup.id] || [])]
    }));
    setTypedGroupPost('');
  };

  // Toggle RSVP and open animated Ticket modal if registering
  const handleToggleRsvp = (ev: CreativeEvent) => {
    const isRegistering = !ev.isRsvped;
    setEvents(prev => prev.map(e => {
      if (e.id === ev.id) {
        return {
          ...e,
          isRsvped: isRegistering,
          rsvps: isRegistering ? e.rsvps + 1 : e.rsvps - 1
        };
      }
      return e;
    }));

    if (isRegistering) {
      setSelectedTicketTier('standard');
      setTicketModalEvent({
        ...ev,
        isRsvped: true,
        rsvps: ev.rsvps + 1
      });
    }
  };

  // Add Community Group
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !newGroupDesc.trim()) return;

    const newGroup: Community = {
      id: `g_${Date.now()}`,
      name: newGroupName,
      slug: newGroupName.toLowerCase().replace(/\s+/g, '-'),
      desc: newGroupDesc,
      image: newGroupImage || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&h=300&fit=crop',
      membersCount: 1,
      isJoined: true,
      category: newGroupCategory
    };

    setCommunities(prev => [...prev, newGroup]);
    setShowCreateGroupModal(false);
    // Reset inputs
    setNewGroupName('');
    setNewGroupDesc('');
    setNewGroupImage('https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&h=300&fit=crop');
  };

  // Ask Q&A Question
  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !newQuestion.trim() || !currentUser) return;

    const newItem: QAItem = {
      id: `q_${Date.now()}`,
      groupId: selectedGroup.id,
      userId: currentUser.id,
      question: newQuestion,
      votes: [],
      answers: [],
      createdAt: new Date().toISOString()
    };

    setQaItems(prev => [newItem, ...prev]);
    setNewQuestion('');
  };

  // Upvote Question
  const handleUpvoteQuestion = (qId: string) => {
    if (!currentUser) return;
    setQaItems(prev => prev.map(item => {
      if (item.id === qId) {
        const hasVoted = item.votes.includes(currentUser.id);
        return {
          ...item,
          votes: hasVoted ? item.votes.filter(id => id !== currentUser.id) : [...item.votes, currentUser.id]
        };
      }
      return item;
    }));
  };

  // Post Answer to Q&A
  const handlePostAnswer = (e: React.FormEvent, qId: string) => {
    e.preventDefault();
    if (!typedAnswer.trim() || !currentUser) return;

    setQaItems(prev => prev.map(item => {
      if (item.id === qId) {
        return {
          ...item,
          answers: [
            ...item.answers,
            {
              id: `ans_${Date.now()}`,
              userId: currentUser.id,
              content: typedAnswer,
              createdAt: new Date().toISOString()
            }
          ]
        };
      }
      return item;
    }));

    setTypedAnswer('');
    setAnsweringQuestionId(null);
  };

  // Interactive mouse tilt for Holographic Admission pass
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -20; // max 10deg rotation
    const rotateY = ((x / rect.width) - 0.5) * 20;
    setTiltAngle({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTiltAngle({ x: 0, y: 0 });
  };

  // Filtered lists
  const categories = ['All', 'Hardware', 'Production', 'Technology', 'Art', 'Digital Wave'];
  const filteredCommunities = communities.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        g.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        g.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === 'All' || g.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const containerStyle = theme === 'glass'
    ? 'bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-white/20 dark:border-zinc-800/20 shadow-md'
    : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 shadow-sm';

  const inputStyle = 'w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs text-zinc-900 dark:text-zinc-50';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 text-sm animate-fade-in">
      
      {/* Title */}
      <div className="px-2 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="font-display font-black text-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            Communities & Events
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Browse collaborative circles, ask Q&A queries, and claim holographic tickets to global creative events.
          </p>
        </div>

        <div className="flex bg-zinc-100 dark:bg-zinc-800/80 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800/40 text-xs">
          <button
            onClick={() => {
              setActiveTab('groups');
              setSelectedGroup(null);
            }}
            className={`px-4 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'groups' && !selectedGroup
                ? 'bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Groups
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'events'
                ? 'bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Events Calendar
          </button>
        </div>
      </div>

      {/* RENDER GROUPS / COMMUNITIES TREE */}
      {activeTab === 'groups' && (
        <div className="space-y-6 animate-fade-in">
          
          {!selectedGroup ? (
            <div className="space-y-6">
              {/* Search, Filter & Group creation triggers */}
              <div className="flex flex-col md:flex-row gap-3 justify-between items-center bg-zinc-50 dark:bg-zinc-950/20 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800/40">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search communities by keyword..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-zinc-900 dark:text-zinc-50"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 items-center justify-start w-full md:w-auto overflow-x-auto scrollbar-none">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border shrink-0 ${
                        selectedCategory === cat
                          ? 'bg-purple-500 border-purple-500 text-white shadow-sm shadow-purple-500/10'
                          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowCreateGroupModal(true)}
                  className="w-full md:w-auto px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-purple-500/10"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Group</span>
                </button>
              </div>

              {/* Communities grid */}
              {filteredCommunities.length === 0 ? (
                <div className="py-16 text-center text-zinc-400">
                  <HelpCircle className="w-10 h-10 text-zinc-500 mx-auto mb-2.5" />
                  <p className="font-semibold text-sm">No matching communities found</p>
                  <p className="text-xs">Try searching a different keyword or create your own custom collective!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {filteredCommunities.map(g => (
                    <div key={g.id} className={`rounded-3xl border overflow-hidden flex flex-col justify-between ${containerStyle} hover:shadow-lg transition-all duration-300 group`}>
                      <div className="h-44 bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                        <img src={g.image} alt={g.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <span className="absolute top-3 right-3 px-2 py-0.5 bg-zinc-900/80 text-white font-bold text-[9px] rounded-md backdrop-blur">
                          {g.category}
                        </span>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-50 leading-tight group-hover:text-purple-500 transition-colors">{g.name}</h4>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal line-clamp-3">{g.desc}</p>
                        </div>

                        <div className="space-y-3 pt-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              <span>{g.membersCount.toLocaleString()} members</span>
                            </span>
                            
                            <button
                              onClick={() => handleToggleJoinGroup(g.id)}
                              className={`px-3 py-1 rounded-full font-bold text-[10px] border transition-all ${
                                g.isJoined 
                                  ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300' 
                                  : 'bg-purple-500 border-purple-500 text-white'
                              }`}
                            >
                              {g.isJoined ? 'Joined' : 'Join'}
                            </button>
                          </div>

                          <button
                            id={`btn-view-community-${g.id}`}
                            onClick={() => {
                              setSelectedGroup(g);
                              setGroupTab('feed');
                            }}
                            className="w-full py-2 bg-zinc-50 dark:bg-zinc-950/30 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-bold transition-all border border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-1"
                          >
                            <span>Enter Community Hub</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Selected Group Feed & Q&A Board Detail */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
              
              {/* Left group meta panel (4 cols) */}
              <div className="lg:col-span-4 space-y-4">
                <button
                  onClick={() => setSelectedGroup(null)}
                  className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 hover:underline mb-2"
                >
                  <span>← Back to Communities</span>
                </button>

                <div className={`p-5 rounded-3xl border overflow-hidden relative ${containerStyle}`}>
                  <div className="h-32 rounded-2xl overflow-hidden mb-4">
                    <img src={selectedGroup.image} alt={selectedGroup.name} className="w-full h-full object-cover" />
                  </div>

                  <span className="px-2.5 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-bold rounded-lg">
                    {selectedGroup.category}
                  </span>

                  <h3 className="font-display font-bold text-base text-zinc-900 dark:text-zinc-50 mt-3 leading-tight">{selectedGroup.name}</h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-normal">{selectedGroup.desc}</p>

                  <div className="mt-5 border-t border-zinc-100 dark:border-zinc-800/40 pt-4 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400 font-bold">{selectedGroup.membersCount} active members</span>
                    <button
                      onClick={() => handleToggleJoinGroup(selectedGroup.id)}
                      className={`px-3 py-1 rounded-full font-bold text-xs border transition-all ${
                        selectedGroup.isJoined 
                          ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300' 
                          : 'bg-purple-500 border-purple-500 text-white'
                      }`}
                    >
                      {selectedGroup.isJoined ? 'Leave' : 'Join Group'}
                    </button>
                  </div>
                </div>

                {/* Subtabs for inside Group navigation */}
                <div className={`p-2 rounded-2xl border flex flex-col gap-1 ${containerStyle}`}>
                  {[
                    { id: 'feed', label: 'General Signal Feed', icon: MessageSquare, desc: 'Share normal post updates' },
                    { id: 'qa', label: 'Q&A Board Discussion', icon: HelpCircle, desc: 'Technical questions & answers' }
                  ].map(tab => {
                    const Icon = tab.icon;
                    const active = groupTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setGroupTab(tab.id as any)}
                        className={`p-3 rounded-xl text-left transition-all flex items-start gap-3 ${
                          active
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold border-l-4 border-purple-500'
                            : 'hover:bg-zinc-50 dark:hover:bg-zinc-950/30 text-zinc-500 dark:text-zinc-400'
                        }`}
                      >
                        <Icon className="w-4 h-4 mt-0.5" />
                        <div>
                          <span className="text-xs font-bold block">{tab.label}</span>
                          <span className="text-[10px] font-normal opacity-80 block mt-0.5">{tab.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Group post feed or Q&A forum (8 cols) */}
              <div className="lg:col-span-8 space-y-4">
                
                {groupTab === 'feed' ? (
                  <>
                    {/* Custom post editor in group */}
                    {selectedGroup.isJoined ? (
                      <form onSubmit={handlePostToGroup} className={`p-4 rounded-3xl border space-y-3 ${containerStyle}`}>
                        <textarea
                          placeholder={`Post waves or synthetics patch discussion to #${selectedGroup.slug}...`}
                          required
                          value={typedGroupPost}
                          onChange={e => setTypedGroupPost(e.target.value)}
                          className="w-full min-h-[70px] bg-transparent text-xs outline-none resize-none text-zinc-900 dark:text-zinc-50 border-0"
                        />
                        <div className="flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800/40 pt-2.5">
                          <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Posting as @{currentUser?.username || 'member'}</span>
                          <button
                            type="submit"
                            className="px-4 py-1.5 bg-purple-500 text-white text-xs font-bold rounded-xl hover:bg-purple-600 active:scale-95 transition-all shadow-md shadow-purple-500/15"
                          >
                            Publish Wave
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-950/20 text-center">
                        <Users2 className="w-10 h-10 text-zinc-400 mx-auto mb-2.5" />
                        <p className="font-bold text-xs">Join community to publish discussion waves</p>
                        <button
                          onClick={() => handleToggleJoinGroup(selectedGroup.id)}
                          className="mt-3.5 px-5 py-1.5 bg-purple-500 text-white font-bold rounded-xl text-xs"
                        >
                          Join @{selectedGroup.slug}
                        </button>
                      </div>
                    )}

                    {/* List of group posts */}
                    <div className="space-y-4">
                      {(groupFeed[selectedGroup.id] || []).map(post => {
                        const postUser = users.find(u => u.id === post.userId) || currentUser;
                        return (
                          <div key={post.id} className={`p-5 rounded-3xl border ${containerStyle} space-y-4`}>
                            <div className="flex items-center gap-3">
                              <img src={postUser?.avatarUrl} alt={postUser?.displayName} className="w-9 h-9 rounded-full object-cover" />
                              <div>
                                <span className="font-bold text-xs text-zinc-900 dark:text-zinc-50 block">{postUser?.displayName}</span>
                                <span className="text-[10px] text-zinc-400 block mt-0.5">@{postUser?.username}</span>
                              </div>
                            </div>

                            <p className="text-xs text-zinc-700 dark:text-zinc-300 font-normal leading-relaxed">{post.content}</p>

                            <div className="flex items-center gap-2">
                              {post.hashtags.map(h => (
                                <span key={h} className="px-2.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[10px] rounded-full">
                                  #{h}
                                </span>
                              ))}
                            </div>

                            {/* Interactive bar */}
                            <div className="border-t border-zinc-100 dark:border-zinc-800/40 pt-3 flex gap-6 text-zinc-400 text-xs">
                              <button className="flex items-center gap-1 hover:text-pink-500 transition-colors">
                                <Heart className="w-4 h-4" />
                                <span>{post.likes.length}</span>
                              </button>
                              <button className="flex items-center gap-1 hover:text-purple-500 transition-colors">
                                <MessageSquare className="w-4 h-4" />
                                <span>{post.commentsCount}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {(groupFeed[selectedGroup.id] || []).length === 0 && (
                        <div className="py-12 text-center text-zinc-400 text-xs">
                          No posts in this community yet. Be the first to start the signal wave!
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* Q&A Board Tab Rendering */
                  <div className="space-y-4">
                    {/* Ask Technical Question Form */}
                    {selectedGroup.isJoined ? (
                      <form onSubmit={handleAskQuestion} className={`p-4 rounded-3xl border space-y-3 ${containerStyle}`}>
                        <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 font-bold mb-1">
                          <HelpCircle className="w-4 h-4" />
                          <span>Ask a Technical/Creative Query</span>
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. How do you trigger sidechain volume envelopes on a custom delay circuit?"
                          required
                          value={newQuestion}
                          onChange={e => setNewQuestion(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs text-zinc-900 dark:text-zinc-50"
                        />
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-zinc-400">Collaborators will receive a notification to answer.</span>
                          <button
                            type="submit"
                            className="px-4 py-1.5 bg-purple-500 text-white text-xs font-bold rounded-xl hover:bg-purple-600 active:scale-95 transition-all shadow-md shadow-purple-500/10"
                          >
                            Ask Collective
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-950/20 text-center text-xs text-zinc-400">
                        Join this group to ask or answer community questions.
                      </div>
                    )}

                    {/* Q&A List */}
                    <div className="space-y-4">
                      {qaItems.filter(item => item.groupId === selectedGroup.id).map(q => {
                        const qUser = users.find(u => u.id === q.userId) || currentUser;
                        const hasVoted = currentUser ? q.votes.includes(currentUser.id) : false;

                        return (
                          <div key={q.id} className={`p-5 rounded-3xl border ${containerStyle} space-y-4`}>
                            <div className="flex justify-between items-start gap-3">
                              <div className="flex items-center gap-2.5">
                                <img src={qUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} alt="" className="w-8 h-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-800" />
                                <div>
                                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-50 block">@{qUser?.username || 'member'}</span>
                                  <span className="text-[10px] text-zinc-400">Asked on {new Date(q.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>

                              <button
                                onClick={() => handleUpvoteQuestion(q.id)}
                                className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${
                                  hasVoted
                                    ? 'bg-purple-500 border-purple-500 text-white'
                                    : 'bg-zinc-50 dark:bg-zinc-950/30 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100'
                                }`}
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                                <span>{q.votes.length}</span>
                              </button>
                            </div>

                            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-50/60 dark:bg-zinc-950/20 p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-800/40 leading-relaxed">
                              {q.question}
                            </h4>

                            {/* Answers List */}
                            <div className="space-y-2.5 pt-1">
                              {q.answers.map(ans => {
                                const ansUser = users.find(u => u.id === ans.userId) || currentUser;
                                return (
                                  <div key={ans.id} className="p-3 bg-purple-500/[0.02] dark:bg-purple-500/[0.01] rounded-2xl border border-purple-500/5 ml-4 space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-[10px]">
                                      <img src={ansUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} alt="" className="w-5 h-5 rounded-full object-cover" />
                                      <span className="font-bold text-zinc-800 dark:text-zinc-200">@{ansUser?.username || 'expert'}</span>
                                      <span className="text-zinc-400">• {new Date(ans.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-[11px] text-zinc-600 dark:text-zinc-300 font-normal leading-relaxed pl-6">
                                      {ans.content}
                                    </p>
                                  </div>
                                );
                              })}

                              {q.answers.length === 0 && (
                                <p className="text-[10px] text-zinc-400 italic pl-4">No answers yet. Share your experience or feedback!</p>
                              )}
                            </div>

                            {/* Post Answer sub-form */}
                            {selectedGroup.isJoined && (
                              <div className="pl-4 pt-1">
                                {answeringQuestionId === q.id ? (
                                  <form onSubmit={(e) => handlePostAnswer(e, q.id)} className="space-y-2">
                                    <textarea
                                      required
                                      placeholder="Type your expert solution or advice..."
                                      value={typedAnswer}
                                      onChange={e => setTypedAnswer(e.target.value)}
                                      className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                                      rows={2}
                                    />
                                    <div className="flex justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setAnsweringQuestionId(null)}
                                        className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-lg text-[10px] font-bold"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="submit"
                                        className="px-3.5 py-1 bg-purple-500 text-white rounded-lg text-[10px] font-bold hover:bg-purple-600"
                                      >
                                        Submit Answer
                                      </button>
                                    </div>
                                  </form>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setAnsweringQuestionId(q.id);
                                      setTypedAnswer('');
                                    }}
                                    className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                                  >
                                    <span>Provide a solution answer</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {qaItems.filter(item => item.groupId === selectedGroup.id).length === 0 && (
                        <div className="py-12 text-center text-zinc-400 text-xs">
                          No active questions here. Ask the collective to start a technical discussion thread!
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

        </div>
      )}

      {/* RENDER EVENTS CALENDAR */}
      {activeTab === 'events' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map(ev => {
              const daysLeft = Math.ceil((new Date(ev.date).getTime() - new Date('2026-06-30').getTime()) / (1000 * 60 * 60 * 24));
              return (
                <div key={ev.id} className={`rounded-3xl border overflow-hidden flex flex-col justify-between ${containerStyle}`}>
                  <div>
                    <div className="h-44 bg-zinc-100 dark:bg-zinc-800 relative">
                      <img src={ev.image} alt={ev.title} className="w-full h-full object-cover" />
                      
                      <div className="absolute top-3 left-3 px-2.5 py-1 bg-zinc-950/80 text-white rounded-lg font-bold text-[9px] backdrop-blur flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-pink-500" />
                        <span>{daysLeft > 0 ? `${daysLeft} days until live` : 'Happening today'}</span>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <h4 className="font-display font-bold text-base text-zinc-900 dark:text-zinc-50 leading-tight">{ev.title}</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">{ev.desc}</p>
                      
                      <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800/40 pt-3.5 text-xs text-zinc-500 dark:text-zinc-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-purple-500" />
                          <span>{ev.date} at {ev.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-pink-500" />
                          <span className="truncate">{ev.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex gap-3 items-center">
                    <button
                      id={`btn-event-rsvp-${ev.id}`}
                      onClick={() => handleToggleRsvp(ev)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        ev.isRsvped 
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold' 
                          : 'bg-purple-500 border border-purple-500 text-white font-extrabold hover:opacity-90 active:scale-95'
                      }`}
                    >
                      {ev.isRsvped ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>RSVP Claimed (Click to view Ticket)</span>
                        </>
                      ) : (
                        <span>Confirm RSVP Seat</span>
                      )}
                    </button>

                    <span className="text-[11px] font-bold text-zinc-400 shrink-0">
                      {ev.rsvps} attending
                    </span>
                  </div>

                  {/* Quick-view Ticket summary banner */}
                  {ev.isRsvped && (
                    <div className="px-5 pb-5">
                      <button
                        onClick={() => {
                          setSelectedTicketTier('standard');
                          setTicketModalEvent(ev);
                        }}
                        className="w-full p-3 rounded-2xl border border-dashed border-purple-500/35 bg-purple-500/[0.03] text-left hover:bg-purple-500/[0.06] transition-all flex justify-between items-center text-xs relative overflow-hidden"
                      >
                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 h-3 w-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full" />
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 h-3 w-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full" />
                        
                        <div className="pl-2">
                          <span className="text-[8px] font-mono font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest block">CLAIMED PASS</span>
                          <span className="font-bold text-zinc-800 dark:text-zinc-200 block mt-0.5">{ev.title.slice(0, 30)}...</span>
                        </div>
                        <div className="pr-2 text-right shrink-0">
                          <Ticket className="w-4 h-4 text-purple-500 ml-auto" />
                          <span className="text-[8px] font-mono text-zinc-400 block mt-1">OPEN TICKET</span>
                        </div>
                      </button>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* CREATE NEW GROUP MODAL */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowCreateGroupModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="font-display font-black text-xl text-zinc-900 dark:text-zinc-50">Create Community Collective</h3>
              <p className="text-xs text-zinc-400">Establish a collaborative social space around a niche hardware or production workflow.</p>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Group Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eurorack Generative Synthesizers"
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Category</label>
                  <select
                    value={newGroupCategory}
                    onChange={e => setNewGroupCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Hardware">Hardware</option>
                    <option value="Production">Production</option>
                    <option value="Technology">Technology</option>
                    <option value="Art">Art</option>
                    <option value="Digital Wave">Digital Wave</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Cover Image URL</label>
                  <input
                    type="text"
                    placeholder="Cover URL"
                    value={newGroupImage}
                    onChange={e => setNewGroupImage(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Description</label>
                <textarea
                  required
                  placeholder="What is the objective, flow, or signal exchange protocol of this community?"
                  value={newGroupDesc}
                  onChange={e => setNewGroupDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={3}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-purple-500/15"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Launch Circle</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULLY INTERACTIVE HOLOGRAPHIC TICKET MODAL */}
      {ticketModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-[36px] p-6 shadow-2xl relative space-y-6 overflow-hidden">
            
            {/* Background glowing particles */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-purple-500/20 blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-44 h-44 bg-pink-500/20 blur-[80px] pointer-events-none" />

            <button
              onClick={() => setTicketModalEvent(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <span className="px-3 py-1 bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-purple-400 text-[10px] font-bold rounded-full border border-purple-500/25">
                🎫 Dynamic Blockchain Admission Pass
              </span>
              <h3 className="font-display font-black text-2xl text-zinc-50 mt-2">Holographic Secure Pass</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                Move your cursor or finger over the ticket to interact with the responsive glass reflection sheen.
              </p>
            </div>

            {/* Custom Tier Switch */}
            <div className="flex justify-center">
              <div className="bg-zinc-950/80 p-1 rounded-2xl border border-white/10 flex text-xs">
                <button
                  onClick={() => setSelectedTicketTier('standard')}
                  className={`px-4 py-1.5 rounded-xl font-bold transition-all ${
                    selectedTicketTier === 'standard'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Standard Pass
                </button>
                <button
                  onClick={() => setSelectedTicketTier('vip')}
                  className={`px-4 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
                    selectedTicketTier === 'vip'
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-zinc-950 shadow-md'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>VIP Backstage Pass</span>
                </button>
              </div>
            </div>

            {/* TICKET WRAPPER (Tilt container) */}
            <div className="flex justify-center py-4">
              <div
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  transform: `perspective(1000px) rotateX(${tiltAngle.x}deg) rotateY(${tiltAngle.y}deg)`,
                  transition: 'transform 0.1s ease-out'
                }}
                className={`w-72 sm:w-80 rounded-3xl p-5 border relative overflow-hidden transition-all duration-300 shadow-2xl ${
                  selectedTicketTier === 'vip'
                    ? 'bg-zinc-950 border-amber-500/40 shadow-amber-500/10'
                    : 'bg-zinc-900 border-purple-500/40 shadow-purple-500/10'
                }`}
              >
                {/* Holographic linear gloss effect */}
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none mix-blend-color-dodge transition-all"
                  style={{
                    background: `linear-gradient(${120 + tiltAngle.y * 3}deg, transparent 20%, rgba(255,255,255,0.7) 40%, rgba(139,92,246,0.3) 50%, transparent 70%)`
                  }}
                />

                {/* Ticket notches */}
                <div className="absolute -left-3 top-[55%] h-6 w-6 bg-zinc-950 rounded-full border-r border-white/10" />
                <div className="absolute -right-3 top-[55%] h-6 w-6 bg-zinc-950 rounded-full border-l border-white/10" />

                {/* Content above perforation */}
                <div className="space-y-4 pb-4 border-b border-dashed border-white/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                        selectedTicketTier === 'vip' 
                          ? 'bg-yellow-400 text-zinc-950 font-bold' 
                          : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {selectedTicketTier === 'vip' ? 'VIP GUEST' : 'GENERAL SEAT'}
                      </span>
                      <h4 className="font-display font-black text-sm text-zinc-50 mt-2 line-clamp-1">{ticketModalEvent.title}</h4>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[9px] text-zinc-500 block">SER-2026</span>
                      <span className="font-mono text-[9px] text-zinc-400 block mt-0.5">#{ticketModalEvent.id.toUpperCase()}-TKT</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                    <div>
                      <span className="text-zinc-500 block">DATE & TIME</span>
                      <span className="font-bold text-zinc-200 mt-0.5 block">{ticketModalEvent.date}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">SEAT TIER</span>
                      <span className="font-bold text-zinc-200 mt-0.5 block uppercase">{selectedTicketTier} SECTOR</span>
                    </div>
                  </div>

                  <div className="text-[10px]">
                    <span className="text-zinc-500 block">SECURITY CODE / SIGNATURE</span>
                    <span className="font-mono text-zinc-300 mt-0.5 block truncate">0x9F82A...D24B5 (DIGITALLY SIGNED)</span>
                  </div>
                </div>

                {/* Content below perforation (Ticket Stub) */}
                <div className="pt-4 flex justify-between items-center gap-3">
                  <div className="space-y-2">
                    <div>
                      <span className="text-[9px] text-zinc-500 block uppercase">PASS HOLDER</span>
                      <span className="text-xs font-bold text-zinc-100">{currentUser?.displayName || 'Pulse Creative'}</span>
                      <span className="text-[10px] text-zinc-400 block">@{currentUser?.username || 'member'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>SECURE DEPLOYED</span>
                    </div>
                  </div>

                  {/* QR Code design */}
                  <div className="p-1.5 bg-white rounded-2xl relative group shrink-0 shadow-lg">
                    {/* Simulated Scanner Line animation overlay */}
                    <div className="absolute left-0 right-0 h-0.5 bg-emerald-500/70 animate-bounce top-1/4 pointer-events-none" />
                    <svg className="w-16 h-16 text-zinc-950" viewBox="0 0 100 100">
                      {/* Anchor boxes */}
                      <rect x="5" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="8" />
                      <rect x="12" y="12" width="11" height="11" fill="currentColor" />
                      <rect x="70" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="8" />
                      <rect x="77" y="12" width="11" height="11" fill="currentColor" />
                      <rect x="5" y="70" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="8" />
                      <rect x="12" y="77" width="11" height="11" fill="currentColor" />
                      {/* Random scanner dots pattern */}
                      <rect x="40" y="10" width="8" height="8" fill="currentColor" />
                      <rect x="55" y="15" width="8" height="8" fill="currentColor" />
                      <rect x="45" y="30" width="15" height="8" fill="currentColor" />
                      <rect x="10" y="45" width="8" height="15" fill="currentColor" />
                      <rect x="35" y="50" width="12" height="12" fill="currentColor" />
                      <rect x="70" y="45" width="20" height="8" fill="currentColor" />
                      <rect x="55" y="65" width="12" height="15" fill="currentColor" />
                      <rect x="80" y="80" width="12" height="12" fill="currentColor" />
                      <rect x="40" y="80" width="15" height="8" fill="currentColor" />
                    </svg>
                  </div>
                </div>

                {/* Interactive bar code at the very bottom */}
                <div className="mt-4 pt-2 border-t border-white/5 flex flex-col items-center">
                  <div className="h-7 w-full flex gap-0.5 overflow-hidden opacity-60">
                    {[3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3, 2, 3, 8, 4, 6, 2, 6, 4, 3, 3, 8, 3, 2, 7, 9].map((val, idx) => (
                      <div
                        key={idx}
                        className="bg-zinc-400 h-full shrink-0"
                        style={{ width: `${val * 0.7 + 0.5}px` }}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[7px] text-zinc-500 mt-1 uppercase tracking-widest">
                    *PULSE-{selectedTicketTier.toUpperCase()}-{ticketModalEvent.id.toUpperCase()}*
                  </span>
                </div>

              </div>
            </div>

            {/* Simulating actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  alert("Ticket saved securely in local sandbox wallet! Feel free to show it at the event gate.");
                  setTicketModalEvent(null);
                }}
                className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-zinc-100 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-white/10"
              >
                <span>Save to Wallet</span>
              </button>
              <button
                onClick={() => {
                  alert("Admission pass successfully compiled! Printing queue engaged.");
                }}
                className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <span>Print Admission</span>
              </button>
            </div>

            {/* Warning / Notes */}
            <div className="p-3 bg-zinc-950/40 rounded-2xl border border-white/5 flex items-start gap-2 text-[10px] text-zinc-400">
              <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                This pass is digitally verified on the Pulse distributed ledger. Standard pass grants general admission. VIP grants access to the physical hardware playground and private broadcast channels.
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
