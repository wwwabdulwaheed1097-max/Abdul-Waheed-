import { User, Post, Story, ShortVideo, Chat, Message, Notification, Report, Comment } from '../types';

export const mockUsers: User[] = [
  {
    id: 'user_1',
    username: 'alex_pulse',
    displayName: 'Alex Rivers',
    email: 'alex@pulse.social',
    bio: 'Product Designer & Visual Artist. Crafting the future of human connection. ✨ ⚡️',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=300&fit=crop',
    isVerified: true,
    followersCount: 14200,
    followingCount: 382,
    followers: ['user_2', 'user_3', 'user_4'],
    following: ['user_2', 'user_3', 'admin_1'],
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    isAdmin: false
  },
  {
    id: 'user_2',
    username: 'sarah_m',
    displayName: 'Sarah Miller',
    email: 'sarah@pulse.social',
    bio: 'Travel Journalist & Coffee enthusiast. Capturing stories across 45+ countries. ✈️☕️',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=300&fit=crop',
    isVerified: true,
    followersCount: 8900,
    followingCount: 512,
    followers: ['user_1', 'user_3'],
    following: ['user_1', 'user_4'],
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user_3',
    username: 'marcus_dev',
    displayName: 'Marcus Chen',
    email: 'marcus@pulse.social',
    bio: 'Creative coder building decentralized social interfaces. TypeScript & Web3 builder. 💻⚡️',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    coverUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=300&fit=crop',
    isVerified: false,
    followersCount: 2450,
    followingCount: 890,
    followers: ['user_1', 'user_2'],
    following: ['user_1', 'user_2', 'user_4'],
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user_4',
    username: 'elena_sound',
    displayName: 'Elena Rostova',
    email: 'elena@pulse.social',
    bio: 'Ambient sound designer and modular synthesist. Soundwaves are my canvases. 🎹🎧',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
    coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&h=300&fit=crop',
    isVerified: true,
    followersCount: 5300,
    followingCount: 204,
    followers: ['user_2', 'user_3'],
    following: ['user_1', 'user_2'],
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'admin_1',
    username: 'pulse_admin',
    displayName: 'Pulse Moderator',
    email: 'admin@pulse.social',
    bio: 'Official Admin Account for Pulse Social. Keeping our creative sandbox safe & clean. 🛡️',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    coverUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=300&fit=crop',
    isVerified: true,
    followersCount: 99999,
    followingCount: 1,
    followers: ['user_1', 'user_2', 'user_3', 'user_4'],
    following: ['user_1'],
    createdAt: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString(),
    isAdmin: true
  }
];

