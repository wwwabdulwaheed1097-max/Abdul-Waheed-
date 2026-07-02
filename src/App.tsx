import { useState, useEffect } from 'react';
import { usePulse } from './hooks/usePulse';

// Screens & Sections
import Navbar from './components/Navbar';
import StorySection from './components/StorySection';
import FeedSection from './components/FeedSection';
import ShortsSection from './components/ShortsSection';
import ChatSection from './components/ChatSection';
import SearchSection from './components/SearchSection';
import ProfileSection from './components/ProfileSection';
import NotificationsSection from './components/NotificationsSection';
import SettingsSection from './components/SettingsSection';
import AdminSection from './components/AdminSection';
import AuthSection from './components/AuthSection';
import CommunitiesSection from './components/CommunitiesSection';
import CreatorBusinessHub from './components/CreatorBusinessHub';
import DeveloperHub from './components/DeveloperHub';
import WalletSection from './components/WalletSection';

export default function App() {
  const {
    state,
    currentUser,
    users,
    allUsers,
    posts,
    comments,
    stories,
    shortVideos,
    chats,
    messages,
    notifications,
    reports,
    savedPosts,
    ownerEarnings,
    platformTransactions,
    easypaisaPayments,
    
    // Actions
    login,
    logout,
    updateProfile,
    followUser,
    blockUser,
    createPost,
    likePost,
    savePost,
    votePoll,
    addComment,
    createStory,
    reactStory,
    startNewChat,
    sendChatMessage,
    markNotificationsAsRead,
    reportContent,
    resolveReport,
    purchasePremiumPlan,
    registerAdCampaign,
    registerBusinessPromotion,
    registerPlatformFee,
    submitEasypaisaPayment,
    verifyEasypaisaPayment,
    purchaseWithWallet
  } = usePulse();

  const [activeTab, setActiveTab] = useState<'home' | 'shorts' | 'messages' | 'search' | 'notifications' | 'settings' | 'admin' | 'profile' | 'communities' | 'creator' | 'developer' | 'wallet'>('home');
  const [theme, setTheme] = useState<'light' | 'dark' | 'glass'>('dark'); // start in beautiful dark mode
  const [activeProfileUserId, setActiveProfileUserId] = useState<string | null>(null);

  // Sync language reload trigger
  const [langVersion, setLangVersion] = useState(0);
  useEffect(() => {
    const handleLang = () => {
      setLangVersion(prev => prev + 1);
    };
    window.addEventListener('pulse_lang_change', handleLang);
    return () => window.removeEventListener('pulse_lang_change', handleLang);
  }, []);

  // Sync font size initial loading class on mount
  useEffect(() => {
    const size = localStorage.getItem('pulse_font_size') || 'base';
    const appRoot = document.getElementById('pulse-app-root');
    if (appRoot) {
      appRoot.classList.remove('[font-size:13px]', '[font-size:14px]', '[font-size:16px]', '[font-size:18px]');
      let fontSizeClass = '[font-size:14px]';
      if (size === 'sm') fontSizeClass = '[font-size:13px]';
      if (size === 'lg') fontSizeClass = '[font-size:16px]';
      if (size === 'xl') fontSizeClass = '[font-size:18px]';
      appRoot.classList.add(fontSizeClass);
    }
  }, []);

  // Sync dark class for Tailwind
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark' || theme === 'glass') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Handle direct log-in redirects
  const handleUserLogin = (email: string, username: string) => {
    login(email, username);
    setActiveTab('home');
  };

  const handleOpenUserProfile = (userId: string) => {
    setActiveProfileUserId(userId);
    setActiveTab('profile');
  };

  const handleSwitchActiveUser = (userId: string) => {
    login('', allUsers.find(u => u.id === userId)?.username || '');
    setActiveTab('home');
  };

  if (!currentUser) {
    return <AuthSection onLogin={handleUserLogin} theme={theme} />;
  }

  // Count unreads
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;
  // Count chats with messages not read yet (we can simulate 1 chat is unread initially!)
  const unreadMessagesCount = 1;

  const bgStyle = theme === 'light'
    ? 'bg-zinc-50 text-zinc-900'
    : theme === 'dark'
      ? 'bg-zinc-950 text-zinc-100'
      : 'bg-gradient-to-tr from-zinc-950 via-zinc-900 to-indigo-950/40 text-zinc-100 min-h-screen';

  return (
    <div id="pulse-app-root" className={`min-h-screen font-sans transition-colors duration-300 ${bgStyle} pb-16 md:pb-0`}>
      
      {/* Top ambient decor only for Glass theme */}
      {theme === 'glass' && (
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-tr from-purple-500/10 via-pink-500/5 to-transparent blur-3xl rounded-full pointer-events-none" />
      )}

      {/* Navigation Layout */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab as any);
          if (tab !== 'profile') {
            setActiveProfileUserId(null);
          }
        }}
        unreadNotifications={unreadNotificationsCount}
        unreadMessages={unreadMessagesCount}
        isAdmin={!!currentUser.isAdmin}
        onLogout={logout}
        theme={theme}
      />

      {/* Main Content Layout Container */}
      <main id="main-content" className="md:pl-72 max-w-7xl mx-auto px-4 pt-6 md:pt-10">
        
        {/* Dynamic header for mobile */}
        <header className="flex md:hidden justify-between items-center mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center text-white font-extrabold text-sm">P</div>
            <span className="font-display font-black text-xl bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Pulse</span>
          </div>
          
          <button 
            id="mobile-avatar-btn"
            onClick={() => handleOpenUserProfile(currentUser.id)} 
            className="w-8 h-8 rounded-full overflow-hidden border border-zinc-200"
          >
            <img src={currentUser.avatarUrl} alt="Your profile" className="w-full h-full object-cover" />
          </button>
        </header>

        {/* Screen Dispatcher */}
        <div className="animate-fade-in duration-300">
          
          {activeTab === 'home' && (
            <div className="space-y-6">
              {/* Stories Panel */}
              <StorySection
                stories={stories}
                users={users}
                currentUser={currentUser}
                onCreateStory={createStory}
                onReactStory={reactStory}
                theme={theme}
              />
              {/* Home Feed */}
              <FeedSection
                posts={posts}
                users={users}
                currentUser={currentUser}
                comments={comments}
                savedPosts={savedPosts}
                onCreatePost={createPost}
                onLikePost={likePost}
                onSavePost={savePost}
                onVotePoll={votePoll}
                onAddComment={addComment}
                onReportContent={reportContent}
                onBlockUser={blockUser}
                onOpenProfile={handleOpenUserProfile}
                theme={theme}
              />
            </div>
          )}

          {activeTab === 'shorts' && (
            <ShortsSection
              shortVideos={shortVideos}
              users={users}
              currentUser={currentUser}
              onLikeShort={likePost} // using general post actions
              onFollowCreator={followUser}
              theme={theme}
            />
          )}

          {activeTab === 'messages' && (
            <ChatSection
              chats={chats}
              messages={messages}
              users={users}
              currentUser={currentUser}
              onSendMessage={sendChatMessage}
              onStartChat={startNewChat}
              theme={theme}
            />
          )}

          {activeTab === 'search' && (
            <SearchSection
              posts={posts}
              users={users}
              onOpenProfile={handleOpenUserProfile}
              onLikePost={likePost}
              theme={theme}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationsSection
              notifications={notifications}
              users={users}
              onMarkRead={markNotificationsAsRead}
              theme={theme}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsSection
              currentUser={currentUser}
              allUsers={allUsers}
              onUpdateProfile={updateProfile}
              onSwitchUser={handleSwitchActiveUser}
              theme={theme}
              setTheme={setTheme}
              onPurchasePremium={purchasePremiumPlan}
              onSubmitEasypaisaPayment={submitEasypaisaPayment}
              onPurchaseWithWallet={purchaseWithWallet}
            />
          )}

          {activeTab === 'admin' && currentUser.isAdmin && (
            <AdminSection
              reports={reports}
              allUsers={allUsers}
              posts={posts}
              onResolveReport={resolveReport}
              onBlockUser={blockUser}
              theme={theme}
              ownerEarnings={ownerEarnings}
              platformTransactions={platformTransactions}
              easypaisaPayments={easypaisaPayments}
              onVerifyEasypaisaPayment={verifyEasypaisaPayment}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileSection
              userId={activeProfileUserId || currentUser.id}
              users={users}
              posts={posts}
              currentUser={currentUser}
              comments={comments}
              savedPosts={savedPosts}
              onFollowUser={followUser}
              onLikePost={likePost}
              onSavePost={savePost}
              theme={theme}
            />
          )}

          {activeTab === 'communities' && (
            <CommunitiesSection
              currentUser={currentUser}
              users={users}
              theme={theme}
            />
          )}

          {activeTab === 'creator' && (
            <CreatorBusinessHub
              currentUser={currentUser}
              theme={theme}
              onRegisterAdCampaign={registerAdCampaign}
              onRegisterPlatformFee={registerPlatformFee}
              onRegisterBusinessPromotion={registerBusinessPromotion}
              posts={posts}
            />
          )}

          {activeTab === 'developer' && (
            <DeveloperHub
              theme={theme}
            />
          )}

          {activeTab === 'wallet' && (
            <WalletSection
              currentUser={currentUser}
              easypaisaPayments={easypaisaPayments}
              platformTransactions={platformTransactions}
              onSubmitPayment={submitEasypaisaPayment}
              theme={theme}
            />
          )}

        </div>

      </main>

    </div>
  );
}
