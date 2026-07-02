import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, Users, DollarSign, Award, Radio, ShoppingBag, 
  BarChart3, Plus, Sparkles, Check, CheckCircle2, Play, Square, 
  Heart, MessageSquare, Flame, AlertCircle, Send, CheckSquare, Target,
  Volume2, ShieldCheck, PieChart, ArrowUpRight, Megaphone, Zap
} from 'lucide-react';
import { User, Post } from '../types';

interface CreatorBusinessHubProps {
  currentUser: User | null;
  theme: 'light' | 'dark' | 'glass';
  onRegisterAdCampaign?: (amount: number, campaignName: string) => void;
  onRegisterPlatformFee?: (amount: number, description: string) => void;
  onRegisterBusinessPromotion?: (amount: number, description: string) => void;
  posts?: Post[];
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  isTip?: boolean;
  tipAmount?: number;
}

const STOCK_PRODUCTS = [
  { id: 'p1', name: 'Digital Synth Preset Pack V4', price: 19, desc: 'Professional audio presets for synthesizer artists.', category: 'Presets', image: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=300&fit=crop', sales: 142 },
  { id: 'p2', name: 'Ambient Sound Wave Poster (Limited)', price: 45, desc: 'A physical high-definition textured foil print of your audio waves.', category: 'Merchandise', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop', sales: 68 },
  { id: 'p3', name: 'Soundtrack Engineering Course', price: 120, desc: '12-hour masterclass on modern visual scoring and mixing.', category: 'Education', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop', sales: 310 }
];

export default function CreatorBusinessHub({ 
  currentUser, 
  theme,
  onRegisterAdCampaign,
  onRegisterPlatformFee,
  onRegisterBusinessPromotion,
  posts = []
}: CreatorBusinessHubProps) {
  const [activeSubTab, setActiveSubTab] = useState<'stream' | 'monetize' | 'ads' | 'market' | 'analytics'>('stream');

  // Stream simulator states
  const [isLive, setIsLive] = useState(false);
  const [streamTimer, setStreamTimer] = useState(0);
  const [streamChat, setStreamChat] = useState<ChatMessage[]>([]);
  const [typedChat, setTypedChat] = useState('');
  const [liveViewers, setLiveViewers] = useState(0);
  const [floatingReactions, setFloatingReactions] = useState<{ id: string; emoji: string; left: number }[]>([]);
  const [latestDonationAlert, setLatestDonationAlert] = useState<{ name: string; amount: number; msg: string } | null>(null);
  const streamIntervalRef = useRef<any>(null);

  // Verification request state
  const [verificationStep, setVerificationStep] = useState<'none' | 'submitting' | 'submitted'>('none');
  const [category, setCategory] = useState('Musician / Producer');
  const [docFile, setDocFile] = useState<string | null>(null);

  // Donation test state
  const [testTipAmount, setTestTipAmount] = useState('10');
  const [testTipName, setTestTipName] = useState('Alex');
  const [testTipMsg, setTestTipMsg] = useState('Keep making beautiful sounds!');

  // Post Boosting states
  const [selectedPostToBoost, setSelectedPostToBoost] = useState('');
  const [boostedPostIds, setBoostedPostIds] = useState<string[]>([]);

  // Ads manager states
  const [campaigns, setCampaigns] = useState([
    { id: 'c1', name: 'Midsummer Waves Launch', budget: 150, spent: 85, clicks: 1240, impressions: 34200, status: 'Active', target: 'Electronic Music Lovers' },
    { id: 'c2', name: 'Cozy Synth Preset Ad', budget: 75, spent: 75, clicks: 890, impressions: 18900, status: 'Completed', target: 'Amateur producers' }
  ]);
  const [adName, setAdName] = useState('');
  const [adBudget, setAdBudget] = useState('100');
  const [adTargeting, setAdTargeting] = useState('Global creators');

  // Checkout modal states
  const [purchasingProduct, setPurchasingProduct] = useState<any | null>(null);
  const [purchasedDone, setPurchasedDone] = useState(false);

  // Live timer effect
  useEffect(() => {
    if (isLive) {
      setStreamChat([
        { id: '1', sender: 'System', text: '⚡️ Broadcaster stream successfully established via Pulse Cloud Node.' },
        { id: '2', sender: 'Clara_Wave', text: 'OMG! Finally going live! 💖' }
      ]);
      setLiveViewers(12);
      setStreamTimer(0);

      streamIntervalRef.current = setInterval(() => {
        setStreamTimer(prev => prev + 1);
        
        // Random viewers join / leave
        setLiveViewers(prev => {
          const delta = Math.floor(Math.random() * 5) - 2;
          return Math.max(8, prev + delta);
        });

        // Add random chat messages
        const chatTemplates = [
          { sender: 'Xavier', text: 'This synth preset sounds incredibly lush!' },
          { sender: 'sound_engineer_99', text: 'What audio buffer rate are you running?' },
          { sender: 'LunaSpark', text: 'Absolutely loving these vibes. Absolute masterclass ✨' },
          { sender: 'BeatCrush', text: 'Incredible visual setup.' },
          { sender: 'Julia_K', text: 'Can you show us your customized LFO filters?' }
        ];

        if (Math.random() > 0.4) {
          const randChat = chatTemplates[Math.floor(Math.random() * chatTemplates.length)];
          setStreamChat(prev => [...prev.slice(-25), {
            id: String(Date.now()),
            sender: randChat.sender,
            text: randChat.text
          }]);
        }

        // Random Tip donation simulation
        if (Math.random() > 0.8) {
          const tipNames = ['Ethan', 'Sophia', 'RhythmLord', 'MelodyMaker'];
          const amounts = [5, 10, 20, 50];
          const messages = ['Spectacular performance!', 'Thanks for teaching us!', 'Synthesizer levels are gold!', 'Absolute fire 🔥'];
          
          const randName = tipNames[Math.floor(Math.random() * tipNames.length)];
          const randAmount = amounts[Math.floor(Math.random() * amounts.length)];
          const randMsg = messages[Math.floor(Math.random() * messages.length)];

          const newTip: ChatMessage = {
            id: String(Date.now() + 1),
            sender: randName,
            text: `Sent a $${randAmount} tip! - "${randMsg}"`,
            isTip: true,
            tipAmount: randAmount
          };

          setStreamChat(prev => [...prev.slice(-25), newTip]);
          setLatestDonationAlert({ name: randName, amount: randAmount, msg: randMsg });
          
          // Clear donation toast after 5s
          setTimeout(() => {
            setLatestDonationAlert(null);
          }, 5000);
        }

      }, 2000);
    } else {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
      }
      setLiveViewers(0);
      setStreamTimer(0);
    }

    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, [isLive]);

  // Handle manual message in stream
  const handleSendStreamChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedChat.trim()) return;
    setStreamChat(prev => [...prev, {
      id: String(Date.now()),
      sender: currentUser?.displayName || 'Host',
      text: typedChat
    }]);
    setTypedChat('');
  };

  // Trigger floating reaction on stream screen
  const handleAddFloatingReaction = (emoji: string) => {
    const id = String(Date.now() + Math.random());
    const left = Math.floor(Math.random() * 80) + 10; // random left horizontal percent
    setFloatingReactions(prev => [...prev, { id, emoji, left }]);
    
    // Auto clear reaction
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== id));
    }, 2500);
  };

  // Test send manual tip
  const handleSendManualTip = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(testTipAmount) || 5;
    const name = testTipName || 'Supporter';
    const msg = testTipMsg || 'Supporting your creative stream!';

    if (isLive) {
      setStreamChat(prev => [...prev, {
        id: String(Date.now()),
        sender: name,
        text: `Sent a $${amt} tip! - "${msg}"`,
        isTip: true,
        tipAmount: amt
      }]);
      setLatestDonationAlert({ name, amount: amt, msg });
      setTimeout(() => setLatestDonationAlert(null), 5000);
    } else {
      alert(`Success! Simulated donation of $${amt} received from ${name}! 💖`);
    }

    setTestTipName('');
    setTestTipMsg('');
  };

  // Submit creator verification
  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationStep('submitting');
    setTimeout(() => {
      setVerificationStep('submitted');
    }, 1500);
  };

  // Create mock advertisement campaign
  const handleCreateAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adName.trim()) return;
    
    const budget = parseFloat(adBudget) || 100;
    const newCampaign = {
      id: String(Date.now()),
      name: adName,
      budget,
      spent: 0,
      clicks: 0,
      impressions: 0,
      status: 'Active',
      target: adTargeting
    };

    setCampaigns([newCampaign, ...campaigns]);
    
    if (onRegisterAdCampaign) {
      onRegisterAdCampaign(budget, adName);
    }

    setAdName('');
    setAdBudget('100');
    setAdTargeting('Global creators');
    alert('⚡️ Sponsored Campaign launched successfully in the Pulse Ads Manager! Revenue logged for Website Owner.');
  };

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const containerStyle = theme === 'glass'
    ? 'bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-white/20 dark:border-zinc-800/20 shadow-md'
    : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 shadow-sm';

  const inputStyle = 'w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs text-zinc-900 dark:text-zinc-50';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 text-sm animate-fade-in">
      
      {/* Dynamic Title and Stats Row */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 px-2">
        <div>
          <h2 className="font-display font-black text-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            Creator & Business Terminal
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Grow your audience, monetize waveforms, and manage marketing campaigns.
          </p>
        </div>

        {/* Small badge list */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[10px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
            <Award className="w-3.5 h-3.5" />
            <span>Exclusive Partner Level 1</span>
          </span>
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" />
            <span>$4,124.80 Earned</span>
          </span>
        </div>
      </div>

      {/* Primary Sub-Tabs Menu */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto scrollbar-none pb-0.5 gap-1">
        {[
          { id: 'stream', label: 'Live Stream Station', icon: Radio },
          { id: 'monetize', label: 'Monetization Desk', icon: DollarSign },
          { id: 'ads', label: 'Sponsored Ads Center', icon: Target },
          { id: 'market', label: 'Product Marketplace', icon: ShoppingBag },
          { id: 'analytics', label: 'Video & Engagement Analytics', icon: BarChart3 }
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`hub-sub-tab-${tab.id}`}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all shrink-0 ${
                active 
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400' 
                  : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT SECTIONS */}

      {/* 1. LIVE STREAM STATION */}
      {activeSubTab === 'stream' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* Simulated Broadcast Monitor Screen (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className={`rounded-3xl border overflow-hidden relative ${containerStyle}`}>
              {/* Outer screen content */}
              <div className="aspect-video bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden select-none">
                
                {/* Simulated Camera Waveform Video Backdrop */}
                {isLive ? (
                  <>
                    {/* Live streaming mock animation backdrop */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-950 via-zinc-900 to-indigo-950 flex flex-col items-center justify-center">
                      <div className="relative w-36 h-36 flex items-center justify-center">
                        <div className="absolute inset-0 border border-purple-500 rounded-full animate-ping opacity-25" />
                        <div className="absolute -inset-4 border-2 border-pink-500 rounded-full animate-pulse opacity-40" />
                        <img 
                          src={currentUser?.avatarUrl} 
                          alt="avatar profile" 
                          className="w-24 h-24 rounded-full border-4 border-purple-500/50 object-cover" 
                        />
                      </div>
                      
                      {/* Interactive audio spectrum visualizer */}
                      <div className="flex items-end gap-1.5 h-10 mt-6">
                        {[16, 32, 24, 48, 40, 56, 12, 28, 44, 36, 52, 20].map((h, i) => (
                          <div 
                            key={i} 
                            style={{ height: `${h}px` }}
                            className="w-1.5 bg-gradient-to-t from-pink-500 via-purple-500 to-indigo-500 rounded-full animate-bounce"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Left overlay stats */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                      <span className="px-2.5 py-1 bg-red-600 text-white font-extrabold text-[9px] rounded-lg flex items-center gap-1 shadow-md uppercase tracking-wider animate-pulse">
                        <span className="h-1.5 w-1.5 rounded-full bg-white block" />
                        <span>Live</span>
                      </span>
                      <span className="px-2.5 py-1 bg-zinc-900/80 text-zinc-200 font-bold text-[9px] rounded-lg backdrop-blur shadow-md">
                        {liveViewers} viewing
                      </span>
                    </div>

                    {/* Right overlay timer */}
                    <div className="absolute top-4 right-4 z-10">
                      <span className="px-2.5 py-1 bg-zinc-900/80 text-zinc-200 font-mono text-[9px] rounded-lg backdrop-blur shadow-md">
                        {formatTime(streamTimer)}
                      </span>
                    </div>

                    {/* Dynamic Floating Emojis Reaction container */}
                    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                      {floatingReactions.map(r => (
                        <span 
                          key={r.id}
                          style={{ left: `${r.left}%` }}
                          className="absolute bottom-6 text-2xl animate-bounce pointer-events-none select-none"
                        >
                          {r.emoji}
                        </span>
                      ))}
                    </div>

                    {/* Floating Toast alert on $ donation */}
                    {latestDonationAlert && (
                      <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white p-3.5 rounded-2xl shadow-2xl flex items-center gap-3 z-30 animate-bounce border border-white/20">
                        <div className="h-9 w-9 bg-white/20 rounded-xl flex items-center justify-center font-black">
                          💰
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="text-[11px] font-black">{latestDonationAlert.name} tipped ${latestDonationAlert.amount}!</p>
                          <p className="text-[10px] opacity-90 truncate italic">"{latestDonationAlert.msg}"</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center p-6 text-zinc-500 flex flex-col items-center">
                    <Radio className="w-12 h-12 text-zinc-700 dark:text-zinc-500 mb-3 animate-pulse" />
                    <p className="font-display font-extrabold text-sm text-zinc-300">Broadcaster Deck Offline</p>
                    <p className="text-[11px] max-w-xs mt-1 text-zinc-400">Establish streaming connection via WebRTC proxy nodes to broadcast your wave synthesizers live.</p>
                  </div>
                )}
              </div>

              {/* Bottom interactive controls panel */}
              <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between gap-4">
                <button
                  id="btn-stream-toggle"
                  onClick={() => setIsLive(!isLive)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-md ${
                    isLive 
                      ? 'bg-red-600 text-white shadow-red-500/10' 
                      : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-purple-500/20'
                  }`}
                >
                  {isLive ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>End Live Stream</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Go Live Broadcast</span>
                    </>
                  )}
                </button>

                {/* Micro Reaction Quick Tappers */}
                {isLive && (
                  <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-xl">
                    <span className="text-[10px] font-bold text-zinc-400 px-2 uppercase tracking-wide">React:</span>
                    {['❤️', '🔥', '👏', '🎵', '😍'].map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => handleAddFloatingReaction(emoji)}
                        className="p-1 text-sm hover:scale-125 transition-transform active:scale-90"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Test Support Console panel */}
            <div className={`p-5 rounded-3xl border ${containerStyle}`}>
              <h4 className="font-display font-bold text-sm text-zinc-950 dark:text-zinc-50 mb-3 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-purple-500" />
                <span>Simulate Supporter Tips & Donations</span>
              </h4>
              <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                Test how tips and dynamic donation banners render in your live broadcast. Fill the form to trigger a supporter event:
              </p>

              <form onSubmit={handleSendManualTip} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Supporter name"
                  value={testTipName}
                  onChange={e => setTestTipName(e.target.value)}
                  className={inputStyle}
                />
                <input
                  type="number"
                  placeholder="Tip amount ($)"
                  value={testTipAmount}
                  onChange={e => setTestTipAmount(e.target.value)}
                  className={inputStyle}
                />
                <input
                  type="text"
                  placeholder="Support message text"
                  value={testTipMsg}
                  onChange={e => setTestTipMsg(e.target.value)}
                  className={inputStyle}
                />
                <button
                  type="submit"
                  className="sm:col-span-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl text-xs font-bold transition-all text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800"
                >
                  Inject Simulated Tip Event
                </button>
              </form>
            </div>
          </div>

          {/* Simulated Chat Feed (5 cols) */}
          <div className="lg:col-span-5 flex flex-col h-[520px] max-h-[520px]">
            <div className={`rounded-3xl border flex-1 flex flex-col overflow-hidden ${containerStyle}`}>
              <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-950/30 border-b border-zinc-100 dark:border-zinc-800/60 flex justify-between items-center">
                <span className="font-display font-bold text-xs text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Live Chat Feed</span>
                {isLive && (
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </div>

              {/* Chat output */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none">
                {streamChat.map(c => (
                  <div 
                    key={c.id} 
                    className={`p-2.5 rounded-xl text-xs leading-relaxed ${
                      c.isTip 
                        ? 'bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border border-purple-500/20 font-bold'
                        : 'bg-zinc-100/50 dark:bg-zinc-800/40'
                    }`}
                  >
                    <div className="flex justify-between items-baseline mb-1">
                      <span className={`font-semibold ${c.isTip ? 'text-purple-600 dark:text-purple-400' : 'text-zinc-500 dark:text-zinc-400'}`}>
                        @{c.sender}
                      </span>
                      {c.isTip && (
                        <span className="px-2 py-0.5 bg-purple-500 text-white font-extrabold text-[8px] rounded-full">
                          Tip ${c.tipAmount}
                        </span>
                      )}
                    </div>
                    <span className="text-zinc-800 dark:text-zinc-200 font-normal">{c.text}</span>
                  </div>
                ))}

                {streamChat.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                    <MessageSquare className="w-8 h-8 text-zinc-700 dark:text-zinc-600 mb-2" />
                    <span className="text-xs">Stream Chat is empty</span>
                  </div>
                )}
              </div>

              {/* Chat input form */}
              {isLive && (
                <form onSubmit={handleSendStreamChat} className="p-3 border-t border-zinc-100 dark:border-zinc-800/60 flex gap-2">
                  <input
                    type="text"
                    placeholder="Type wave chat..."
                    value={typedChat}
                    onChange={e => setTypedChat(e.target.value)}
                    className={inputStyle}
                  />
                  <button
                    type="submit"
                    className="p-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 active:scale-95 transition-all shadow-md shadow-purple-500/10"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      )}

      {/* 2. MONETIZATION DESK */}
      {activeSubTab === 'monetize' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Top visual revenue summary banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Active Subscribers Tiers', val: '148 accounts', change: '+12% this month' },
              { label: 'Monthly Wave Tips', val: '$840.00', change: 'Avg $12.50 per tip' },
              { label: 'Pending Payout', val: '$1,240.50', change: 'Scheduled July 5' }
            ].map((card, i) => (
              <div key={i} className={`p-5 rounded-3xl border ${containerStyle}`}>
                <span className="text-xs text-zinc-400 block font-medium">{card.label}</span>
                <span className="font-display font-extrabold text-2xl text-zinc-950 dark:text-zinc-50 mt-1 block">{card.val}</span>
                <span className="text-[10px] text-emerald-500 font-bold mt-1.5 block">{card.change}</span>
              </div>
            ))}
          </div>

          {/* Creators Subscriptions Options Setup */}
          <div className={`p-6 rounded-3xl border ${containerStyle}`}>
            <h3 className="font-display font-bold text-base text-zinc-900 dark:text-zinc-100 mb-3">
              Configure Creator Subscription Tiers
            </h3>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              Define exclusive content pricing tiers for your profile. Subscribers unlock premium wave downloads, access to draft posts, and members-only live video streams:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Bronze Wave Member', price: '4.99', members: 94, features: ['Premium Wave Downloads', 'Badge icon in live stream', 'Access scheduled posts'] },
                { title: 'Silver Audio Master', price: '9.99', members: 42, features: ['All Bronze tier perks', 'Audio synthesizers source files', 'Exclusive drafts comments'] },
                { title: 'Gold Synaptic Creator', price: '24.99', members: 12, features: ['All Silver tier perks', '1-on-1 private audio reviews', 'Early product releases'] }
              ].map((tier, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-xs text-zinc-500 dark:text-zinc-400 block uppercase tracking-wider">{tier.title}</span>
                    <div className="flex items-baseline gap-1 mt-2.5">
                      <span className="font-display font-extrabold text-2xl text-zinc-900 dark:text-zinc-50">${tier.price}</span>
                      <span className="text-[10px] text-zinc-400">/ month</span>
                    </div>

                    <span className="text-[11px] font-bold text-purple-500 block mt-1.5">{tier.members} active subscribers</span>

                    <ul className="mt-4 space-y-2 border-t border-zinc-100 dark:border-zinc-800/40 pt-3">
                      {tier.features.map((feat, fIdx) => (
                        <li key={fIdx} className="text-[11px] text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button className="w-full mt-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:opacity-90 active:scale-95 text-xs font-bold transition-all shadow-md">
                    Manage Tier Config
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Badge Request */}
          <div className={`p-6 rounded-3xl border ${containerStyle}`}>
            <h3 className="font-display font-bold text-base text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-sky-500 fill-sky-500" />
              <span>Creator Verification Badge Request</span>
            </h3>
            <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
              Verify your authenticity to obtain a blue badge icon. Verified Creators appear higher in recommended algorithms, gain trust, and receive direct tip support from global sponsors:
            </p>

            {verificationStep === 'none' && (
              <form onSubmit={handleVerificationSubmit} className="space-y-4 max-w-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 block">Creator Category</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className={inputStyle}
                    >
                      <option>Musician / Producer</option>
                      <option>Visual Graphic Artist</option>
                      <option>Tech Blogger / Developer</option>
                      <option>Brand Agency / Co.</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 block">Official Reference Link (Website/Portfolio)</label>
                    <input
                      type="url"
                      required
                      placeholder="https://example.com/portfolio"
                      className={inputStyle}
                    />
                  </div>
                </div>

                {/* Drag and Drop mockup */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 block">Official Identity Document (Passport/Driver License)</label>
                  <div className="p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-zinc-100/30 dark:hover:bg-zinc-950/20 transition-all cursor-pointer">
                    <Plus className="w-6 h-6 text-zinc-400 mb-2" />
                    <p className="font-semibold text-xs text-zinc-700 dark:text-zinc-300">Click to select or drag verification document here</p>
                    <p className="text-[10px] text-zinc-400 mt-1">PNG, JPG or PDF formats accepted up to 10MB limit.</p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl hover:opacity-90 active:scale-95 text-xs transition-all shadow-md"
                >
                  Submit Official Request
                </button>
              </form>
            )}

            {verificationStep === 'submitting' && (
              <div className="py-12 text-center space-y-3">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="font-bold text-xs text-zinc-700 dark:text-zinc-300">Uploading documents and generating IPFS security checksum...</p>
              </div>
            )}

            {verificationStep === 'submitted' && (
              <div className="p-5 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl flex items-start gap-3.5 text-emerald-700 dark:text-emerald-400">
                <CheckSquare className="w-5 h-5 shrink-0" />
                <div>
                  <p className="font-bold text-xs">Verification Documents Submitted Successfully!</p>
                  <p className="text-[11px] mt-1 leading-relaxed opacity-90">
                    The Pulse Moderation Center and Admin Section audit team are reviewing your request. Audits are processed securely within 48-72 hours. Check your email alerts for updates.
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* 3. SPONSORED ADS CENTER */}
      {activeSubTab === 'ads' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* Ad Campaign builder (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className={`p-5 rounded-3xl border ${containerStyle}`}>
              <h3 className="font-display font-bold text-base text-zinc-900 dark:text-zinc-100 mb-3">
                Launch Sponsored Ad Campaign
              </h3>
              <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                Reach targeted feeds! Promoted sponsored posts appear seamlessly in the creative timeline with custom action link indicators:
              </p>

              <form onSubmit={handleCreateAd} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 block">Ad Campaign Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Summer Tour Announcement"
                    value={adName}
                    onChange={e => setAdName(e.target.value)}
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 block">Daily Budget Limit ($)</label>
                  <input
                    type="number"
                    required
                    value={adBudget}
                    onChange={e => setAdBudget(e.target.value)}
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 block">Target Audience Demographics</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Synth-wave fans, musicians, 18-35"
                    value={adTargeting}
                    onChange={e => setAdTargeting(e.target.value)}
                    className={inputStyle}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl hover:opacity-90 active:scale-95 text-xs transition-all shadow-md"
                >
                  Publish Campaign Active
                </button>
              </form>
            </div>

            {/* Feed Post Boosting Card */}
            <div className={`p-5 rounded-3xl border ${containerStyle} space-y-4`}>
              <div className="flex items-center gap-1.5">
                <Megaphone className="w-5 h-5 text-purple-500" />
                <h3 className="font-display font-bold text-base text-zinc-900 dark:text-zinc-100">
                  Boost Active Post
                </h3>
              </div>
              
              <p className="text-xs text-zinc-400 leading-relaxed">
                Multiply organic wave loops! Promoting a post displays a "Boosted 🔥" icon in global timelines, elevating reach in recommended algorithmic channels for a fixed **$25.00** flat tariff.
              </p>

              {posts.filter(p => p.userId === currentUser?.id).length === 0 ? (
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950/20 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center">
                  <span className="text-zinc-500 font-medium text-[11px] block">No active posts available to boost.</span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">Share a creative audio wave or story on your home feed first!</span>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 block">Select Post to Promote</label>
                    <select
                      value={selectedPostToBoost}
                      onChange={e => setSelectedPostToBoost(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs text-zinc-900 dark:text-zinc-50"
                    >
                      <option value="">-- Choose one of your posts --</option>
                      {posts.filter(p => p.userId === currentUser?.id).map(p => (
                        <option key={p.id} value={p.id}>
                          "{p.content.slice(0, 35)}..." ({p.likes.length} likes)
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    id="btn-boost-post"
                    type="button"
                    disabled={!selectedPostToBoost}
                    onClick={() => {
                      if (!selectedPostToBoost) return;
                      const postObj = posts.find(p => p.id === selectedPostToBoost);
                      if (!postObj) return;

                      if (onRegisterBusinessPromotion) {
                        onRegisterBusinessPromotion(25.00, `Boost Post: "${postObj.content.slice(0, 25)}..."`);
                      }

                      setBoostedPostIds(prev => [...prev, selectedPostToBoost]);
                      setSelectedPostToBoost('');
                      alert('🚀 Success! Post boosted to VIP creative feed channels. $25.00 promotional tariff logged to owner treasury.');
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 disabled:from-zinc-100 disabled:to-zinc-100 disabled:text-zinc-400 dark:disabled:from-zinc-850 dark:disabled:to-zinc-850 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Boost Selected Post ($25.00)</span>
                  </button>

                  {boostedPostIds.length > 0 && (
                    <div className="space-y-1.5 pt-1.5">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block">Promoted Waves</span>
                      <div className="flex flex-wrap gap-1.5">
                        {boostedPostIds.map(id => {
                          const pObj = posts.find(p => p.id === id);
                          if (!pObj) return null;
                          return (
                            <span key={id} className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 font-bold rounded-full text-[9px] flex items-center gap-1 animate-pulse">
                              <span>🔥 Boosted:</span>
                              <span className="max-w-[120px] truncate">"{pObj.content.slice(0, 25)}..."</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Active Campaigns List (7 cols) */}
          <div className="lg:col-span-7">
            <div className={`p-5 rounded-3xl border flex flex-col h-full ${containerStyle}`}>
              <h3 className="font-display font-bold text-base text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-1.5">
                <Target className="w-5 h-5 text-indigo-500" />
                <span>Active Campaign Metrics</span>
              </h3>

              <div className="space-y-3.5 flex-1 overflow-y-auto">
                {campaigns.map(c => {
                  const percentSpent = Math.min(100, (c.spent / c.budget) * 100);
                  return (
                    <div key={c.id} className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-xs text-zinc-900 dark:text-zinc-50 block">{c.name}</span>
                          <span className="text-[10px] text-zinc-400 mt-0.5 block">Targeting: {c.target}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          c.status === 'Active' 
                            ? 'bg-emerald-500/10 text-emerald-500' 
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                        }`}>
                          {c.status}
                        </span>
                      </div>

                      {/* Stat chips row */}
                      <div className="grid grid-cols-3 gap-2 border-t border-b border-zinc-100 dark:border-zinc-800/40 py-2 text-center">
                        <div>
                          <span className="text-[9px] text-zinc-400 uppercase font-semibold block">Impressions</span>
                          <span className="font-display font-extrabold text-xs text-zinc-800 dark:text-zinc-200 block">{c.impressions.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-400 uppercase font-semibold block">Clicks (CTR)</span>
                          <span className="font-display font-extrabold text-xs text-zinc-800 dark:text-zinc-200 block">{c.clicks} ({(c.impressions > 0 ? ((c.clicks/c.impressions)*100).toFixed(2) : 0)}%)</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-400 uppercase font-semibold block">Budget Cap</span>
                          <span className="font-display font-extrabold text-xs text-zinc-800 dark:text-zinc-200 block">${c.spent} / ${c.budget}</span>
                        </div>
                      </div>

                      {/* Spend progress bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-zinc-400">
                          <span>Spend tracking</span>
                          <span className="font-semibold">{percentSpent.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                          <div 
                            style={{ width: `${percentSpent}%` }}
                            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full" 
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 4. PRODUCT MARKETPLACE */}
      {activeSubTab === 'market' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Header promo block */}
          <div className="p-5 rounded-3xl bg-indigo-500/5 border border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs flex gap-3.5 items-start">
            <ShoppingBag className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-sm block">Creative Waves Marketplace</span>
              <p className="mt-1 leading-relaxed text-zinc-600 dark:text-zinc-400">
                Purchase sound packages, preset synthesizer parameters, digital albums, and official merchandises published directly by active artists in our decentralised catalog. Securely verified in preview mode.
              </p>
            </div>
          </div>

          {/* Product grid list */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {STOCK_PRODUCTS.map(prod => (
              <div key={prod.id} className={`rounded-3xl border overflow-hidden flex flex-col justify-between ${containerStyle}`}>
                <div className="h-40 bg-zinc-100 dark:bg-zinc-800 relative">
                  <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                  <span className="absolute top-3 right-3 px-2 py-0.5 bg-zinc-900/80 text-white font-bold text-[9px] rounded-md backdrop-blur">
                    {prod.category}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-50 leading-tight">{prod.name}</h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">{prod.desc}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-baseline">
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-xs text-zinc-400 font-bold">$</span>
                        <span className="font-display font-extrabold text-xl text-zinc-900 dark:text-zinc-50">{prod.price}</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-bold">{prod.sales} licenses sold</span>
                    </div>

                    <button
                      id={`btn-marketplace-buy-${prod.id}`}
                      onClick={() => {
                        setPurchasingProduct(prod);
                        setPurchasedDone(false);
                      }}
                      className="w-full py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-bold transition-all border border-zinc-200 dark:border-zinc-800"
                    >
                      Buy Wave License
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Modal Overlay simulation */}
          {purchasingProduct && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden p-6 relative">
                
                {purchasedDone ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto animate-bounce">
                      <Check className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-display font-extrabold text-lg text-zinc-900 dark:text-zinc-50">Transaction Securely Compiled!</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
                        Your custom waves presets license token was written to local state storage. Access keys are now available in your logs.
                      </p>
                    </div>
                    <button
                      onClick={() => setPurchasingProduct(null)}
                      className="px-6 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold rounded-xl text-xs hover:opacity-90 active:scale-95"
                    >
                      Close Checkout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-display font-extrabold text-base text-zinc-900 dark:text-zinc-50">Pulse Secured Checkout</h4>
                      <button 
                        onClick={() => setPurchasingProduct(null)}
                        className="text-zinc-400 hover:text-zinc-600 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </div>

                    {/* Product short review */}
                    <div className="flex gap-3 items-center p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-100 dark:border-zinc-800/40">
                      <img src={purchasingProduct.image} alt={purchasingProduct.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200 block truncate">{purchasingProduct.name}</span>
                        <span className="text-[10px] text-zinc-400 mt-0.5 block">{purchasingProduct.category}</span>
                      </div>
                      <span className="font-display font-extrabold text-sm text-zinc-900 dark:text-zinc-50">${purchasingProduct.price}</span>
                    </div>

                    {/* Pay button */}
                    <button
                      id="btn-confirm-mock-payment"
                      onClick={() => {
                        setPurchasedDone(true);
                        if (onRegisterPlatformFee) {
                          const fee = Number((purchasingProduct.price * 0.15).toFixed(2));
                          onRegisterPlatformFee(fee, `15% Marketplace Fee: "${purchasingProduct.name}"`);
                        }
                      }}
                      className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-2xl hover:opacity-95 active:scale-98 text-xs shadow-lg shadow-purple-500/10 flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Confirm Secure Trial Payment (${purchasingProduct.price}.00)</span>
                    </button>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>
      )}

      {/* 5. VIDEO & ENGAGEMENT ANALYTICS */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Top visual charts with pure Tailwind CSS charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Short videos retention rate mock */}
            <div className={`p-5 rounded-3xl border ${containerStyle}`}>
              <h4 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-50 mb-3 flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-pink-500" />
                <span>Shorts Audience Playtime Retention</span>
              </h4>
              <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                Percentage of active accounts still watching after initial loop triggers:
              </p>

              <div className="space-y-4">
                {[
                  { label: '0s - Hook Trigger', pct: 100, color: 'bg-indigo-500' },
                  { label: '3s - Interest Locked', pct: 82, color: 'bg-purple-500' },
                  { label: '6s - Wave Drop', pct: 64, color: 'bg-pink-500' },
                  { label: '10s - Loop Complete', pct: 45, color: 'bg-rose-500' }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-zinc-600 dark:text-zinc-400">{item.label}</span>
                      <span className="font-extrabold text-zinc-900 dark:text-zinc-50">{item.pct}%</span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                      <div 
                        style={{ width: `${item.pct}%` }}
                        className={`h-full ${item.color} rounded-full`} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Engagement metrics card */}
            <div className={`p-5 rounded-3xl border ${containerStyle}`}>
              <h4 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-50 mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>Weekly Interactive Transactions</span>
              </h4>
              <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                Aggregated activity clicks including profile, custom links, and message waves:
              </p>

              {/* Bar charts pure Tailwind */}
              <div className="h-40 flex items-end gap-3.5 border-b border-zinc-100 dark:border-zinc-800/60 pb-1">
                {[
                  { label: 'Follows', val: 78, h: 'h-24', color: 'from-pink-500 to-purple-500' },
                  { label: 'Bookmarks', val: 56, h: 'h-16', color: 'from-purple-500 to-indigo-500' },
                  { label: 'Likes', val: 94, h: 'h-32', color: 'from-pink-500 to-rose-500' },
                  { label: 'Shares', val: 41, h: 'h-12', color: 'from-indigo-500 to-sky-500' }
                ].map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-zinc-950 dark:text-zinc-50 font-extrabold">{bar.val}</span>
                    <div className={`w-full bg-gradient-to-t ${bar.color} rounded-lg ${bar.h}`} />
                    <span className="text-[10px] text-zinc-400 font-bold mt-1">{bar.label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Micro analytics stats ticker */}
          <div className="p-4 rounded-2xl bg-zinc-100/50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-purple-500" />
              <span>Wave Compression active: Optimized CDN asset delivery is running at 94.2% loading speed ratio.</span>
            </span>
            <span className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 hover:underline cursor-pointer">
              <span>Sync logs</span>
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>

        </div>
      )}

    </div>
  );
}
