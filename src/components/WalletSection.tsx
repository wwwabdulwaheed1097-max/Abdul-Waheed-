import React, { useState, useRef } from 'react';
import { 
  Wallet, ArrowDownLeft, ArrowUpRight, CheckCircle2, AlertCircle, Clock, 
  Copy, Check, Sparkles, Code2, ShieldAlert, Key, Upload, FileText, Info
} from 'lucide-react';
import { User, EasypaisaPayment, PlatformTransaction } from '../types';

interface WalletSectionProps {
  currentUser: User;
  easypaisaPayments: EasypaisaPayment[];
  platformTransactions: PlatformTransaction[];
  onSubmitPayment: (
    amount: number, 
    senderPhone: string, 
    txId: string, 
    purpose: 'wallet_topup' | 'premium_plan' | 'ad_campaign' | 'business_promotion', 
    purposeDetails?: any, 
    receiptFileName?: string
  ) => void;
  theme: 'light' | 'dark' | 'glass';
}

export default function WalletSection({
  currentUser,
  easypaisaPayments,
  platformTransactions,
  onSubmitPayment,
  theme
}: WalletSectionProps) {
  // Form states
  const [topUpAmount, setTopUpAmount] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [txId, setTxId] = useState('');
  const [isCopiedNum, setIsCopiedNum] = useState(false);
  const [isCopiedName, setIsCopiedName] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showApiCredentials, setShowApiCredentials] = useState(false);

  // File Upload states (Usability Patterns: Drag & Drop + Manual Select)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter payments for current user
  const userPayments = easypaisaPayments.filter(p => p.userId === currentUser.id);

  // Format currency
  const formatPKR = (num: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const handleCopy = (text: string, type: 'num' | 'name') => {
    navigator.clipboard.writeText(text);
    if (type === 'num') {
      setIsCopiedNum(true);
      setTimeout(() => setIsCopiedNum(false), 2000);
    } else {
      setIsCopiedName(true);
      setTimeout(() => setIsCopiedName(false), 2000);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setUploadedFile(file);
      } else {
        alert('Please drop an image receipt file (PNG, JPG, JPEG).');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmitTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topUpAmount || !senderPhone || !txId) {
      alert('Please fill out all required fields.');
      return;
    }

    const amountNum = parseFloat(topUpAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid transfer amount.');
      return;
    }

    if (txId.trim().length < 8) {
      alert('Please enter a valid Easypaisa Transaction ID (typically 11-12 digits).');
      return;
    }

    setIsSubmitting(true);
    setSuccessMsg('');

    setTimeout(() => {
      onSubmitPayment(
        amountNum,
        senderPhone,
        txId,
        'wallet_topup',
        {},
        uploadedFile ? uploadedFile.name : 'easypaisa_receipt_manual.png'
      );
      
      setIsSubmitting(false);
      setSuccessMsg('✨ Payment Proof submitted successfully! Our moderators will verify your transfer and credit your wallet.');
      
      // Reset form
      setTopUpAmount('');
      setSenderPhone('');
      setTxId('');
      setUploadedFile(null);
    }, 1500);
  };

  const containerStyle = theme === 'glass'
    ? 'bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-white/20 dark:border-zinc-800/20 shadow-md'
    : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 shadow-sm';

  const cardStyle = theme === 'glass'
    ? 'bg-gradient-to-tr from-purple-500/20 via-pink-500/20 to-indigo-500/20 border border-white/30 rounded-3xl p-6 shadow-xl relative overflow-hidden'
    : 'bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-600 border border-transparent rounded-3xl p-6 shadow-xl text-white relative overflow-hidden';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 text-sm animate-fade-in">
      
      {/* Title */}
      <div className="px-2 flex items-center justify-between">
        <div>
          <h2 className="font-display font-black text-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            Secure Digital Wallet
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Top up instantly using Easypaisa. Manage your creative capital, run campaigns, and unlock premium tiers.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 dark:bg-purple-400/10 border border-purple-500/20 rounded-full text-purple-600 dark:text-purple-400 font-semibold text-[11px]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Pakistan Integration Secure</span>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column - Balance & Submit (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          
          {/* 1. Wallet Balance Card */}
          <div className={cardStyle}>
            {/* Background elements */}
            <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/10 dark:bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute top-2 right-2 w-16 h-16 bg-white/10 dark:bg-white/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-200 dark:text-purple-300">Available Balance</span>
                <div className="text-3xl font-display font-black tracking-tight text-white flex items-baseline gap-1">
                  <span>{formatPKR(currentUser.walletBalance || 0)}</span>
                </div>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl border border-white/20 text-white">
                <Wallet className="w-6 h-6" />
              </div>
            </div>

            <div className="mt-8 flex justify-between items-center relative z-10 text-xs text-purple-100/80">
              <div>
                <span className="block opacity-70">Wallet Owner</span>
                <span className="font-bold text-white">{currentUser.displayName}</span>
              </div>
              <div className="text-right">
                <span className="block opacity-70">Integration Provider</span>
                <span className="font-semibold bg-white/15 px-2 py-0.5 rounded-full text-[10px] text-white">Easypaisa Mobile</span>
              </div>
            </div>
          </div>

          {/* 2. Top-Up Process Container */}
          <div className={`p-6 rounded-3xl border ${containerStyle} space-y-6`}>
            
            {/* Step A: Instruction Area */}
            <div className="space-y-3">
              <h3 className="font-display font-bold text-base text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-pink-500/10 text-pink-500 flex items-center justify-center font-bold text-xs">1</span>
                <span>Send Money via Easypaisa</span>
              </h3>
              
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-3">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
                  Open your <strong>Easypaisa Mobile App</strong> and transfer your chosen amount directly to our authorized platform collection treasury:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Account Number Box */}
                  <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-400 block">Mobile Account Number</span>
                      <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">03459602406</span>
                    </div>
                    <button
                      type="button"
                      id="btn-copy-number"
                      onClick={() => handleCopy('03459602406', 'num')}
                      className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-purple-500 transition-all active:scale-90"
                      title="Copy phone number"
                    >
                      {isCopiedNum ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Account Name Box */}
                  <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-400 block">Account Title / Name</span>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Abdul Waheed</span>
                    </div>
                    <button
                      type="button"
                      id="btn-copy-name"
                      onClick={() => handleCopy('Abdul Waheed', 'name')}
                      className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-purple-500 transition-all active:scale-90"
                      title="Copy account title"
                    >
                      {isCopiedName ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-[10px] text-amber-500 dark:text-amber-400/95 leading-relaxed bg-amber-500/5 p-2 rounded-xl border border-amber-500/10">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span><strong>Important:</strong> Ensure the recipient name displays exactly as <strong>Abdul Waheed</strong> inside Easypaisa before entering your secure PIN.</span>
                </div>
              </div>
            </div>

            {/* Step B: Submission Form */}
            <form onSubmit={handleSubmitTopUp} className="space-y-4">
              <h3 className="font-display font-bold text-base text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-pink-500/10 text-pink-500 flex items-center justify-center font-bold text-xs">2</span>
                <span>Submit Deposit Confirmation Proof</span>
              </h3>

              {successMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Deposit Amount */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Transfer Amount (PKR)</label>
                  <div className="relative">
                    <input
                      id="inp-topup-amount"
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 1500"
                      value={topUpAmount}
                      onChange={e => setTopUpAmount(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs text-zinc-900 dark:text-zinc-50"
                    />
                    <span className="absolute left-3.5 top-2.5 text-xs text-zinc-400 font-bold">Rs.</span>
                  </div>
                </div>

                {/* Sender Number */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Your Sender Phone Number</label>
                  <input
                    id="inp-sender-phone"
                    type="tel"
                    required
                    placeholder="e.g. 03001234567"
                    value={senderPhone}
                    onChange={e => setSenderPhone(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs text-zinc-900 dark:text-zinc-50"
                  />
                </div>
              </div>

              {/* Transaction ID */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Easypaisa Transaction ID (TxID)</label>
                <input
                  id="inp-tx-id"
                  type="text"
                  required
                  placeholder="e.g. 819203841029"
                  value={txId}
                  onChange={e => setTxId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs text-zinc-900 dark:text-zinc-50"
                />
              </div>

              {/* Receipt File Upload with Drag and Drop */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Attach Transaction Screenshot / Receipt (Optional)</label>
                
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={triggerFileInput}
                  className={`w-full p-5 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-250 ${
                    dragActive 
                      ? 'border-purple-500 bg-purple-500/5' 
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-purple-500/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10'
                  }`}
                >
                  <input 
                    ref={fileInputRef}
                    id="receipt-file-input"
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden" 
                  />

                  {uploadedFile ? (
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium text-xs">
                      <FileText className="w-5 h-5 animate-bounce" />
                      <span className="truncate max-w-[250px]">{uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-zinc-400" />
                      <div className="text-center">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-[11px] block">Drag & drop your screenshot here</span>
                        <span className="text-[10px] text-zinc-400 block mt-0.5">or click to browse local files</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Submit button */}
              <button
                id="btn-submit-topup"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-95 text-white font-bold rounded-xl text-xs shadow-lg shadow-purple-500/10 transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Uploading receipt & logs...</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>Submit Verification Claim</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

        {/* Right Column - Tx History & Developer API Docs (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          
          {/* 3. Transaction History */}
          <div className={`p-5 rounded-3xl border ${containerStyle} space-y-4`}>
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                <ArrowDownLeft className="w-4 h-4 text-purple-500" />
                <span>Easypaisa Claims Ledger</span>
              </h3>
              <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-bold">
                {userPayments.length} Requests
              </span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
              {userPayments.map(payment => (
                <div 
                  key={payment.id} 
                  className="p-3 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col gap-2 text-xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-extrabold text-zinc-800 dark:text-zinc-200 block">
                        Wallet Top-up
                      </span>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">
                        {new Date(payment.createdAt).toLocaleDateString()} at {new Date(payment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-zinc-900 dark:text-zinc-50 block">
                        {formatPKR(payment.amount)}
                      </span>
                      <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase mt-1 ${
                        payment.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : payment.status === 'rejected'
                            ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-zinc-100 dark:border-zinc-800/65 pt-2 font-mono text-zinc-400">
                    <div>
                      <span className="opacity-70">From No:</span>
                      <span className="block font-bold text-zinc-600 dark:text-zinc-300">{payment.senderPhone}</span>
                    </div>
                    <div>
                      <span className="opacity-70">TxID:</span>
                      <span className="block font-bold text-zinc-600 dark:text-zinc-300 select-all">{payment.txId}</span>
                    </div>
                  </div>
                </div>
              ))}

              {userPayments.length === 0 && (
                <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-950/10 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-2">
                  <Clock className="w-8 h-8 text-zinc-300 mx-auto" />
                  <div>
                    <span className="font-semibold text-zinc-500 text-[11px] block">No verification claims yet</span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">Submit your first deposit proof above to log a claim!</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 4. Credentials & Live API Placeholder (Anti-Sensitive Leak rule) */}
          <div className={`p-5 rounded-3xl border ${containerStyle} space-y-3`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-bold">
                <Code2 className="w-4 h-4 text-pink-500" />
                <span>Integration Secrets Placeholder</span>
              </div>
              <button
                type="button"
                id="btn-toggle-api-panel"
                onClick={() => setShowApiCredentials(!showApiCredentials)}
                className="text-[10px] text-purple-500 hover:text-purple-600 font-bold transition-all"
              >
                {showApiCredentials ? 'Hide' : 'Reveal Config'}
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              For real-time automated checkouts, the Easypaisa Merchant API uses secure webhook notifications. We do not store API passwords or credentials on client bundles.
            </p>

            {showApiCredentials && (
              <div className="space-y-3 pt-2 text-[11px] border-t border-zinc-100 dark:border-zinc-800/50 animate-fade-in">
                <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 font-mono text-[10px] text-zinc-300 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-zinc-400 border-b border-zinc-900 pb-1.5">
                    <Key className="w-3.5 h-3.5 text-yellow-500" />
                    <span>Mock credentials (.env.example schema)</span>
                  </div>
                  <div>
                    <span className="text-pink-500 font-bold">EASYPAISA_STORE_ID</span>
                    <span className="text-zinc-500 font-medium"> = </span>
                    <span className="text-teal-400">"EP_STORE_8829"</span>
                    <span className="block text-[8px] text-zinc-600 mt-0.5">// Registered Pulse merchant store ID</span>
                  </div>
                  <div>
                    <span className="text-pink-500 font-bold">EASYPAISA_HASH_KEY</span>
                    <span className="text-zinc-500 font-medium"> = </span>
                    <span className="text-teal-400">"****************************"</span>
                    <span className="block text-[8px] text-zinc-600 mt-0.5">// HmacSHA256 Secret encryption key</span>
                  </div>
                  <div>
                    <span className="text-pink-500 font-bold">EASYPAISA_SANDBOX_URL</span>
                    <span className="text-zinc-500 font-medium"> = </span>
                    <span className="text-teal-400">"https://easypay.easypaisa.com.pk/sandbox"</span>
                  </div>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-start gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                  <span className="text-[10px] text-zinc-400 leading-relaxed">
                    <strong>Zero Leak Guarantee:</strong> Secrets are referenced exclusively server-side. No sensitive tokens are loaded in plain-sight context scripts.
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