export const mockPosts: Post[] = [
  {
    id: 'post_1',
    userId: 'user_1',
    type: 'image',
    content: 'Just finalized the design tokens for our glassmorphism UI kit! Soft reflections, frosted glass filters, and vibrant neon accents are going to change the game. What do you think of this aesthetic? #uidesign #glassmorphism #pulse',
    mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=800&fit=crop',
    hashtags: ['uidesign', 'glassmorphism', 'pulse'],
    mentions: ['marcus_dev'],
    likes: ['user_2', 'user_3', 'user_4'],
    commentsCount: 3,
    sharesCount: 12,
    savedBy: ['user_2'],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'post_2',
    userId: 'user_2',
    type: 'poll',
    content: 'Hey everyone! Im planning my next travel journalism series for late 2026. Where should we head first to capture the most inspiring stories of human resilience and creativity? 🗺️✨',
    poll: {
      question: 'Which region should we cover first?',
      options: [
        { id: 'opt_1', text: 'Patagonia Mountains, Chile/Argentina 🏔️', votes: ['user_1', 'user_4'] },
        { id: 'opt_2', text: 'Kyoto Hidden Temples, Japan ⛩️', votes: ['user_3', 'admin_1'] },
        { id: 'opt_3', text: 'Sossusvlei Desert, Namibia 🏜️', votes: ['user_2'] }
      ]
    },
    hashtags: ['travel', 'journalism', 'stories'],
    mentions: [],
    likes: ['user_1', 'user_3'],
    commentsCount: 2,
    sharesCount: 5,
    savedBy: [],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'post_3',
    userId: 'user_3',
    type: 'text',
    content: 'Spent the evening benchmarking state synchronization over mesh protocols. It is incredibly cool to see latency drop from 150ms to sub-15ms with some simple compression trees. Check out the latest commit on my GitHub if you are interested! @alex_pulse the mock designs you sent fits perfectly.',
    hashtags: ['web3', 'p2p', 'coding', 'latency'],
    mentions: ['alex_pulse'],
    likes: ['user_1', 'user_4'],
    commentsCount: 4,
    sharesCount: 2,
    savedBy: ['user_1'],
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'post_4',
    userId: 'user_4',
    type: 'video',
    content: 'Live modular synthesis patch recording. Letting the voltage control the mood. Wear headphones for full sub-bass frequencies! 🎧🎚️ #modularsynth #electronicmusic #ambient',
    // We will use a beautiful loopable stock sample video for our post
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-waveform-of-an-audio-signal-on-a-monitor-32865-large.mp4',
    mediaUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=450&fit=crop',
    hashtags: ['modularsynth', 'electronicmusic', 'ambient'],
    mentions: [],
    likes: ['user_1', 'user_2', 'user_3'],
    commentsCount: 3,
    sharesCount: 18,
    savedBy: ['user_3'],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const mockComments: { [postId: string]: Comment[] } = {
  post_1: [
    {
      id: 'comment_1',
      postId: 'post_1',
      userId: 'user_3',
      content: 'This is absolutely gorgeous! Love the refraction effects. Can you share the CSS filter configurations?',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      likes: ['user_1'],
      replies: [
        {
          id: 'reply_1',
          commentId: 'comment_1',
          userId: 'user_1',
          content: 'Thank you Marcus! Yes, basically we combine backdrop-filter: blur(16px) with dynamic linear gradient borders!',
          createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          likes: ['user_3']
        }
      ]
    },
    {
      id: 'comment_2',
      postId: 'post_1',
      userId: 'user_2',
      content: 'Wow, makes me want to write my journals directly on this interface! Clean and relaxing.',
      createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
      likes: ['user_1'],
      replies: []
    }
  ],
  post_2: [
    {
      id: 'comment_3',
      postId: 'post_2',
      userId: 'user_1',
      content: 'Voted for Patagonia! The visual contrasts between the ice glaciers and orange mountains at sunrise will be jaw-dropping in your stories.',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      likes: ['user_2'],
      replies: []
    }
  ]
};

export const mockStories: Story[] = [
  {
    id: 'story_1',
    userId: 'user_2',
    mediaUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=1000&fit=crop',
    mediaType: 'image',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    reactions: [{ userId: 'user_1', emoji: '🔥' }, { userId: 'user_3', emoji: '❤️' }]
  },
  {
    id: 'story_2',
    userId: 'user_1',
    mediaUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&h=1000&fit=crop',
    mediaType: 'image',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
    reactions: [{ userId: 'user_2', emoji: '✨' }]
  },
  {
    id: 'story_3',
    userId: 'user_4',
    mediaUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&h=1000&fit=crop',
    mediaType: 'image',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
    reactions: []
  }
];

export const mockShortVideos: ShortVideo[] = [
  {
    id: 'short_1',
    userId: 'user_4',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-spinning-vinyl-record-on-turntable-34289-large.mp4',
    caption: 'Satisfying vinyl spins. Late night listening vibes. 🌌🎶',
    hashtags: ['vinyl', 'satisfying', 'music', 'analog'],
    likes: ['user_1', 'user_2', 'user_3'],
    commentsCount: 14,
    sharesCount: 32,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'short_2',
    userId: 'user_1',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-ink-dripping-in-water-with-blue-and-pink-colors-41618-large.mp4',
    caption: 'Generating color flows on iPad. Dynamic textures are highly therapeutic. 🎨💧',
    hashtags: ['digitalart', 'colorflow', 'satisfying', 'procreate'],
    likes: ['user_2', 'user_4'],
    commentsCount: 9,
    sharesCount: 15,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'short_3',
    userId: 'user_2',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-waterfall-in-forest-2213-large.mp4',
    caption: 'Hidden waterfalls in deep tropical forests. Worth the 4-hour muddy hike! 🌿🎒',
    hashtags: ['hiking', 'waterfall', 'adventure', 'travel'],
    likes: ['user_1', 'user_3', 'user_4'],
    commentsCount: 22,
    sharesCount: 45,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const mockChats: Chat[] = [
  {
    id: 'chat_1',
    isGroup: false,
    participants: ['user_1', 'user_2'],
    lastMessageAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  },
  {
    id: 'chat_2',
    isGroup: true,
    name: '🎨 Creative Syndicate',
    avatarUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=100&h=100&fit=crop',
    participants: ['user_1', 'user_2', 'user_3', 'user_4'],
    lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  }
];

export const mockMessages: Message[] = [
  {
    id: 'msg_1',
    chatId: 'chat_1',
    senderId: 'user_2',
    type: 'text',
    content: 'Hey Alex! Just saw your post on the glassmorphism templates. They look amazing! 💎',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    readBy: ['user_1', 'user_2']
  },
  {
    id: 'msg_2',
    chatId: 'chat_1',
    senderId: 'user_1',
    type: 'text',
    content: 'Thanks Sarah! Appreciate it. It took me a few iterations to get the blur and noise overlay values just right.',
    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    readBy: ['user_1', 'user_2']
  },
  {
    id: 'msg_3',
    chatId: 'chat_1',
    senderId: 'user_2',
    type: 'image',
    content: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=350&fit=crop',
    createdAt: new Date(Date.now() - 19 * 60 * 60 * 1000).toISOString(),
    readBy: ['user_1', 'user_2']
  },
  {
    id: 'msg_4',
    chatId: 'chat_1',
    senderId: 'user_2',
    type: 'text',
    content: 'Just sorting out some sunset shots for my next story line! Do you think this matches our color direction?',
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    readBy: ['user_1', 'user_2']
  },
  {
    id: 'msg_5',
    chatId: 'chat_1',
    senderId: 'user_1',
    type: 'text',
    content: 'Absolutely! The rich oranges and deep blues contrast wonderfully. Try adding a slight violet tint to the shadows.',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    readBy: ['user_1', 'user_2']
  },
  // Group Chat Messages
  {
    id: 'msg_group_1',
    chatId: 'chat_2',
    senderId: 'user_3',
    type: 'text',
    content: 'Hey everyone, I just completed the prototype engine for local storage. Running beautifully!',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    readBy: ['user_1', 'user_2', 'user_3', 'user_4']
  },
  {
    id: 'msg_group_2',
    chatId: 'chat_2',
    senderId: 'user_4',
    type: 'voice',
    content: 'mock_voice_url_duration_5',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    readBy: ['user_1', 'user_2', 'user_3', 'user_4'],
    voiceDuration: 5
  }
];

export const mockNotifications: Notification[] = [
  {
    id: 'notif_1',
    recipientId: 'user_1',
    senderId: 'user_2',
    type: 'like',
    postId: 'post_1',
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 'notif_2',
    recipientId: 'user_1',
    senderId: 'user_3',
    type: 'comment',
    postId: 'post_1',
    message: 'This is absolutely gorgeous! Love the...',
    isRead: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'notif_3',
    recipientId: 'user_1',
    senderId: 'user_4',
    type: 'follow',
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const mockReports: Report[] = [
  {
    id: 'report_1',
    reportedById: 'user_2',
    contentType: 'post',
    contentId: 'post_4',
    reason: 'Suspicious audio loop simulation.',
    status: 'pending',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  }
];
