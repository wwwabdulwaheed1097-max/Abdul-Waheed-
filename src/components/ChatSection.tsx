import { useState, useRef, useEffect, FormEvent } from 'react';
import { 
  Send, Image as ImageIcon, Mic, Smile, Phone, Video as VideoIcon, 
  CheckCheck, UserPlus, Info, Play, Pause, Square, Check, MessageSquareCode,
  Lock, Unlock, Paperclip, PhoneOff, MicOff, VideoOff, MonitorUp, File, Shield, Eye, EyeOff
} from 'lucide-react';
import { Chat, Message, User } from '../types';

interface ChatSectionProps {
  chats: Chat[];
  messages: Message[];
  users: User[];
  currentUser: User | null;
  onSendMessage: (chatId: string, type: 'text' | 'image' | 'voice', content: string, duration?: number) => void;
  onStartChat: (isGroup: boolean, participants: string[], name?: string) => string | null;
  theme: 'light' | 'dark' | 'glass';
}

const POPULAR_EMOJIS = ['😀', '😂', '😍', '🔥', '✨', '👍', '💯', '🎉', '🚀', '❤️', '👏', '🎨'];

const CHAT_IMAGE_PRESETS = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=350&fit=crop',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&h=350&fit=crop',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&h=350&fit=crop'
];

