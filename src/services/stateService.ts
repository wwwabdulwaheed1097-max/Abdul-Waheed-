import { User, Post, Story, ShortVideo, Chat, Message, Notification, Report, Comment, Reply, OwnerEarnings, PlatformTransaction, EasypaisaPayment } from '../types';
import { mockUsers, mockPosts, mockStories, mockShortVideos, mockChats, mockMessages, mockNotifications, mockReports, mockComments } from '../data/seedData';

export interface PulseState {
  users: User[];
  posts: Post[];
  comments: { [postId: string]: Comment[] };
  stories: Story[];
  shortVideos: ShortVideo[];
  chats: Chat[];
  messages: Message[];
  notifications: Notification[];
  reports: Report[];
  currentUserId: string | null;
  blockedUsers: string[]; // List of user IDs current user has blocked
  savedPosts: string[]; // List of post IDs saved by current user
  ownerEarnings: OwnerEarnings;
  platformTransactions: PlatformTransaction[];
  easypaisaPayments: EasypaisaPayment[];
}

const STORAGE_KEY = 'pulse_social_state_v1';

export const getInitialState = (): PulseState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Ensure backward compatibility if stored state does not contain earnings
      if (!parsed.ownerEarnings) {
        parsed.ownerEarnings = {
          adRevenue: 1250.00,
          premiumRevenue: 850.00,
          promotionRevenue: 450.00,
          platformFeeRevenue: 285.50,
          total: 2835.50
        };
      }
      if (!parsed.platformTransactions) {
        parsed.platformTransactions = [
          { id: 'tx_1', type: 'ad_campaign', amount: 250.00, userId: 'user_2', description: 'Synth Wave Essentials Campaign Ad Boost', createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() },
          { id: 'tx_2', type: 'premium_plan', amount: 19.99, userId: 'user_3', description: 'Ultra Premium Plan Monthly Subscription', createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
          { id: 'tx_3', type: 'business_promotion', amount: 50.00, userId: 'user_4', description: 'Boost Post: "Official album launch tomorrow!"', createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString() },
          { id: 'tx_4', type: 'platform_fee', amount: 15.00, userId: 'user_2', description: '15% Marketplace Sale Platform Commission', createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString() }
        ];
      }
      if (!parsed.easypaisaPayments) {
        parsed.easypaisaPayments = [
          {
            id: 'ep_1',
            userId: 'user_2',
            amount: 1500,
            senderPhone: '03001234567',
            txId: '819203841029',
            receiptFileName: 'receipt_screen_1500.png',
            status: 'approved',
            purpose: 'wallet_topup',
            createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
            verifiedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000 + 300000).toISOString()
          },
          {
            id: 'ep_2',
            userId: 'user_3',
            amount: 2500,
            senderPhone: '03129876543',
            txId: '918230192831',
            receiptFileName: 'easypaisa_receipt.jpg',
            status: 'pending',
            purpose: 'wallet_topup',
            createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
          }
        ];
      }
      // Ensure all users have a walletBalance field
      parsed.users = parsed.users.map((u: User) => ({
        ...u,
        walletBalance: typeof u.walletBalance === 'number' ? u.walletBalance : (u.id === 'user_1' ? 5000 : 0)
      }));
      return parsed;
    } catch (e) {
      console.error('Error parsing saved state', e);
    }
  }

  // Initial setup with rich seeds
  const seededUsers = mockUsers.map(u => ({
    ...u,
    walletBalance: u.id === 'user_1' ? 5000 : 0
  }));

  return {
    users: seededUsers,
    posts: mockPosts,
    comments: mockComments,
    stories: mockStories,
    shortVideos: mockShortVideos,
    chats: mockChats,
    messages: mockMessages,
    notifications: mockNotifications,
    reports: mockReports,
    currentUserId: 'user_1', // Logged in as Alex Rivers by default for instant premium preview
    blockedUsers: [],
    savedPosts: ['post_1'],
    ownerEarnings: {
      adRevenue: 1250.00,
      premiumRevenue: 850.00,
      promotionRevenue: 450.00,
      platformFeeRevenue: 285.50,
      total: 2835.50
    },
    platformTransactions: [
      { id: 'tx_1', type: 'ad_campaign', amount: 250.00, userId: 'user_2', description: 'Synth Wave Essentials Campaign Ad Boost', createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() },
      { id: 'tx_2', type: 'premium_plan', amount: 19.99, userId: 'user_3', description: 'Ultra Premium Plan Monthly Subscription', createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
      { id: 'tx_3', type: 'business_promotion', amount: 50.00, userId: 'user_4', description: 'Boost Post: "Official album launch tomorrow!"', createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString() },
      { id: 'tx_4', type: 'platform_fee', amount: 15.00, userId: 'user_2', description: '15% Marketplace Sale Platform Commission', createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString() }
    ],
    easypaisaPayments: [
      {
        id: 'ep_1',
        userId: 'user_2',
        amount: 1500,
        senderPhone: '03001234567',
        txId: '819203841029',
        receiptFileName: 'receipt_screen_1500.png',
        status: 'approved',
        purpose: 'wallet_topup',
        createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        verifiedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000 + 300000).toISOString()
      },
      {
        id: 'ep_2',
        userId: 'user_3',
        amount: 2500,
        senderPhone: '03129876543',
        txId: '918230192831',
        receiptFileName: 'easypaisa_receipt.jpg',
        status: 'pending',
        purpose: 'wallet_topup',
        createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
      }
    ]
  };
};

export const saveState = (state: PulseState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};
