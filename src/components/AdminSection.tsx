import { useState } from 'react';
import { 
  ShieldAlert, Users, FileText, Ban, Trash2, Eye, 
  Check, TrendingUp, Sparkles, Search, CheckCircle2,
  Landmark, DollarSign, Activity, Percent, ArrowUpRight,
  ShieldCheck, Mail, CreditCard, PlayCircle
} from 'lucide-react';
import { Report, User, Post, OwnerEarnings, PlatformTransaction, EasypaisaPayment } from '../types';

interface AdminSectionProps {
  reports: Report[];
  allUsers: User[];
  posts: Post[];
  onResolveReport: (reportId: string, status: 'resolved' | 'dismissed') => void;
  onBlockUser: (userId: string) => void;
  theme: 'light' | 'dark' | 'glass';
  ownerEarnings?: OwnerEarnings;
  platformTransactions?: PlatformTransaction[];
  easypaisaPayments?: EasypaisaPayment[];
  onVerifyEasypaisaPayment?: (paymentId: string, action: 'approved' | 'rejected') => void;
}

export default function AdminSection({
  reports,
  allUsers,
  posts,
  onResolveReport,
  onBlockUser,
  theme,
  ownerEarnings = { adRevenue: 1250, premiumRevenue: 850, promotionRevenue: 450, platformFeeRevenue: 285.50, total: 2835.50 },
  platformTransactions = [],
  easypaisaPayments = [],
  onVerifyEasypaisaPayment
}: AdminSectionProps) {
  const [adminTab, setAdminTab] = useState<'dashboard' | 'earnings' | 'reports' | 'users' | 'payments'>('dashboard');
  const [userQuery, setUserQuery] = useState('');

  // Filtering users based on search
  const filteredUsers = allUsers.filter(u => 
    u.displayName.toLowerCase().includes(userQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(userQuery.toLowerCase())
  );

  const containerStyle = theme === 'glass'
    ? 'bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-white/20 dark:border-zinc-800/20 shadow-md'
    : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 shadow-sm';

  const pendingReports = reports.filter(r => r.status === 'pending');

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 text-sm">
      
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-2">
        <div>
          <h3 className="font-display font-extrabold text-2xl bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Pulse Moderation Center</h3>
          <p className="text-xs text-zinc-400 mt-1">Keep our creative playground clean, verified, and safe.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
            { id: 'payments', label: `Verifications (${easypaisaPayments.filter(p => p.status === 'pending').length})`, icon: CreditCard },
            { id: 'earnings', label: `Platform Treasury ($${ownerEarnings.total.toFixed(0)})`, icon: Landmark },
            { id: 'reports', label: `Pending Queue (${pendingReports.length})`, icon: ShieldAlert },
            { id: 'users', label: 'User Directory', icon: Users }
          ].map(tab => {
            const Icon = tab.icon;
            const active = adminTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`admin-tab-btn-${tab.id}`}
                onClick={() => setAdminTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1 transition-all ${
                  active 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: DASHBOARD STATS & ANALYTICS CHIPS */}
      {adminTab === 'dashboard' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Creators', val: allUsers.length, color: 'text-pink-500' },
              { label: 'Technical Logs', val: posts.length, color: 'text-purple-500' },
              { label: 'Pending Reports', val: pendingReports.length, color: 'text-rose-500' },
              { label: 'Core Server Latency', val: '14ms', color: 'text-emerald-500' }
            ].map((stat, idx) => (
              <div key={idx} className={`p-4 rounded-2xl border ${containerStyle} text-center`}>
                <span className="text-xs text-zinc-400 block font-medium">{stat.label}</span>
                <span className={`font-display font-extrabold text-2xl mt-1.5 block ${stat.color}`}>{stat.val}</span>
              </div>
            ))}
          </div>

          {/* Dynamic Graphic growth waves bar chart with pure Tailwind */}
          <div className={`p-5 rounded-3xl border ${containerStyle}`}>
            <h4 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
              <span>Network Traffic Growth Wave (Past 7 Days)</span>
            </h4>

            <div className="h-44 flex items-end gap-3.5 pt-4 border-b border-zinc-100 dark:border-zinc-800/60 pb-1">
              {[
                { label: 'Mon', h: 'h-16', val: '4.2k' },
                { label: 'Tue', h: 'h-24', val: '6.8k' },
                { label: 'Wed', h: 'h-20', val: '5.1k' },
                { label: 'Thu', h: 'h-32', val: '8.4k' },
                { label: 'Fri', h: 'h-28', val: '7.9k' },
                { label: 'Sat', h: 'h-36', val: '9.8k' },
                { label: 'Sun', h: 'h-40', val: '12.4k' }
              ].map((day, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                  <span className="text-[10px] text-zinc-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity mb-0.5">{day.val}</span>
                  <div className={`w-full bg-gradient-to-t from-pink-500/80 via-purple-500/90 to-indigo-500/100 rounded-lg group-hover:opacity-90 transition-all ${day.h}`} />
                  <span className="text-[10px] font-bold text-zinc-400 mt-1">{day.label}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-zinc-400 mt-3 text-center font-medium">Weekly engagement metric represents combined API transactions, story views, and short waves auto-plays.</p>
          </div>

          {/* Quick tips */}
          <div className="p-4 rounded-2xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs flex gap-2">
            <span className="font-bold">💡 Moderator tip:</span>
            <span>You can switch back to host user "Alex Rivers" or developer profiles in Settings to test normal creation flows.</span>
          </div>
        </div>
      )}

      {/* TAB 1.5: WEBSITE OWNER PLATFORM TREASURY */}
      {adminTab === 'earnings' && (
        <div className="space-y-6 animate-fade-in">
          {/* Main treasury block */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-zinc-900 via-indigo-950 to-zinc-900 border border-zinc-850 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
            
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-300 flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5" />
                  <span>Platform Owner Treasury</span>
                </span>
                <span className="text-3xl font-display font-black tracking-tight block">
                  ${ownerEarnings.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold rounded-full text-[10px] flex items-center gap-1">
                <Activity className="w-3 h-3 animate-pulse" />
                <span>Earning Flow Active</span>
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-zinc-800/60">
              {[
                { label: 'Sponsored Ads', val: ownerEarnings.adRevenue, color: 'text-pink-400', pct: ((ownerEarnings.adRevenue / (ownerEarnings.total || 1)) * 100).toFixed(0) },
                { label: 'Premium Subscriptions', val: ownerEarnings.premiumRevenue, color: 'text-purple-400', pct: ((ownerEarnings.premiumRevenue / (ownerEarnings.total || 1)) * 100).toFixed(0) },
                { label: 'Business Boosts', val: ownerEarnings.promotionRevenue, color: 'text-indigo-400', pct: ((ownerEarnings.promotionRevenue / (ownerEarnings.total || 1)) * 100).toFixed(0) },
                { label: 'Platform Fees (15%)', val: ownerEarnings.platformFeeRevenue, color: 'text-emerald-400', pct: ((ownerEarnings.platformFeeRevenue / (ownerEarnings.total || 1)) * 100).toFixed(0) }
              ].map((stream, i) => (
                <div key={i} className="space-y-1">
                  <span className="text-[10px] text-zinc-400 block font-medium">{stream.label}</span>
                  <span className={`font-display font-extrabold text-base block ${stream.color}`}>
                    ${stream.val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[9px] text-zinc-500 block">{stream.pct}% of total</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tariffs and Rules Summary */}
          <div className={`p-5 rounded-3xl border ${containerStyle} space-y-3`}>
            <h4 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-purple-500" />
              <span>Owner Earning Strategy & Commission Policy</span>
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              As the website owner, Pulse does not pay out users or distribute platform cash to accounts. All systems process standard incoming owner-side monetization models:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50">
                <span className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">🛒 15% Marketplace Fee</span>
                <span className="text-zinc-400 text-[11px] leading-relaxed">A flat 15% platform commission is automatically deducted on every wave asset or merchandise license sold in the Creator Business Hub.</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50">
                <span className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">💎 Premium Plans Revenue</span>
                <span className="text-zinc-400 text-[11px] leading-relaxed">Standard ($9.99/mo) and Ultra ($19.99/mo) subscriptions provide profile badges, verification, and premium tools, with 100% retained by owner.</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50">
                <span className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">📢 Native Sponsored Ads</span>
                <span className="text-zinc-400 text-[11px] leading-relaxed">Ad campaigns are created dynamically by creator hubs targeting feed algorithms. Retained completely by the platform owner.</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50">
                <span className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">🚀 Business Post Boosting</span>
                <span className="text-zinc-400 text-[11px] leading-relaxed">A fixed $25.00 promotional tariff is charged to boost active post feeds to premium channels, multiplying target organic waves.</span>
              </div>
            </div>
          </div>

          {/* Audit Ledger List */}
          <div className={`p-5 rounded-3xl border ${containerStyle} space-y-4`}>
            <div className="flex justify-between items-center">
              <h4 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <CreditCard className="w-4.5 h-4.5 text-indigo-500" />
                <span>Treasury Ledger & Audit Trail</span>
              </h4>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{platformTransactions.length} Transactions</span>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {platformTransactions.length === 0 ? (
                <div className="text-center py-12 text-zinc-400">
                  <Landmark className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
                  <p className="text-xs">No active treasury events recorded yet.</p>
                </div>
              ) : (
                platformTransactions.map(tx => {
                  const txUser = allUsers.find(u => u.id === tx.userId);
                  const badgeStyle = 
                    tx.type === 'premium_plan' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' :
                    tx.type === 'ad_campaign' ? 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20' :
                    tx.type === 'business_promotion' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' :
                    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';

                  const badgeLabel = 
                    tx.type === 'premium_plan' ? 'Premium Plan' :
                    tx.type === 'ad_campaign' ? 'Ad Campaign' :
                    tx.type === 'business_promotion' ? 'Boost Promo' :
                    'Platform Fee';

                  return (
                    <div key={tx.id} className="p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-950/20 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={txUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop'} alt="User" className="w-8 h-8 rounded-full object-cover shrink-0 border border-zinc-200 dark:border-zinc-800" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-zinc-800 dark:text-zinc-200 truncate">{txUser?.displayName || 'Pulse Creator'}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${badgeStyle}`}>{badgeLabel}</span>
                          </div>
                          <span className="text-[11px] text-zinc-400 block truncate mt-0.5">{tx.description}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-display font-black text-xs text-emerald-500 block">
                          +${tx.amount.toFixed(2)}
                        </span>
                        <span className="text-[9px] text-zinc-400 block mt-0.5">
                          {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONTENT MODERATION QUEUE */}
      {adminTab === 'reports' && (
        <div className="space-y-4 animate-fade-in">
          {pendingReports.length === 0 ? (
            <div className="text-center py-12 text-zinc-400">
              <Check className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <p className="font-semibold text-sm">Report Queue is empty!</p>
              <p className="text-xs">Creators are keeping the conversations friendly & creative.</p>
            </div>
          ) : (
            pendingReports.map(report => {
              const reportedBy = allUsers.find(u => u.id === report.reportedById);
              let targetContentText = '';
              
              if (report.contentType === 'post') {
                const targetPost = posts.find(p => p.id === report.contentId);
                targetContentText = targetPost?.content || '[Deleted or Hidden Post]';
              } else {
                targetContentText = `User Profile ID: ${report.contentId}`;
              }

              return (
                <div key={report.id} className={`p-4 rounded-2xl border ${containerStyle} space-y-3`}>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">
                      Reported {report.contentType}
                    </span>
                    <span className="text-[10px] text-zinc-400">{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <span>Flagged by @{reportedBy?.username}</span>
                      <span>•</span>
                      <span>Reason: <span className="text-zinc-700 dark:text-zinc-300 font-semibold italic">"{report.reason}"</span></span>
                    </div>

                    <p className="text-xs bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 font-mono text-zinc-600 dark:text-zinc-400">
                      {targetContentText}
                    </p>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/40 justify-end">
                    <button
                      id={`btn-admin-dismiss-${report.id}`}
                      onClick={() => onResolveReport(report.id, 'dismissed')}
                      className="px-3.5 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      Dismiss Report
                    </button>
                    <button
                      id={`btn-admin-resolve-${report.id}`}
                      onClick={() => onResolveReport(report.id, 'resolved')}
                      className="px-3.5 py-1.5 bg-rose-600 text-white font-semibold rounded-xl text-xs hover:bg-rose-700"
                    >
                      Remove Flagged Content
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: USER MANAGEMENT DIRECTORY */}
      {adminTab === 'users' && (
        <div className="space-y-4 animate-fade-in">
          {/* User Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input
              id="admin-user-search-input"
              type="text"
              placeholder="Search user record base..."
              value={userQuery}
              onChange={e => setUserQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 text-xs"
            />
          </div>

          <div className="space-y-2.5">
            {filteredUsers.map(user => {
              const isBlocked = user.isBlocked || false;
              return (
                <div key={user.id} className={`p-4 rounded-2xl border flex items-center justify-between ${containerStyle}`}>
                  <div className="flex items-center gap-3">
                    <img src={user.avatarUrl} alt="Avatar" className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-zinc-800 dark:text-zinc-200">{user.displayName}</span>
                        {user.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 fill-sky-500" />}
                      </div>
                      <span className="text-[10px] text-zinc-400 block">@{user.username} • {user.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {user.isAdmin && (
                      <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[9px] font-bold">Admin</span>
                    )}
                    <button
                      id={`btn-admin-ban-user-${user.id}`}
                      disabled={user.isAdmin}
                      onClick={() => {
                        onBlockUser(user.id);
                        alert(`Account status changed for @${user.username}`);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-30 ${
                        isBlocked
                          ? 'bg-rose-500 text-white'
                          : 'border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100'
                      }`}
                    >
                      {isBlocked ? 'Suspended' : 'Suspend Account'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {adminTab === 'payments' && (
        <div className={`p-5 rounded-3xl border ${containerStyle} space-y-4 animate-fade-in`}>
          <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h4 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-50">Easypaisa Payments Queue</h4>
              <p className="text-[10px] text-zinc-400">Review deposit claims and verify transaction hashes against the platform's collection log.</p>
            </div>
            <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-1 rounded-full font-bold uppercase">
              {easypaisaPayments.filter(p => p.status === 'pending').length} Pending Review
            </span>
          </div>

          <div className="space-y-3.5">
            {easypaisaPayments.map(payment => {
              const user = allUsers.find(u => u.id === payment.userId);
              return (
                <div 
                  key={payment.id} 
                  className="p-4 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-start md:items-center text-xs"
                >
                  <div className="space-y-2.5 flex-1">
                    <div className="flex items-center gap-2">
                      <img src={user?.avatarUrl} className="w-8 h-8 rounded-full object-cover border border-zinc-200" />
                      <div>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200 block">{user?.displayName || 'Unknown User'}</span>
                        <span className="text-[10px] text-zinc-400 block">Claim ID: {payment.id} • {new Date(payment.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 font-mono text-[10px]">
                      <div>
                        <span className="text-zinc-400 block uppercase text-[8px] font-sans font-bold">Transfer Amount</span>
                        <span className="font-bold text-purple-600 dark:text-purple-400 text-xs">Rs. {payment.amount}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block uppercase text-[8px] font-sans font-bold">Sender Mobile</span>
                        <span className="font-bold text-zinc-700 dark:text-zinc-300">{payment.senderPhone}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block uppercase text-[8px] font-sans font-bold">Transaction ID (TxID)</span>
                        <span className="font-bold text-zinc-700 dark:text-zinc-300 select-all">{payment.txId}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block uppercase text-[8px] font-sans font-bold">Purpose</span>
                        <span className="font-bold text-zinc-700 dark:text-zinc-300 capitalize">{payment.purpose.replace('_', ' ')}</span>
                      </div>
                    </div>

                    {payment.receiptFileName && (
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                        <FileText className="w-3.5 h-3.5 text-pink-500" />
                        <span>Attached Proof: <strong className="text-zinc-500 dark:text-zinc-400">{payment.receiptFileName}</strong></span>
                      </div>
                    )}
                  </div>

                  <div className="flex md:flex-col gap-2 shrink-0 w-full md:w-auto pt-2 md:pt-0">
                    {payment.status === 'pending' ? (
                      <>
                        <button
                          id={`btn-approve-payment-${payment.id}`}
                          type="button"
                          onClick={() => {
                            if (onVerifyEasypaisaPayment) {
                              onVerifyEasypaisaPayment(payment.id, 'approved');
                              alert(`Payment Claim Rs. ${payment.amount} has been APPROVED!`);
                            }
                          }}
                          className="flex-1 md:w-32 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px] transition-all text-center"
                        >
                          Approve Deposit
                        </button>
                        <button
                          id={`btn-reject-payment-${payment.id}`}
                          type="button"
                          onClick={() => {
                            if (onVerifyEasypaisaPayment) {
                              onVerifyEasypaisaPayment(payment.id, 'rejected');
                              alert(`Payment Claim Rs. ${payment.amount} has been REJECTED.`);
                            }
                          }}
                          className="flex-1 md:w-32 py-2 border border-rose-500/30 hover:bg-rose-500/10 text-rose-500 font-bold rounded-xl text-[11px] transition-all text-center"
                        >
                          Reject Claim
                        </button>
                      </>
                    ) : (
                      <div className="text-right w-full">
                        <span className={`inline-block text-[10px] font-bold px-3 py-1 rounded-full uppercase border ${
                          payment.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                          Verified: {payment.status}
                        </span>
                        {payment.verifiedAt && (
                          <span className="block text-[9px] text-zinc-400 mt-1">
                            on {new Date(payment.verifiedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {easypaisaPayments.length === 0 && (
              <div className="p-12 text-center bg-zinc-50 dark:bg-zinc-950/10 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-2">
                <CreditCard className="w-10 h-10 text-zinc-300 mx-auto" />
                <div>
                  <span className="font-semibold text-zinc-500 text-xs block">Treasury ledger is empty</span>
                  <p className="text-[10px] text-zinc-400 leading-normal max-w-sm mx-auto mt-1">
                    When creators make direct payments or top up their credit portfolios, deposit claims will stream here for moderator audit.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
