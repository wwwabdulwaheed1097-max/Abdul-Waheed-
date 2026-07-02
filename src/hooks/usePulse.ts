import { useState, useEffect, useCallback } from 'react';
import { getInitialState, saveState, PulseState } from '../services/stateService';
import { User, Post, Comment, Reply, Story, ShortVideo, Chat, Message, Notification, Report, PlatformTransaction, EasypaisaPayment } from '../types';

export const usePulse = () => {
  const [state, setState] = useState<PulseState>(getInitialState());

  // Automatically save state whenever it changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  const currentUser = state.users.find(u => u.id === state.currentUserId) || null;

  // Authentication
  const login = useCallback((email: string, username: string) => {
    // If user exists, log in. Else create new one
    const existing = state.users.find(u => u.email === email || u.username === username);
    if (existing) {
      setState(prev => ({ ...prev, currentUserId: existing.id }));
      return existing;
    } else {
      // Create new user
      const newUser: User = {
        id: `user_${Date.now()}`,
        username: username.toLowerCase().replace(/\s+/g, '_') || `user_${Date.now()}`,
        displayName: username || 'Pulse Explorer',
        email: email,
        bio: 'New explorer of the Pulse network. 🌐',
        avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000)}?w=150&h=150&fit=crop`,
        coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=300&fit=crop',
        isVerified: false,
        followersCount: 0,
        followingCount: 0,
        followers: [],
        following: [],
        createdAt: new Date().toISOString()
      };
      setState(prev => ({
        ...prev,
        users: [...prev.users, newUser],
        currentUserId: newUser.id
      }));
      return newUser;
    }
  }, [state.users]);

  const logout = useCallback(() => {
    setState(prev => ({ ...prev, currentUserId: null }));
  }, []);

  const updateProfile = useCallback((displayName: string, bio: string, avatarUrl: string, coverUrl: string) => {
    if (!state.currentUserId) return;
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => 
        u.id === prev.currentUserId 
          ? { ...u, displayName, bio, avatarUrl, coverUrl }
          : u
      )
    }));
  }, [state.currentUserId]);

  // Social Connections
  const followUser = useCallback((targetUserId: string) => {
    if (!state.currentUserId || state.currentUserId === targetUserId) return;
    setState(prev => {
      const isFollowing = prev.users.find(u => u.id === prev.currentUserId)?.following.includes(targetUserId);
      
      const updatedUsers = prev.users.map(u => {
        if (u.id === prev.currentUserId) {
          const following = isFollowing 
            ? u.following.filter(id => id !== targetUserId)
            : [...u.following, targetUserId];
          return { ...u, following, followingCount: following.length };
        }
        if (u.id === targetUserId) {
          const followers = isFollowing
            ? u.followers.filter(id => id !== prev.currentUserId)
            : [...u.followers, prev.currentUserId!];
          return { ...u, followers, followersCount: followers.length };
        }
        return u;
      });

      // Create notification for follow
      const newNotifs = [...prev.notifications];
      if (!isFollowing) {
        newNotifs.push({
          id: `notif_${Date.now()}`,
          recipientId: targetUserId,
          senderId: prev.currentUserId!,
          type: 'follow',
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }

      return { ...prev, users: updatedUsers, notifications: newNotifs };
    });
  }, [state.currentUserId]);

  const blockUser = useCallback((targetUserId: string) => {
    if (!state.currentUserId || state.currentUserId === targetUserId) return;
    setState(prev => {
      const alreadyBlocked = prev.blockedUsers.includes(targetUserId);
      const blockedUsers = alreadyBlocked
        ? prev.blockedUsers.filter(id => id !== targetUserId)
        : [...prev.blockedUsers, targetUserId];

      // Remove from following/followers list automatically
      const updatedUsers = prev.users.map(u => {
        if (u.id === prev.currentUserId) {
          const following = u.following.filter(id => id !== targetUserId);
          const followers = u.followers.filter(id => id !== targetUserId);
          return { ...u, following, followers, followingCount: following.length, followersCount: followers.length };
        }
        if (u.id === targetUserId) {
          const following = u.following.filter(id => id !== prev.currentUserId);
          const followers = u.followers.filter(id => id !== prev.currentUserId);
          return { ...u, following, followers, followingCount: following.length, followersCount: followers.length };
        }
        return u;
      });

      return { ...prev, blockedUsers, users: updatedUsers };
    });
  }, [state.currentUserId]);

  // Post Actions
  const createPost = useCallback((
    type: 'text' | 'image' | 'video' | 'poll',
    content: string,
    mediaUrl?: string,
    videoUrl?: string,
    pollData?: { question: string; options: string[] }
  ) => {
    if (!state.currentUserId) return;
    
    // Extract hashtags and mentions
    const hashtags = (content.match(/#[a-zA-Z0-9_]+/g) || []).map(h => h.slice(1));
    const mentions = (content.match(/@[a-zA-Z0-9_]+/g) || []).map(m => m.slice(1));

    const newPost: Post = {
      id: `post_${Date.now()}`,
      userId: state.currentUserId,
      type,
      content,
      mediaUrl,
      videoUrl,
      poll: pollData ? {
        question: pollData.question,
        options: pollData.options.map((opt, idx) => ({ id: `opt_${idx}_${Date.now()}`, text: opt, votes: [] }))
      } : undefined,
      hashtags,
      mentions,
      likes: [],
      commentsCount: 0,
      sharesCount: 0,
      savedBy: [],
      createdAt: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      posts: [newPost, ...prev.posts],
      comments: { ...prev.comments, [newPost.id]: [] }
    }));
  }, [state.currentUserId]);

  const likePost = useCallback((postId: string) => {
    if (!state.currentUserId) return;
    setState(prev => {
      const updatedPosts = prev.posts.map(p => {
        if (p.id === postId) {
          const isLiked = p.likes.includes(prev.currentUserId!);
          const likes = isLiked
            ? p.likes.filter(id => id !== prev.currentUserId)
            : [...p.likes, prev.currentUserId!];
          
          return { ...p, likes };
        }
        return p;
      });

      const post = prev.posts.find(p => p.id === postId);
      const isLikedNow = post ? !post.likes.includes(prev.currentUserId!) : false;
      const newNotifs = [...prev.notifications];

      if (post && isLikedNow && post.userId !== prev.currentUserId) {
        newNotifs.push({
          id: `notif_${Date.now()}`,
          recipientId: post.userId,
          senderId: prev.currentUserId!,
          type: 'like',
          postId,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }

      return { ...prev, posts: updatedPosts, notifications: newNotifs };
    });
  }, [state.currentUserId]);

  const savePost = useCallback((postId: string) => {
    if (!state.currentUserId) return;
    setState(prev => {
      const isSaved = prev.savedPosts.includes(postId);
      const savedPosts = isSaved
        ? prev.savedPosts.filter(id => id !== postId)
        : [...prev.savedPosts, postId];
      
      const updatedPosts = prev.posts.map(p => {
        if (p.id === postId) {
          const savedBy = isSaved
            ? p.savedBy.filter(id => id !== prev.currentUserId)
            : [...p.savedBy, prev.currentUserId!];
          return { ...p, savedBy };
        }
        return p;
      });

      return { ...prev, savedPosts, posts: updatedPosts };
    });
  }, [state.currentUserId]);

  const votePoll = useCallback((postId: string, optionId: string) => {
    if (!state.currentUserId) return;
    setState(prev => {
      const updatedPosts = prev.posts.map(p => {
        if (p.id === postId && p.poll) {
          // Check if user already voted anywhere in this poll
          const hasVoted = p.poll.options.some(opt => opt.votes.includes(prev.currentUserId!));
          if (hasVoted) return p; // Cannot revote or vote multiple times

          const options = p.poll.options.map(opt => {
            if (opt.id === optionId) {
              return { ...opt, votes: [...opt.votes, prev.currentUserId!] };
            }
            return opt;
          });
          return { ...p, poll: { ...p.poll, options } };
        }
        return p;
      });
      return { ...prev, posts: updatedPosts };
    });
  }, [state.currentUserId]);

  // Comments and Replies
  const addComment = useCallback((postId: string, content: string) => {
    if (!state.currentUserId) return;
    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      postId,
      userId: state.currentUserId,
      content,
      createdAt: new Date().toISOString(),
      likes: [],
      replies: []
    };

    setState(prev => {
      const postComments = prev.comments[postId] || [];
      const updatedComments = {
        ...prev.comments,
        [postId]: [...postComments, newComment]
      };

      const updatedPosts = prev.posts.map(p => {
        if (p.id === postId) {
          return { ...p, commentsCount: p.commentsCount + 1 };
        }
        return p;
      });

      const post = prev.posts.find(p => p.id === postId);
      const newNotifs = [...prev.notifications];

      if (post && post.userId !== prev.currentUserId) {
        newNotifs.push({
          id: `notif_${Date.now()}`,
          recipientId: post.userId,
          senderId: prev.currentUserId!,
          type: 'comment',
          postId,
          message: content.length > 30 ? `${content.slice(0, 30)}...` : content,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }

      return {
        ...prev,
        comments: updatedComments,
        posts: updatedPosts,
        notifications: newNotifs
      };
    });
  }, [state.currentUserId]);

  const addReply = useCallback((postId: string, commentId: string, content: string) => {
    if (!state.currentUserId) return;
    const newReply: Reply = {
      id: `reply_${Date.now()}`,
      commentId,
      userId: state.currentUserId,
      content,
      createdAt: new Date().toISOString(),
      likes: []
    };

    setState(prev => {
      const postComments = prev.comments[postId] || [];
      const updatedPostComments = postComments.map(c => {
        if (c.id === commentId) {
          return { ...c, replies: [...c.replies, newReply] };
        }
        return c;
      });

      return {
        ...prev,
        comments: {
          ...prev.comments,
          [postId]: updatedPostComments
        }
      };
    });
  }, [state.currentUserId]);

  const likeComment = useCallback((postId: string, commentId: string) => {
    if (!state.currentUserId) return;
    setState(prev => {
      const postComments = prev.comments[postId] || [];
      const updatedComments = postComments.map(c => {
        if (c.id === commentId) {
          const isLiked = c.likes.includes(prev.currentUserId!);
          const likes = isLiked
            ? c.likes.filter(id => id !== prev.currentUserId)
            : [...c.likes, prev.currentUserId!];
          return { ...c, likes };
        }
        return c;
      });
      return {
        ...prev,
        comments: { ...prev.comments, [postId]: updatedComments }
      };
    });
  }, [state.currentUserId]);

  // Stories
  const createStory = useCallback((mediaUrl: string, mediaType: 'image' | 'video') => {
    if (!state.currentUserId) return;
    const newStory: Story = {
      id: `story_${Date.now()}`,
      userId: state.currentUserId,
      mediaUrl,
      mediaType,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      reactions: []
    };
    setState(prev => ({
      ...prev,
      stories: [newStory, ...prev.stories]
    }));
  }, [state.currentUserId]);

  const reactStory = useCallback((storyId: string, emoji: string) => {
    if (!state.currentUserId) return;
    setState(prev => {
      const updatedStories = prev.stories.map(s => {
        if (s.id === storyId) {
          const alreadyReacted = s.reactions.some(r => r.userId === prev.currentUserId && r.emoji === emoji);
          const reactions = alreadyReacted
            ? s.reactions.filter(r => !(r.userId === prev.currentUserId && r.emoji === emoji))
            : [...s.reactions, { userId: prev.currentUserId!, emoji }];
          return { ...s, reactions };
        }
        return s;
      });
      return { ...prev, stories: updatedStories };
    });
  }, [state.currentUserId]);

  // Chat/Messaging
  const startNewChat = useCallback((isGroup: boolean, participantIds: string[], name?: string, avatarUrl?: string) => {
    if (!state.currentUserId) return null;
    const participants = isGroup 
      ? Array.from(new Set([state.currentUserId, ...participantIds]))
      : [state.currentUserId, participantIds[0]];

    // Check if single chat already exists
    if (!isGroup) {
      const existing = state.chats.find(c => !c.isGroup && c.participants.includes(state.currentUserId!) && c.participants.includes(participantIds[0]));
      if (existing) return existing.id;
    }

    const newChat: Chat = {
      id: `chat_${Date.now()}`,
      isGroup,
      name,
      avatarUrl: isGroup ? (avatarUrl || 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=100&h=100&fit=crop') : undefined,
      participants,
      lastMessageAt: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      chats: [newChat, ...prev.chats]
    }));

    return newChat.id;
  }, [state.currentUserId, state.chats]);

  const sendChatMessage = useCallback((chatId: string, type: 'text' | 'image' | 'voice', content: string, voiceDuration?: number) => {
    if (!state.currentUserId) return;
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      chatId,
      senderId: state.currentUserId,
      type,
      content,
      createdAt: new Date().toISOString(),
      readBy: [state.currentUserId],
      voiceDuration
    };

    setState(prev => {
      const updatedChats = prev.chats.map(c => {
        if (c.id === chatId) {
          return { ...c, lastMessageAt: newMsg.createdAt };
        }
        return c;
      });

      // Create message notification for participants except sender
      const chat = prev.chats.find(c => c.id === chatId);
      const newNotifs = [...prev.notifications];

      if (chat) {
        chat.participants.forEach(pId => {
          if (pId !== prev.currentUserId) {
            newNotifs.push({
              id: `notif_${Date.now()}`,
              recipientId: pId,
              senderId: prev.currentUserId!,
              type: 'message',
              chatId,
              message: type === 'text' ? content : `Sent a ${type}`,
              isRead: false,
              createdAt: new Date().toISOString()
            });
          }
        });
      }

      return {
        ...prev,
        messages: [...prev.messages, newMsg],
        chats: updatedChats,
        notifications: newNotifs
      };
    });
  }, [state.currentUserId]);

  const markNotificationsAsRead = useCallback(() => {
    if (!state.currentUserId) return;
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => 
        n.recipientId === prev.currentUserId ? { ...n, isRead: true } : n
      )
    }));
  }, [state.currentUserId]);

  // Reports
  const reportContent = useCallback((contentType: 'post' | 'comment' | 'user', contentId: string, reason: string) => {
    if (!state.currentUserId) return;
    const newReport: Report = {
      id: `report_${Date.now()}`,
      reportedById: state.currentUserId,
      contentType,
      contentId,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      reports: [newReport, ...prev.reports]
    }));
  }, [state.currentUserId]);

  const resolveReport = useCallback((reportId: string, status: 'resolved' | 'dismissed') => {
    setState(prev => {
      const report = prev.reports.find(r => r.id === reportId);
      if (!report) return prev;

      let updatedPosts = prev.posts;
      let updatedUsers = prev.users;

      if (status === 'resolved') {
        if (report.contentType === 'post') {
          // Remove the reported post or hide it
          updatedPosts = prev.posts.filter(p => p.id !== report.contentId);
        } else if (report.contentType === 'user') {
          // Flag the user as blocked/suspended
          updatedUsers = prev.users.map(u => 
            u.id === report.contentId ? { ...u, isBlocked: true } : u
          );
        }
      }

      return {
        ...prev,
        reports: prev.reports.map(r => r.id === reportId ? { ...r, status } : r),
        posts: updatedPosts,
        users: updatedUsers
      };
    });
  }, []);

  const purchasePremiumPlan = useCallback((tier: 'standard' | 'ultra') => {
    if (!state.currentUserId) return;
    const amount = tier === 'standard' ? 9.99 : 19.99;
    setState(prev => {
      const updatedUsers = prev.users.map(u => 
        u.id === prev.currentUserId 
          ? { ...u, isPremium: true, premiumTier: tier, isVerified: true }
          : u
      );

      const tx: PlatformTransaction = {
        id: `tx_${Date.now()}`,
        type: 'premium_plan',
        amount,
        userId: prev.currentUserId!,
        description: `${tier === 'standard' ? 'Standard' : 'Ultra'} Premium Subscription Plan`,
        createdAt: new Date().toISOString()
      };

      const earnings = { ...prev.ownerEarnings };
      earnings.premiumRevenue = Number((earnings.premiumRevenue + amount).toFixed(2));
      earnings.total = Number((earnings.total + amount).toFixed(2));

      return {
        ...prev,
        users: updatedUsers,
        ownerEarnings: earnings,
        platformTransactions: [tx, ...prev.platformTransactions]
      };
    });
  }, [state.currentUserId]);

  const registerAdCampaign = useCallback((amount: number, campaignName: string) => {
    if (!state.currentUserId) return;
    setState(prev => {
      const tx: PlatformTransaction = {
        id: `tx_${Date.now()}`,
        type: 'ad_campaign',
        amount,
        userId: prev.currentUserId!,
        description: `Ad Campaign: "${campaignName}"`,
        createdAt: new Date().toISOString()
      };

      const earnings = { ...prev.ownerEarnings };
      earnings.adRevenue = Number((earnings.adRevenue + amount).toFixed(2));
      earnings.total = Number((earnings.total + amount).toFixed(2));

      return {
        ...prev,
        ownerEarnings: earnings,
        platformTransactions: [tx, ...prev.platformTransactions]
      };
    });
  }, [state.currentUserId]);

  const registerBusinessPromotion = useCallback((amount: number, description: string) => {
    if (!state.currentUserId) return;
    setState(prev => {
      const tx: PlatformTransaction = {
        id: `tx_${Date.now()}`,
        type: 'business_promotion',
        amount,
        userId: prev.currentUserId!,
        description: `Boost Post: "${description}"`,
        createdAt: new Date().toISOString()
      };

      const earnings = { ...prev.ownerEarnings };
      earnings.promotionRevenue = Number((earnings.promotionRevenue + amount).toFixed(2));
      earnings.total = Number((earnings.total + amount).toFixed(2));

      return {
        ...prev,
        ownerEarnings: earnings,
        platformTransactions: [tx, ...prev.platformTransactions]
      };
    });
  }, [state.currentUserId]);

  const registerPlatformFee = useCallback((amount: number, description: string) => {
    if (!state.currentUserId) return;
    setState(prev => {
      const tx: PlatformTransaction = {
        id: `tx_${Date.now()}`,
        type: 'platform_fee',
        amount,
        userId: prev.currentUserId!,
        description,
        createdAt: new Date().toISOString()
      };

      const earnings = { ...prev.ownerEarnings };
      earnings.platformFeeRevenue = Number((earnings.platformFeeRevenue + amount).toFixed(2));
      earnings.total = Number((earnings.total + amount).toFixed(2));

      return {
        ...prev,
        ownerEarnings: earnings,
        platformTransactions: [tx, ...prev.platformTransactions]
      };
    });
  }, [state.currentUserId]);

  const submitEasypaisaPayment = useCallback((
    amount: number,
    senderPhone: string,
    txId: string,
    purpose: 'wallet_topup' | 'premium_plan' | 'ad_campaign' | 'business_promotion',
    purposeDetails?: any,
    receiptFileName?: string
  ) => {
    if (!state.currentUserId) return;
    const newPayment: EasypaisaPayment = {
      id: `ep_${Date.now()}`,
      userId: state.currentUserId,
      amount,
      senderPhone,
      txId,
      receiptFileName: receiptFileName || 'receipt_submitted.png',
      status: 'pending',
      purpose,
      purposeDetails,
      createdAt: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      easypaisaPayments: [newPayment, ...prev.easypaisaPayments]
    }));
  }, [state.currentUserId]);

  const verifyEasypaisaPayment = useCallback((paymentId: string, action: 'approved' | 'rejected') => {
    setState(prev => {
      const paymentIndex = prev.easypaisaPayments.findIndex(p => p.id === paymentId);
      if (paymentIndex === -1) return prev;

      const payment = prev.easypaisaPayments[paymentIndex];
      const updatedPayments = [...prev.easypaisaPayments];
      updatedPayments[paymentIndex] = {
        ...payment,
        status: action,
        verifiedAt: new Date().toISOString()
      };

      let updatedUsers = prev.users;
      let updatedEarnings = { ...prev.ownerEarnings };
      let updatedTransactions = [...prev.platformTransactions];

      // If approved, trigger the effect of the purchase
      if (action === 'approved') {
        const usdAmount = Number((payment.amount / 278).toFixed(2)); // PKR to USD translation

        if (payment.purpose === 'wallet_topup') {
          updatedUsers = prev.users.map(u => 
            u.id === payment.userId 
              ? { ...u, walletBalance: (u.walletBalance || 0) + payment.amount }
              : u
          );
        } else if (payment.purpose === 'premium_plan') {
          const tier = payment.purposeDetails?.tier || 'standard';
          updatedUsers = prev.users.map(u => 
            u.id === payment.userId 
              ? { ...u, isPremium: true, premiumTier: tier, isVerified: true }
              : u
          );
          // Update earnings
          updatedEarnings.premiumRevenue = Number((updatedEarnings.premiumRevenue + usdAmount).toFixed(2));
          updatedEarnings.total = Number((updatedEarnings.total + usdAmount).toFixed(2));

          // Log Platform Transaction
          const tx: PlatformTransaction = {
            id: `tx_${Date.now()}`,
            type: 'premium_plan',
            amount: usdAmount,
            userId: payment.userId,
            description: `Easypaisa Approved: ${tier === 'standard' ? 'Standard' : 'Ultra'} Premium Sub (Rs. ${payment.amount})`,
            createdAt: new Date().toISOString()
          };
          updatedTransactions = [tx, ...updatedTransactions];
        } else if (payment.purpose === 'ad_campaign') {
          // Update earnings
          updatedEarnings.adRevenue = Number((updatedEarnings.adRevenue + usdAmount).toFixed(2));
          updatedEarnings.total = Number((updatedEarnings.total + usdAmount).toFixed(2));

          const tx: PlatformTransaction = {
            id: `tx_${Date.now()}`,
            type: 'ad_campaign',
            amount: usdAmount,
            userId: payment.userId,
            description: `Easypaisa Approved: Ad Campaign "${payment.purposeDetails?.campaignName}" (Rs. ${payment.amount})`,
            createdAt: new Date().toISOString()
          };
          updatedTransactions = [tx, ...updatedTransactions];
        } else if (payment.purpose === 'business_promotion') {
          // Update earnings
          updatedEarnings.promotionRevenue = Number((updatedEarnings.promotionRevenue + usdAmount).toFixed(2));
          updatedEarnings.total = Number((updatedEarnings.total + usdAmount).toFixed(2));

          const tx: PlatformTransaction = {
            id: `tx_${Date.now()}`,
            type: 'business_promotion',
            amount: usdAmount,
            userId: payment.userId,
            description: `Easypaisa Approved: Boost Post "${payment.purposeDetails?.postDescToBoost}" (Rs. ${payment.amount})`,
            createdAt: new Date().toISOString()
          };
          updatedTransactions = [tx, ...updatedTransactions];
        }
      }

      // Add dynamic user notification
      const userNotification: Notification = {
        id: `notif_${Date.now()}`,
        recipientId: payment.userId,
        senderId: 'user_1', // Platform Admin
        type: 'message',
        message: action === 'approved' 
          ? `✅ Your Easypaisa payment of Rs. ${payment.amount} (TxID: ${payment.txId}) was approved! Your wallet/benefits have been updated.`
          : `❌ Your Easypaisa payment of Rs. ${payment.amount} (TxID: ${payment.txId}) was rejected. Please double-check transaction details and contact support.`,
        isRead: false,
        createdAt: new Date().toISOString()
      };

      return {
        ...prev,
        easypaisaPayments: updatedPayments,
        users: updatedUsers,
        ownerEarnings: updatedEarnings,
        platformTransactions: updatedTransactions,
        notifications: [userNotification, ...prev.notifications]
      };
    });
  }, []);

  const purchaseWithWallet = useCallback((amountPKR: number, purpose: 'premium_plan' | 'ad_campaign' | 'business_promotion', description: string, details?: any) => {
    if (!state.currentUserId) return false;
    let success = false;
    setState(prev => {
      const user = prev.users.find(u => u.id === prev.currentUserId);
      if (!user || (user.walletBalance || 0) < amountPKR) {
        success = false;
        return prev;
      }
      success = true;

      // Deduct balance
      const updatedUsers = prev.users.map(u => 
        u.id === prev.currentUserId 
          ? { ...u, walletBalance: Number(((u.walletBalance || 0) - amountPKR).toFixed(2)) }
          : u
      );

      // Perform action based on purpose
      let updatedEarnings = { ...prev.ownerEarnings };
      let updatedTransactions = [...prev.platformTransactions];

      const usdAmount = Number((amountPKR / 278).toFixed(2)); // PKR to USD conversion

      if (purpose === 'premium_plan') {
        const tier = details?.tier || 'standard';
        const userIdx = updatedUsers.findIndex(u => u.id === prev.currentUserId);
        if (userIdx !== -1) {
          updatedUsers[userIdx] = {
            ...updatedUsers[userIdx],
            isPremium: true,
            premiumTier: tier,
            isVerified: true
          };
        }
        updatedEarnings.premiumRevenue = Number((updatedEarnings.premiumRevenue + usdAmount).toFixed(2));
        updatedEarnings.total = Number((updatedEarnings.total + usdAmount).toFixed(2));

        const tx: PlatformTransaction = {
          id: `tx_${Date.now()}`,
          type: 'premium_plan',
          amount: usdAmount,
          userId: prev.currentUserId!,
          description: `Wallet Payment: ${tier === 'standard' ? 'Standard' : 'Ultra'} Premium Sub (Deducted Rs. ${amountPKR})`,
          createdAt: new Date().toISOString()
        };
        updatedTransactions = [tx, ...updatedTransactions];
      } else if (purpose === 'ad_campaign') {
        updatedEarnings.adRevenue = Number((updatedEarnings.adRevenue + usdAmount).toFixed(2));
        updatedEarnings.total = Number((updatedEarnings.total + usdAmount).toFixed(2));

        const tx: PlatformTransaction = {
          id: `tx_${Date.now()}`,
          type: 'ad_campaign',
          amount: usdAmount,
          userId: prev.currentUserId!,
          description: `Wallet Payment: Ad Campaign "${details?.campaignName}" (Deducted Rs. ${amountPKR})`,
          createdAt: new Date().toISOString()
        };
        updatedTransactions = [tx, ...updatedTransactions];
      } else if (purpose === 'business_promotion') {
        updatedEarnings.promotionRevenue = Number((updatedEarnings.promotionRevenue + usdAmount).toFixed(2));
        updatedEarnings.total = Number((updatedEarnings.total + usdAmount).toFixed(2));

        const tx: PlatformTransaction = {
          id: `tx_${Date.now()}`,
          type: 'business_promotion',
          amount: usdAmount,
          userId: prev.currentUserId!,
          description: `Wallet Payment: Boost Post "${details?.postDescToBoost}" (Deducted Rs. ${amountPKR})`,
          createdAt: new Date().toISOString()
        };
        updatedTransactions = [tx, ...updatedTransactions];
      }

      return {
        ...prev,
        users: updatedUsers,
        ownerEarnings: updatedEarnings,
        platformTransactions: updatedTransactions
      };
    });
    return success;
  }, [state.currentUserId]);

  return {
    state,
    currentUser,
    users: state.users.filter(u => !state.blockedUsers.includes(u.id) && !u.isBlocked),
    allUsers: state.users, // Includes blocked ones for Admin
    posts: state.posts.filter(p => !state.blockedUsers.includes(p.userId)),
    comments: state.comments,
    stories: state.stories.filter(s => !state.blockedUsers.includes(s.userId)),
    shortVideos: state.shortVideos.filter(v => !state.blockedUsers.includes(v.userId)),
    chats: state.chats.filter(c => c.participants.includes(state.currentUserId || '')),
    messages: state.messages,
    notifications: state.notifications.filter(n => n.recipientId === state.currentUserId),
    reports: state.reports,
    savedPosts: state.savedPosts,
    blockedUsers: state.blockedUsers,
    ownerEarnings: state.ownerEarnings,
    platformTransactions: state.platformTransactions,
    easypaisaPayments: state.easypaisaPayments,
    
    // Auth
    login,
    logout,
    updateProfile,

    // Social Interactions
    followUser,
    blockUser,

    // Content Operations
    createPost,
    likePost,
    savePost,
    votePoll,
    addComment,
    addReply,
    likeComment,
    
    // Stories
    createStory,
    reactStory,

    // Chats
    startNewChat,
    sendChatMessage,

    // Notifications
    markNotificationsAsRead,

    // Admin & Moderation
    reportContent,
    resolveReport,

    // Earning Actions
    purchasePremiumPlan,
    registerAdCampaign,
    registerBusinessPromotion,
    registerPlatformFee,

    // Easypaisa Payments
    submitEasypaisaPayment,
    verifyEasypaisaPayment,
    purchaseWithWallet
  };
};
