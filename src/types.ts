export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  bio: string;
  avatarUrl: string;
  coverUrl: string;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  followers: string[];
  following: string[];
  createdAt: string;
  isAdmin?: boolean;
  isBlocked?: boolean;
  isPremium?: boolean;
  premiumTier?: 'standard' | 'ultra' | null;
  walletBalance?: number; // In Rs. (PKR) for Pakistan Easypaisa integration
}

export interface OwnerEarnings {
  adRevenue: number;
  premiumRevenue: number;
  promotionRevenue: number;
  platformFeeRevenue: number;
  total: number;
}

export interface PlatformTransaction {
  id: string;
  type: 'ad_campaign' | 'premium_plan' | 'business_promotion' | 'platform_fee';
  amount: number;
  userId: string;
  description: string;
  createdAt: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: string[]; // list of userIds who voted for this option
}

export interface Poll {
  question: string;
  options: PollOption[];
}

export interface Post {
  id: string;
  userId: string;
  type: 'text' | 'image' | 'video' | 'poll';
  content: string;
  mediaUrl?: string;
  videoUrl?: string;
  poll?: Poll;
  hashtags: string[];
  mentions: string[];
  likes: string[];
  commentsCount: number;
  sharesCount: number;
  savedBy: string[];
  createdAt: string;
}

export interface Reply {
  id: string;
  commentId: string;
  userId: string;
  content: string;
  createdAt: string;
  likes: string[];
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  likes: string[];
  replies: Reply[];
}

export interface StoryReaction {
  userId: string;
  emoji: string;
}

export interface Story {
  id: string;
  userId: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  createdAt: string;
  expiresAt: string;
  reactions: StoryReaction[];
}

export interface ShortVideo {
  id: string;
  userId: string;
  videoUrl: string;
  caption: string;
  hashtags: string[];
  likes: string[];
  commentsCount?: number;
  sharesCount?: number;
  createdAt: string;
}

export interface Chat {
  id: string;
  isGroup: boolean;
  name?: string;
  avatarUrl?: string;
  participants: string[];
  lastMessageAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  type: 'text' | 'image' | 'voice';
  content: string;
  createdAt: string;
  readBy: string[];
  voiceDuration?: number;
}

export interface Notification {
  id: string;
  recipientId: string;
  senderId: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'message';
  postId?: string;
  chatId?: string;
  message?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  reportedById: string;
  contentType: 'post' | 'comment' | 'user';
  contentId: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface EasypaisaPayment {
  id: string;
  userId: string;
  amount: number; // in PKR
  senderPhone: string; // sender number
  txId: string; // unique transaction hash or ID
  receiptFileName?: string;
  status: 'pending' | 'approved' | 'rejected';
  purpose: 'wallet_topup' | 'premium_plan' | 'ad_campaign' | 'business_promotion';
  purposeDetails?: {
    tier?: 'standard' | 'ultra';
    campaignBudget?: number;
    campaignName?: string;
    postIdToBoost?: string;
    postDescToBoost?: string;
  };
  createdAt: string;
  verifiedAt?: string;
}