export default function ChatSection({
  chats,
  messages,
  users,
  currentUser,
  onSendMessage,
  onStartChat,
  theme
}: ChatSectionProps) {
  const [activeChatId, setActiveChatId] = useState<string | null>(chats[0]?.id || null);
  const [typedMessage, setTypedMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showImageDropdown, setShowImageDropdown] = useState(false);

  // E2E and extra security
  const [isE2EEnabled, setIsE2EEnabled] = useState(false);
  const [revealedEncryptedMsgs, setRevealedEncryptedMsgs] = useState<{ [id: string]: boolean }>({});

  // Calling states
  const [activeCall, setActiveCall] = useState<'voice' | 'video' | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // File sharing states
  const [showFileUploader, setShowFileUploader] = useState(false);
  const [fileUploadProgress, setFileUploadProgress] = useState(0);
  const [fileUploadName, setFileUploadName] = useState('');

  // Voice message simulation state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingInterval = useRef<any>(null);

  // Voice message playing state
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [voiceProgress, setVoiceProgress] = useState<{ [id: string]: number }>({});
  const playTimer = useRef<any>(null);

  // Call timer effect
  useEffect(() => {
    let interval: any = null;
    if (activeCall) {
      setCallDuration(0);
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeCall]);

  // Group creation state
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  // Auto scroll to message bottom
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeChatId]);

  // Voice recording timer
  useEffect(() => {
    if (isRecording) {
      recordingInterval.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
      setRecordingSeconds(0);
    }
    return () => {
      if (recordingInterval.current) clearInterval(recordingInterval.current);
    };
  }, [isRecording]);

  const activeChat = chats.find(c => c.id === activeChatId);
  const activeChatMessages = messages.filter(m => m.chatId === activeChatId);

  // Group details helper
  const getChatPartner = (chat: Chat) => {
    if (chat.isGroup) return null;
    const partnerId = chat.participants.find(p => p !== currentUser?.id);
    return users.find(u => u.id === partnerId) || null;
  };

  // File upload simulation runner
  const handleSendSharedFile = (fileName: string, fileSize: string) => {
    if (!activeChatId) return;
    setFileUploadName(fileName);
    setFileUploadProgress(10);
    setShowFileUploader(false);

    let prog = 10;
    const interval = setInterval(() => {
      prog += 30;
      setFileUploadProgress(Math.min(100, prog));
      if (prog >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onSendMessage(activeChatId, 'text', `📁 Shared File: ${fileName} (${fileSize})`);
          setFileUploadProgress(0);
          setFileUploadName('');
        }, 500);
      }
    }, 250);
  };

  const handleSendMessageSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeChatId) return;
    onSendMessage(activeChatId, 'text', typedMessage);
    setTypedMessage('');
    setShowEmojiPicker(false);
  };

  const handleSendPresetImage = (url: string) => {
    if (!activeChatId) return;
    onSendMessage(activeChatId, 'image', url);
    setShowImageDropdown(false);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleStopAndSendVoice = () => {
    if (!activeChatId || !isRecording) return;
    setIsRecording(false);
    const duration = recordingSeconds || 3;
    onSendMessage(activeChatId, 'voice', `voice_msg_simulation_duration_${duration}`, duration);
  };

  const handlePlayVoice = (msgId: string, duration: number) => {
    if (playingVoiceId === msgId) {
      // Pause
      setPlayingVoiceId(null);
      if (playTimer.current) clearInterval(playTimer.current);
      return;
    }

    setPlayingVoiceId(msgId);
    setVoiceProgress(prev => ({ ...prev, [msgId]: 0 }));

    let prog = 0;
    playTimer.current = setInterval(() => {
      prog += 10;
      setVoiceProgress(prev => ({ ...prev, [msgId]: prog }));
      if (prog >= 100) {
        setPlayingVoiceId(null);
        if (playTimer.current) clearInterval(playTimer.current);
      }
    }, (duration * 1000) / 10);
  };

  // Group chat creation handler
  const handleCreateGroupChatSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || selectedParticipants.length === 0) return;

    const newChatId = onStartChat(true, selectedParticipants, groupName);
    if (newChatId) {
      setActiveChatId(newChatId);
    }

    // Reset Group Creation
    setGroupName('');
    setSelectedParticipants([]);
    setShowCreateGroup(false);
  };

  const handleToggleParticipant = (userId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const containerStyle = theme === 'glass'
    ? 'bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-white/20 dark:border-zinc-800/20'
    : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800';

  const sideListStyle = theme === 'glass'
    ? 'bg-white/30 dark:bg-zinc-950/30 border-white/10'
    : 'bg-zinc-50/50 dark:bg-zinc-950/30 border-zinc-200 dark:border-zinc-800';

  return (
    <div className={`grid grid-cols-1 md:grid-cols-12 rounded-3xl border shadow-xl overflow-hidden h-[calc(100vh-120px)] ${containerStyle}`}>
      
      {/* Left Chat List Column */}
      <div className={`md:col-span-4 border-r border-zinc-100 dark:border-zinc-800 flex flex-col h-full ${sideListStyle}`}>
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
          <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-50">Direct Messages</h3>
          <button
            id="btn-create-group-toggle"
            onClick={() => setShowCreateGroup(!showCreateGroup)}
            className="p-2 text-purple-600 dark:text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 rounded-xl text-xs font-semibold flex items-center gap-1 active:scale-95 transition-transform"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New Group</span>
          </button>
        </div>

        {/* Group Creation UI Panel overlay */}
        {showCreateGroup ? (
          <form onSubmit={handleCreateGroupChatSubmit} className="p-4 border-b border-zinc-100 dark:border-zinc-800 space-y-3 bg-white dark:bg-zinc-950 animate-fade-in text-sm">
            <input
              id="group-name-input"
              type="text"
              placeholder="Enter Group Name..."
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              <span className="text-xs font-semibold text-zinc-400">Select group members:</span>
              {users.map(user => {
                if (user.id === currentUser?.id) return null;
                const isSelected = selectedParticipants.includes(user.id);
                return (
                  <button
                    key={user.id}
                    id={`btn-toggle-participant-${user.id}`}
                    type="button"
                    onClick={() => handleToggleParticipant(user.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors ${isSelected ? 'bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/30' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <img src={user.avatarUrl} alt="Avatar" className="w-6 h-6 rounded-full object-cover" />
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{user.displayName}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-purple-500" />}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <button
                id="btn-create-group-chat"
                type="submit"
                disabled={!groupName.trim() || selectedParticipants.length === 0}
                className="flex-1 py-2 bg-purple-600 text-white font-semibold rounded-xl text-xs disabled:opacity-40 hover:bg-purple-700 transition-all"
              >
                Create Group
              </button>
              <button
                id="btn-cancel-group"
                type="button"
                onClick={() => setShowCreateGroup(false)}
                className="px-3 py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-xl text-xs hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        {/* Chat conversations Scroll */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {chats.map(chat => {
            const partner = getChatPartner(chat);
            const isActive = chat.id === activeChatId;

            const chatName = chat.isGroup ? chat.name : partner?.displayName;
            const chatAvatar = chat.isGroup ? chat.avatarUrl : partner?.avatarUrl;

            // Generate a cool simulated online status for single chat partners
            const isOnline = partner ? partner.id !== 'user_4' : false; // Elena is offline, others online

            return (
              <button
                key={chat.id}
                id={`chat-room-btn-${chat.id}`}
                onClick={() => setActiveChatId(chat.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-indigo-500/5 border border-purple-500/10' 
                    : 'hover:bg-white/40 dark:hover:bg-zinc-900/40'
                }`}
              >
                <div className="relative">
                  <img
                    src={chatAvatar}
                    alt={chatName}
                    className="w-11 h-11 rounded-full object-cover border border-zinc-100 dark:border-zinc-800"
                  />
                  {!chat.isGroup && isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-950" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-display font-semibold text-xs text-zinc-900 dark:text-zinc-50 truncate">
                      {chatName}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 truncate block">
                    {chat.isGroup ? 'Group channel active 💬' : isOnline ? 'Active now' : 'Last seen 2h ago'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Conversation View Column */}
      <div className="md:col-span-8 flex flex-col h-full bg-white dark:bg-zinc-900 relative">
        {activeChat ? (
          <>
            {/* Full-Screen Immersive VoIP Call Screen Overlay */}
            {activeCall && (
              <div className="absolute inset-0 bg-zinc-950/98 z-50 flex flex-col justify-between p-6 animate-fade-in text-white font-sans rounded-3xl">
                {/* Header Info Banner */}
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold font-mono">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>SECURE END-TO-END {activeCall.toUpperCase()} CALL</span>
                  </span>
                  <span className="font-mono text-zinc-400 font-bold bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                    {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, '0')}
                  </span>
                </div>

                {/* Calling stage area */}
                <div className="flex-1 flex items-center justify-center min-h-0 my-6">
                  {isScreenSharing ? (
                    /* SCREEN SHARE INTERACTIVE VIEW */
                    <div className="w-full max-w-xl aspect-video bg-zinc-900 rounded-2xl border border-purple-500/30 overflow-hidden flex flex-col justify-between relative shadow-2xl">
                      <div className="px-4 py-2 bg-purple-500/10 border-b border-purple-500/20 flex justify-between items-center text-[10px] font-bold">
                        <span className="text-purple-400 flex items-center gap-1">
                          <MonitorUp className="w-3.5 h-3.5" />
                          <span>Screen Sharing Workspace</span>
                        </span>
                        <span className="text-red-500 animate-pulse">● STREAMING LIVE</span>
                      </div>
                      <div className="flex-1 p-4 font-mono text-[10px] text-emerald-400 overflow-y-auto space-y-1 bg-black/40">
                        <p className="text-zinc-500">// Simulating active audio waves synthesis & display checks</p>
                        <p>import {"{ getStripe, GoogleGenAI }"} from &apos;pulse-core&apos;;</p>
                        <p>const client = new GoogleGenAI();</p>
                        <p>client.startAudioFeedbackSyncLoop(3000);</p>
                        <p className="text-emerald-500 font-bold">Latency connection: 12ms. Screen resolution: 1920x1080.</p>
                      </div>
                      <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-zinc-950/80 px-2.5 py-1 rounded-lg text-[10px] border border-white/5">
                        <img src={currentUser?.avatarUrl} className="w-4 h-4 rounded-full object-cover" />
                        <span>You (Presenter)</span>
                      </div>
                    </div>
                  ) : activeCall === 'video' && !isCamOff ? (
                    /* VIDEO CALL STAGE ROW GRID */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
                      {/* Partner Video */}
                      <div className="aspect-video bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 relative flex items-center justify-center shadow-md">
                        <img 
                          src={activeChat.isGroup ? activeChat.avatarUrl : getChatPartner(activeChat)?.avatarUrl} 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute bottom-3 left-3 bg-zinc-950/70 px-2 py-0.5 rounded text-[10px] font-bold text-white border border-white/5">
                          {activeChat.isGroup ? activeChat.name : getChatPartner(activeChat)?.displayName}
                        </div>
                      </div>
                      
                      {/* Self Camera Feed */}
                      <div className="aspect-video bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 relative flex items-center justify-center shadow-md">
                        <img 
                          src={currentUser?.avatarUrl} 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute bottom-3 left-3 bg-zinc-950/70 px-2 py-0.5 rounded text-[10px] font-bold text-white border border-white/5">
                          You
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* AUDIO VOICE OR WEBCAM BLOCKED VIEW */
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative">
                        {/* Interactive sound circles */}
                        <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping" style={{ animationDuration: '2s' }} />
                        <div className="absolute inset-0 rounded-full bg-indigo-500/10 animate-ping" style={{ animationDuration: '3.5s' }} />
                        
                        <img
                          src={activeChat.isGroup ? activeChat.avatarUrl : getChatPartner(activeChat)?.avatarUrl}
                          alt="avatar"
                          className="w-24 h-24 rounded-full object-cover relative border-2 border-purple-500 shadow-2xl z-10"
                        />
                      </div>
                      <div className="text-center">
                        <h4 className="font-display font-bold text-base">
                          {activeChat.isGroup ? activeChat.name : getChatPartner(activeChat)?.displayName}
                        </h4>
                        <span className="text-xs text-zinc-400 mt-1 block">
                          {isMuted ? 'Muted' : 'Speaking via secure microphone...'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Call controller bar */}
                <div className="flex justify-center items-center gap-4 py-2">
                  <button
                    id="btn-call-mute"
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-3.5 rounded-full border transition-all active:scale-90 ${
                      isMuted 
                        ? 'bg-rose-500/20 border-rose-500/30 text-rose-500' 
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    }`}
                    title="Mute microphone"
                  >
                    <MicOff className="w-5 h-5" />
                  </button>

                  {activeCall === 'video' && (
                    <button
                      id="btn-call-cam"
                      onClick={() => setIsCamOff(!isCamOff)}
                      className={`p-3.5 rounded-full border transition-all active:scale-90 ${
                        isCamOff 
                          ? 'bg-rose-500/20 border-rose-500/30 text-rose-500' 
                          : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                      }`}
                      title="Toggle Camera"
                    >
                      <VideoOff className="w-5 h-5" />
                    </button>
                  )}

                  <button
                    id="btn-call-screen-share"
                    onClick={() => setIsScreenSharing(!isScreenSharing)}
                    className={`p-3.5 rounded-full border transition-all active:scale-90 ${
                      isScreenSharing 
                        ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-500 font-bold' 
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    }`}
                    title="Share Screen"
                  >
                    <MonitorUp className="w-5 h-5" />
                  </button>

                  <button
                    id="btn-call-hang-up"
                    onClick={() => { setActiveCall(null); setIsScreenSharing(false); }}
                    className="p-3.5 bg-rose-500 text-white rounded-full hover:bg-rose-600 active:scale-90 transition-all shadow-lg"
                    title="Hang up call"
                  >
                    <PhoneOff className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
            {/* Active Conversation Header */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-950/20 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <img
                  src={activeChat.isGroup ? activeChat.avatarUrl : getChatPartner(activeChat)?.avatarUrl}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
                />
                <div>
                  <h4 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-50">
                    {activeChat.isGroup ? activeChat.name : getChatPartner(activeChat)?.displayName}
                  </h4>
                  <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-1">
                    {activeChat.isGroup ? `${activeChat.participants.length} members` : 'Active now'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* E2E Security Status Banner */}
                <button
                  id="btn-chat-e2e-toggle"
                  onClick={() => setIsE2EEnabled(!isE2EEnabled)}
                  className={`p-2 rounded-xl flex items-center gap-1.5 text-xs font-bold border transition-all active:scale-95 ${
                    isE2EEnabled 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-700'
                  }`}
                  title="Toggle End-to-End Encryption View"
                >
                  {isE2EEnabled ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="hidden sm:inline">E2E Secured</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">No E2E</span>
                    </>
                  )}
                </button>

                <button 
                  id="chat-call-btn" 
                  onClick={() => setActiveCall('voice')}
                  className="p-2 rounded-xl text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <Phone className="w-4.5 h-4.5" />
                </button>
                
                <button 
                  id="chat-video-btn" 
                  onClick={() => setActiveCall('video')}
                  className="p-2 rounded-xl text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <VideoIcon className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Conversation Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeChatMessages.map(msg => {
                const isMe = msg.senderId === currentUser?.id;
                const sender = users.find(u => u.id === msg.senderId);

                return (
                  <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                    {!isMe && (
                      <img
                        src={sender?.avatarUrl}
                        alt="Avatar"
                        className="w-7 h-7 rounded-full object-cover border mt-0.5"
                      />
                    )}

                    <div className="space-y-1">
                      {/* Message bubble */}
                      <div className={`p-3.5 rounded-2xl relative shadow-sm ${
                        isMe 
                          ? 'bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 text-white rounded-tr-none' 
                          : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-tl-none'
                      }`}>
                        
                        {/* Text message */}
                        {msg.type === 'text' && (
                          <div className="space-y-1.5">
                            {msg.content.startsWith('📁 Shared File:') ? (
                              <div className="flex items-center gap-3 p-2 bg-black/10 dark:bg-zinc-900/40 rounded-xl border border-white/5 max-w-sm">
                                <div className="p-2.5 bg-gradient-to-tr from-pink-500 to-purple-500 text-white rounded-lg">
                                  <File className="w-5.5 h-5.5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="font-bold text-xs block truncate text-zinc-900 dark:text-zinc-50">{msg.content.replace('📁 Shared File: ', '').split(' (')[0]}</span>
                                  <span className="text-[10px] text-zinc-400 block mt-0.5">Size: {msg.content.includes(' (') ? msg.content.split(' (')[1].replace(')', '') : 'Unknown'}</span>
                                </div>
                              </div>
                            ) : isE2EEnabled && !revealedEncryptedMsgs[msg.id] ? (
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs opacity-75 select-none bg-black/20 px-2 py-1 rounded-md">
                                  {"PGP_RSA::" + btoa(encodeURIComponent(msg.content)).slice(0, 16) + "..."}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setRevealedEncryptedMsgs(prev => ({ ...prev, [msg.id]: true }))}
                                  className="p-1 hover:bg-white/20 rounded text-[10px] flex items-center gap-1 font-bold"
                                  title="Click to decrypt locally"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Decrypt</span>
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <p className="text-sm leading-relaxed">{msg.content}</p>
                                {isE2EEnabled && (
                                  <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    <span>Decrypted via local key</span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Image message */}
                        {msg.type === 'image' && (
                          <div className="rounded-xl overflow-hidden border border-white/10 aspect-video max-w-sm">
                            <img src={msg.content} alt="Shared attachment" className="w-full h-full object-cover" />
                          </div>
                        )}

                        {/* Voice message */}
                        {msg.type === 'voice' && (
                          <div className="flex items-center gap-3 w-48 text-sm select-none">
                            <button
                              id={`btn-play-voice-${msg.id}`}
                              onClick={() => handlePlayVoice(msg.id, msg.voiceDuration || 3)}
                              className={`p-2 rounded-full flex items-center justify-center transition-transform active:scale-90 ${isMe ? 'bg-white text-purple-600' : 'bg-purple-600 text-white'}`}
                            >
                              {playingVoiceId === msg.id ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                            </button>
                            <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                              <div 
                                className={`h-full bg-white transition-all`}
                                style={{ width: `${playingVoiceId === msg.id ? (voiceProgress[msg.id] || 0) : 0}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold opacity-80">
                              0:0{msg.voiceDuration || 3}
                            </span>
                          </div>
                        )}

                      </div>

                      {/* Msg bottom line info */}
                      <div className={`flex items-center gap-1 text-[10px] text-zinc-400 ${isMe ? 'justify-end' : ''}`}>
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMe && (
                          <CheckCheck className="w-3.5 h-3.5 text-indigo-500 stroke-[2.5px]" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messageEndRef} />
            </div>

            {/* Interaction controls & message typing bar */}
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/20 relative">
              
              {/* Voice Message Recording Overlay */}
              {isRecording ? (
                <div id="recording-overlay" className="absolute inset-0 bg-white dark:bg-zinc-900 p-4 flex items-center justify-between z-20 animate-fade-in text-sm">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
                    </span>
                    <span className="font-semibold text-rose-500">Recording modular waves...</span>
                    <span className="font-mono text-zinc-500 font-bold">0:0{recordingSeconds}s</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      id="btn-voice-send"
                      type="button"
                      onClick={handleStopAndSendVoice}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1 active:scale-95"
                    >
                      <Check className="w-4 h-4" />
                      <span>Send</span>
                    </button>
                    <button
                      id="btn-voice-cancel"
                      type="button"
                      onClick={() => setIsRecording(false)}
                      className="px-4 py-2 border border-zinc-200 text-zinc-500 dark:text-zinc-400 text-xs hover:bg-zinc-50 rounded-xl"
                    >
                      Discard
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Emoji Picker Box popup */}
              {showEmojiPicker && (
                <div id="emoji-picker" className="absolute bottom-16 left-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 shadow-2xl grid grid-cols-6 gap-2 z-40 animate-fade-in">
                  {POPULAR_EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      id={`emoji-btn-${emoji}`}
                      onClick={() => setTypedMessage(prev => prev + emoji)}
                      className="text-xl p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg active:scale-90 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* Image Shared presets drop-up */}
              {showImageDropdown && (
                <div id="image-preset-picker" className="absolute bottom-16 left-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 shadow-2xl space-y-2 z-40 animate-fade-in text-xs w-48">
                  <span className="font-semibold text-zinc-400 mb-1 block">Share beautiful graphic preset:</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {CHAT_IMAGE_PRESETS.map((url, idx) => (
                      <button
                        key={idx}
                        id={`chat-img-preset-${idx}`}
                        type="button"
                        onClick={() => handleSendPresetImage(url)}
                        className="aspect-square rounded-lg overflow-hidden border hover:border-purple-500 active:scale-95 transition-all"
                      >
                        <img src={url} alt="preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* File Preset Uploader drop-up */}
              {showFileUploader && (
                <div id="file-preset-picker" className="absolute bottom-16 left-24 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3.5 shadow-2xl space-y-2 z-40 animate-fade-in text-xs w-56">
                  <span className="font-semibold text-zinc-400 mb-1 block">Choose file attachment:</span>
                  <div className="space-y-1">
                    {[
                      { name: 'modular_synth_v2.wav', size: '1.4 MB' },
                      { name: 'retro_lfo_patch.json', size: '12 KB' },
                      { name: 'production_preset_pulse.zip', size: '4.8 MB' }
                    ].map(f => (
                      <button
                        key={f.name}
                        id={`btn-file-preset-${f.name}`}
                        type="button"
                        onClick={() => handleSendSharedFile(f.name, f.size)}
                        className="w-full text-left p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-950/30 transition-colors flex items-center gap-2 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800/40"
                      >
                        <File className="w-4 h-4 text-purple-500 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <span className="block truncate font-bold text-zinc-800 dark:text-zinc-200">{f.name}</span>
                          <span className="text-[10px] text-zinc-400 block">{f.size}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* File Uploading Progress overlay */}
              {fileUploadProgress > 0 && (
                <div id="file-uploading-indicator" className="absolute inset-0 bg-white/95 dark:bg-zinc-950/95 p-4 flex items-center justify-between z-20 animate-fade-in text-sm backdrop-blur-sm">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-purple-500 text-white rounded-lg">
                      <File className="w-4 h-4 animate-bounce" />
                    </div>
                    <div className="flex-1 space-y-1 max-w-xs">
                      <span className="font-bold text-xs text-zinc-900 dark:text-zinc-50 block truncate">Uploading {fileUploadName}...</span>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-purple-500 h-full rounded-full transition-all duration-300" style={{ width: `${fileUploadProgress}%` }} />
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 shrink-0">{fileUploadProgress}%</span>
                </div>
              )}

              {/* Typed messaging bar */}
              <form onSubmit={handleSendMessageSubmit} className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <button
                    id="btn-chat-emoji-toggle"
                    type="button"
                    onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowImageDropdown(false); }}
                    className={`p-2.5 rounded-xl text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 ${showEmojiPicker ? 'bg-purple-500/10 text-purple-600' : ''}`}
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  <button
                    id="btn-chat-image-toggle"
                    type="button"
                    onClick={() => { setShowImageDropdown(!showImageDropdown); setShowEmojiPicker(false); }}
                    className={`p-2.5 rounded-xl text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 ${showImageDropdown ? 'bg-purple-500/10 text-purple-600' : ''}`}
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button
                    id="btn-chat-mic"
                    type="button"
                    onClick={handleStartRecording}
                    className="p-2.5 rounded-xl text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                  <button
                    id="btn-chat-file-toggle"
                    type="button"
                    onClick={() => { setShowFileUploader(!showFileUploader); setShowEmojiPicker(false); setShowImageDropdown(false); }}
                    className={`p-2.5 rounded-xl text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 ${showFileUploader ? 'bg-purple-500/10 text-purple-600' : ''}`}
                    title="Share File"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                </div>

                <input
                  id="chat-message-input"
                  type="text"
                  placeholder="Type your wave message here..."
                  value={typedMessage}
                  onChange={e => setTypedMessage(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                />

                <button
                  id="btn-chat-send"
                  type="submit"
                  disabled={!typedMessage.trim()}
                  className="p-2.5 bg-gradient-to-tr from-pink-500 to-purple-500 text-white rounded-xl shadow-md hover:opacity-95 disabled:opacity-30 active:scale-95 transition-all"
                >
                  <Send className="w-4.5 h-4.5" />
                </button>
              </form>

            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-zinc-500 select-none">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500/10 to-purple-500/10 flex items-center justify-center text-purple-500 mb-4">
              <MessageSquareCode className="w-8 h-8" />
            </div>
            <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-50 mb-1">Pulse Creative Messages</h3>
            <p className="text-sm text-zinc-500 max-w-sm">
              Open a conversation or start a group channel with other modular synthesists and product builders in the Pulse network.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
