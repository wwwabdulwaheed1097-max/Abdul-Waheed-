import React, { useState, FormEvent, useEffect } from 'react';
import { 
  User as UserIcon, Sparkles, Moon, Sun, Lock, Globe, Mail, Eye, KeyRound, 
  RefreshCw, Check, CheckCircle2, Smartphone, ShieldCheck, Languages, Type, 
  Copy, ShieldAlert, AlertTriangle, Monitor, LogOut, Key, Wallet
} from 'lucide-react';
import { User } from '../types';

interface SettingsSectionProps {
  currentUser: User | null;
  allUsers: User[];
  onUpdateProfile: (displayName: string, bio: string, avatarUrl: string, coverUrl: string) => void;
  onSwitchUser: (userId: string) => void;
  theme: 'light' | 'dark' | 'glass';
  setTheme: (theme: 'light' | 'dark' | 'glass') => void;
  onPurchasePremium?: (tier: 'standard' | 'ultra') => void;
  onSubmitEasypaisaPayment?: (
    amount: number, 
    senderPhone: string, 
    txId: string, 
    purpose: 'wallet_topup' | 'premium_plan' | 'ad_campaign' | 'business_promotion', 
    purposeDetails?: any, 
    receiptFileName?: string
  ) => void;
  onPurchaseWithWallet?: (amountPKR: number, purpose: 'premium_plan' | 'ad_campaign' | 'business_promotion', description: string, details?: any) => boolean;
}

const STOCK_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop',
];

const STOCK_COVERS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=300&fit=crop',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=300&fit=crop',
  'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=300&fit=crop',
];

// Seed word pool for account recovery
const SEED_POOL = [
  'pulse', 'synth', 'modular', 'audio', 'lfo', 'frequency', 'waveform', 'oscillator', 
  'filter', 'envelope', 'resonance', 'vibrato', 'digital', 'analog', 'stereo', 'tempo'
];

export default function SettingsSection({
  currentUser,
  allUsers,
  onUpdateProfile,
  onSwitchUser,
  theme,
  setTheme,
  onPurchasePremium,
  onSubmitEasypaisaPayment,
  onPurchaseWithWallet
}: SettingsSectionProps) {
  // Checkout modal states
  const [checkoutPlan, setCheckoutPlan] = useState<'standard' | 'ultra' | null>(null);
  const [checkoutMethod, setCheckoutMethod] = useState<'easypaisa' | 'wallet' | 'sandbox' | null>(null);
  const [senderPhoneForSub, setSenderPhoneForSub] = useState('');
  const [txIdForSub, setTxIdForSub] = useState('');
  const [checkoutIsSubmitting, setCheckoutIsSubmitting] = useState(false);
  const [checkoutSuccessMsg, setCheckoutSuccessMsg] = useState('');
  const [copiedNumForSub, setCopiedNumForSub] = useState(false);

  // Global Sizing & Language State reads
  const [fontSize, setLocalFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>(
    (localStorage.getItem('pulse_font_size') as any) || 'base'
  );
  const [lang, setLocalLang] = useState<'en' | 'es' | 'fr' | 'ja'>(
    (localStorage.getItem('pulse_lang') as any) || 'en'
  );

  // Profile Form state
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [coverUrl, setCoverUrl] = useState(currentUser?.coverUrl || '');

  // Privacy & 2FA states
  const [isPrivate, setIsPrivate] = useState(false);
  const [readReceipts, setReadReceipts] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    localStorage.getItem(`pulse_2fa_${currentUser?.id}`) === 'true'
  );
  const [show2FAConfig, setShow2FAConfig] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [temp2FASecret, setTemp2FASecret] = useState('');

  // Account Recovery Seed states
  const [recoverySeed, setRecoverySeed] = useState<string[]>([]);
  const [seedVerifyWord, setSeedVerifyWord] = useState('');
  const [seedVerifyIndex, setSeedVerifyIndex] = useState(0);
  const [seedVerifyInput, setSeedVerifyInput] = useState('');
  const [seedVerifySuccess, setSeedVerifySuccess] = useState(false);
  const [seedVerifyError, setSeedVerifyError] = useState(false);

  // Device Sessions state
  const [sessions, setSessions] = useState([
    { id: 'sess_1', device: 'Chrome on macOS (M3 Max)', location: 'San Francisco, CA', ip: '192.168.1.144', current: true },
    { id: 'sess_2', device: 'Safari on iPhone 15 Pro', location: 'Austin, TX', ip: '172.56.21.90', current: false },
    { id: 'sess_3', device: 'Firefox on Linux Kernel', location: 'Tokyo, Japan', ip: '203.0.113.19', current: false }
  ]);

  // Reset password simulation state
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Handle toast
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  if (!currentUser) return null;

  // Language Dictionary translations
  const TRANSLATIONS = {
    en: {
      themeTitle: 'App Theme Canvas',
      themeDesc: 'Select how you want to experience the Pulse ecosystem. Switch layout presets instantly:',
      switchTitle: 'Switch Profile (Developer Mode)',
      switchDesc: 'Pulse provides fully pre-populated mock profiles. Click any to hot-reload and simulate their feed, bookmarks, group chat rooms, and moderation powers:',
      profileTitle: 'Profile Customization',
      saveBtn: 'Save Changes',
      privacyTitle: 'Privacy Settings',
      privacyDesc: 'Decide how other synthesizer artists and creators interact with your profile and logs:',
      securityTitle: 'Security & Two-Factor (2FA)',
      securityDesc: 'Establish multi-layered cryptographic authorization rules to guard your creator profile.',
      fontTitle: 'App Font Scale Controls',
      fontDesc: 'Adjust layout densities and font readability scale settings instantly across the portal:',
      langTitle: 'Default System Language',
      langDesc: 'Set default translations for interactive tags, prompts, and interface menus:'
    },
    es: {
      themeTitle: 'Lienzo de Temas del Sistema',
      themeDesc: 'Selecciona cómo quieres experimentar el ecosistema Pulse. Cambia los preajustes de diseño al instante:',
      switchTitle: 'Cambiar de Perfil (Modo de Desarrollo)',
      switchDesc: 'Pulse proporciona perfiles de prueba completamente preestablecidos. Haz clic en cualquiera para simular su feed, marcadores, salas de chat y poderes de moderación:',
      profileTitle: 'Personalización del Perfil',
      saveBtn: 'Guardar Cambios',
      privacyTitle: 'Configuración de Privacidad',
      privacyDesc: 'Decide cómo otros artistas de sintetizadores e ingenieros interactúan con tus registros técnicos:',
      securityTitle: 'Seguridad y Doble Factor (2FA)',
      securityDesc: 'Establece reglas criptográficas multicapa para proteger tu cuenta de creador de ondas.',
      fontTitle: 'Controles de Escala de Fuente',
      fontDesc: 'Ajusta la densidad de lectura y la escala tipográfica en todo el portal de forma inmediata:',
      langTitle: 'Idioma Predeterminado',
      langDesc: 'Configura la traducción nativa para las etiquetas, diálogos y menús de control:'
    },
    fr: {
      themeTitle: 'Thème de l\'Application',
      themeDesc: 'Sélectionnez votre préréglage pour l\'écosystème Pulse. Modifiez les thèmes d\'affichage instantanément :',
      switchTitle: 'Changer de Profil (Mode Développeur)',
      switchDesc: 'Pulse propose des profils d\'essai entièrement pré-générés. Cliquez pour charger leur flux, favoris, salons de discussion et pouvoirs d\'administration :',
      profileTitle: 'Personnalisation du Profil',
      saveBtn: 'Enregistrer',
      privacyTitle: 'Paramètres de Confidentialité',
      privacyDesc: 'Choisissez comment les autres artistes et créateurs interagissent avec vos journaux d\'activités :',
      securityTitle: 'Sécurité & Double Facteur (2FA)',
      securityDesc: 'Activez une protection par clé asymétrique cryptographique pour votre profil.',
      fontTitle: 'Taille des Polices de Caractère',
      fontDesc: 'Ajustez instantanément la taille d\'affichage de la police et la densité des blocs :',
      langTitle: 'Langue de l\'Interface',
      langDesc: 'Définissez la langue par défaut pour les balises de navigation et les menus :'
    },
    ja: {
      themeTitle: 'システムテーマキャンバス',
      themeDesc: 'Pulseエコシステムの表示設定を選択します。レイアウトプリセットを即座に切り替えます：',
      switchTitle: 'アカウント切替 (開発者モード)',
      switchDesc: 'Pulseは豊富なシミュレーションプロファイルを提供します。クリックしてフィード、ブックマーク、グループチャット、モデレーション権限を有効にします：',
      profileTitle: 'プロファイル編集',
      saveBtn: '変更を保存',
      privacyTitle: 'プライバシー設定',
      privacyDesc: '他のシンセアーティストやクリエイターが、あなたのログや投稿をどのように表示するかを決定します：',
      securityTitle: 'セキュリティと2段階認証 (2FA)',
      securityDesc: '作成者アカウントを保護するために、多層暗号認証ルールを設定します。',
      fontTitle: 'フォントサイズ調整',
      fontDesc: '画面表示文字スケールとレイアウト密度をリアルタイムで変更します：',
      langTitle: 'システム言語設定',
      langDesc: 'ナビゲーションタグ、システムダイアログ、およびメニュー翻訳を設定します：'
    }
  };

  const tDict = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const handleUpdateSubmit = (e: FormEvent) => {
    e.preventDefault();
    onUpdateProfile(displayName, bio, avatarUrl, coverUrl);
    setToastMsg('Pulse Profile updated successfully! ✨');
  };

  const handleResetPassword = (e: FormEvent) => {
    e.preventDefault();
    if (!oldPass || !newPass) return;
    setResetSuccess(true);
    setOldPass('');
    setNewPass('');
    setToastMsg('Password key verified and reset successfully! 🔒');
    setTimeout(() => setResetSuccess(false), 3000);
  };

  // 2FA Actions
  const handleInitiate2FA = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) secret += ' ';
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTemp2FASecret(secret);
    setShow2FAConfig(true);
    setOtpInput('');
    setOtpError(false);
  };

  const handleVerifyOTP = () => {
    // Simulate active validation checking
    if (otpInput.length === 6) {
      setTwoFactorEnabled(true);
      localStorage.setItem(`pulse_2fa_${currentUser.id}`, 'true');
      setShow2FAConfig(false);
      setOtpError(false);
      setToastMsg('Two-Factor Authentication (2FA) is now fully secured! 🛡️');
    } else {
      setOtpError(true);
    }
  };

  const handleDisable2FA = () => {
    setTwoFactorEnabled(false);
    localStorage.removeItem(`pulse_2fa_${currentUser.id}`);
    setToastMsg('2FA security removed. Account relies on single auth pass.');
  };

  // Recovery Seed Generator
  const handleGenerateSeed = () => {
    // Pick 12 random words from pool
    const shuffled = [...SEED_POOL].sort(() => 0.5 - Math.random());
    const words = shuffled.slice(0, 12);
    setRecoverySeed(words);
    const randIndex = Math.floor(Math.random() * 12);
    setSeedVerifyIndex(randIndex);
    setSeedVerifyWord(words[randIndex]);
    setSeedVerifyInput('');
    setSeedVerifySuccess(false);
    setSeedVerifyError(false);
  };

  const handleVerifySeedInput = () => {
    if (seedVerifyInput.trim().toLowerCase() === seedVerifyWord) {
      setSeedVerifySuccess(true);
      setSeedVerifyError(false);
      setToastMsg('Master key verified! Recovery phrase backed up.');
    } else {
      setSeedVerifyError(true);
    }
  };

  // Revoke device session
  const handleRevokeSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    setToastMsg('Session keys revoked successfully! Connected token destroyed.');
  };

  // Font size changer
  const changeFontSize = (size: 'sm' | 'base' | 'lg' | 'xl') => {
    setLocalFontSize(size);
    localStorage.setItem('pulse_font_size', size);
    
    // Apply changes dynamically on top-level root element
    const appRoot = document.getElementById('pulse-app-root');
    if (appRoot) {
      appRoot.classList.remove('[font-size:13px]', '[font-size:14px]', '[font-size:16px]', '[font-size:18px]');
      let fontSizeClass = '[font-size:14px]';
      if (size === 'sm') fontSizeClass = '[font-size:13px]';
      if (size === 'lg') fontSizeClass = '[font-size:16px]';
      if (size === 'xl') fontSizeClass = '[font-size:18px]';
      appRoot.classList.add(fontSizeClass);
    }
    setToastMsg(`Typography scale set to ${size.toUpperCase()}`);
  };

  // Language Switcher
  const changeLanguage = (langId: 'en' | 'es' | 'fr' | 'ja') => {
    setLocalLang(langId);
    localStorage.setItem('pulse_lang', langId);
    setToastMsg(`Interface translated to ${langId.toUpperCase()}`);
    // Dispatch local event so header modules update
    window.dispatchEvent(new Event('pulse_lang_change'));
  };

  const containerStyle = theme === 'glass'
    ? 'bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-white/20 dark:border-zinc-800/20 shadow-md'
    : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 shadow-sm';

  const inputStyle = 'w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm';

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 text-sm animate-fade-in">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div id="settings-toast" className="fixed top-6 left-1/2 transform -translate-x-1/2 px-5 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black font-medium text-xs rounded-full shadow-2xl z-[250] flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-purple-400 dark:text-purple-600 animate-spin" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 0. PULSE PREMIUM PLANS */}
      <div className={`p-6 rounded-3xl border ${containerStyle} overflow-hidden relative`}>
        {currentUser.isPremium && (
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 blur-2xl rounded-full pointer-events-none" />
        )}
        
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="font-display font-black text-lg bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 bg-clip-text text-transparent flex items-center gap-1.5">
              <Sparkles className="w-5 h-5 text-purple-500 animate-spin" />
              <span>Pulse Premium Ecosystem</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-md leading-relaxed">
              Elevate your creative playground with exclusive creator capabilities, asymmetric encryption verification badges, and studio metrics tools.
            </p>
          </div>
          {currentUser.isPremium && (
            <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-extrabold rounded-full text-[10px] uppercase shadow-md animate-pulse shrink-0">
              {currentUser.premiumTier === 'ultra' ? '★ Ultra Active' : '✦ Standard Active'}
            </span>
          )}
        </div>

        {currentUser.isPremium ? (
          <div className="mt-5 p-4 bg-purple-500/5 dark:bg-purple-500/10 rounded-2xl border border-purple-500/20 space-y-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-purple-500 fill-purple-500/10" />
              <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200">Your Premium Privileges are Fully Unlocked!</span>
            </div>
            <ul className="text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1.5 pl-6 list-disc leading-normal">
              <li><strong>Official Blue Verification Badge:</strong> Displayed automatically next to your name across feed channels.</li>
              <li><strong>Enhanced Creative Wave Analytics:</strong> Monitor demographic clickthrough ratios on all launched campaigns.</li>
              <li><strong>Custom Layout Highlights:</strong> Unlocked special glowing frame borders when view logs are activated.</li>
              <li>{currentUser.premiumTier === 'ultra' ? <strong>Ultra Audio Synthesizer Presets:</strong> : <strong>Standard Audio Loops:</strong>} High fidelity presets and advanced sound loops enabled.</li>
            </ul>
            <p className="text-[10px] text-zinc-400 italic">Membership automatically simulated on local storage. No real money is charged. To switch tiers, click any of the developer profiles below or clear site data.</p>
          </div>
        ) : checkoutPlan ? (
          /* Custom High-Fidelity Checkout Form */
          <div className="mt-6 p-5 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-3xl animate-fade-in space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-extrabold text-purple-500 tracking-wider">Premium Subscription Checkout</span>
                <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mt-0.5">
                  Confirming: {checkoutPlan === 'standard' ? 'Standard Creator' : 'Ultra Studio'} Subscription
                </h4>
              </div>
              <button
                type="button"
                id="btn-close-checkout"
                onClick={() => {
                  setCheckoutPlan(null);
                  setCheckoutMethod(null);
                  setCheckoutSuccessMsg('');
                }}
                className="text-xs text-zinc-400 hover:text-zinc-500 font-bold"
              >
                Cancel
              </button>
            </div>

            {checkoutSuccessMsg ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{checkoutSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={(e) => {
                e.preventDefault();
                const pkrAmount = checkoutPlan === 'standard' ? 2780 : 5560;

                if (checkoutMethod === 'sandbox') {
                  if (onPurchasePremium) {
                    onPurchasePremium(checkoutPlan);
                    setCheckoutSuccessMsg(`✨ Premium subscription (${checkoutPlan}) activated instantly using sandbox trial!`);
                    setTimeout(() => {
                      setCheckoutPlan(null);
                      setCheckoutMethod(null);
                      setCheckoutSuccessMsg('');
                    }, 3000);
                  }
                } else if (checkoutMethod === 'wallet') {
                  if (!currentUser) return;
                  const walletBal = currentUser.walletBalance || 0;
                  if (walletBal < pkrAmount) {
                    alert(`Insufficient balance. This plan costs Rs. ${pkrAmount}, but you only have Rs. ${walletBal}. Please top up your wallet first!`);
                    return;
                  }
                  if (onPurchaseWithWallet) {
                    const success = onPurchaseWithWallet(pkrAmount, 'premium_plan', `Deduction for Premium subscription (${checkoutPlan})`, { tier: checkoutPlan });
                    if (success) {
                      setCheckoutSuccessMsg(`✨ Premium subscription (${checkoutPlan}) activated successfully using Wallet Balance!`);
                      setTimeout(() => {
                        setCheckoutPlan(null);
                        setCheckoutMethod(null);
                        setCheckoutSuccessMsg('');
                      }, 3000);
                    } else {
                      alert('Something went wrong processing your wallet deduction.');
                    }
                  }
                } else if (checkoutMethod === 'easypaisa') {
                  if (!senderPhoneForSub || !txIdForSub) {
                    alert('Please fill out all required fields.');
                    return;
                  }
                  if (txIdForSub.trim().length < 8) {
                    alert('Please enter a valid Transaction ID.');
                    return;
                  }
                  if (onSubmitEasypaisaPayment) {
                    onSubmitEasypaisaPayment(pkrAmount, senderPhoneForSub, txIdForSub, 'premium_plan', { tier: checkoutPlan }, 'receipt_direct_sub.png');
                    setCheckoutSuccessMsg(`✨ Easypaisa Claim submitted successfully! Verification usually takes less than an hour.`);
                    setSenderPhoneForSub('');
                    setTxIdForSub('');
                    setTimeout(() => {
                      setCheckoutPlan(null);
                      setCheckoutMethod(null);
                      setCheckoutSuccessMsg('');
                    }, 4000);
                  }
                }
              }} className="space-y-4 text-xs">
                
                {/* Method Selection Cards */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Choose Payment Method</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    {/* Method 1: Easypaisa Direct */}
                    <div
                      id="method-card-easypaisa"
                      onClick={() => setCheckoutMethod('easypaisa')}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        checkoutMethod === 'easypaisa'
                          ? 'border-purple-500 bg-purple-500/5 dark:bg-purple-500/5 text-purple-600 dark:text-purple-400 font-bold'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <span className="block font-semibold">Easypaisa Direct</span>
                      <span className="text-[10px] text-zinc-400 font-normal block mt-1">Manual bank transfer</span>
                    </div>

                    {/* Method 2: Wallet Balance */}
                    <div
                      id="method-card-wallet"
                      onClick={() => setCheckoutMethod('wallet')}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        checkoutMethod === 'wallet'
                          ? 'border-purple-500 bg-purple-500/5 dark:bg-purple-500/5 text-purple-600 dark:text-purple-400 font-bold'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <span className="block font-semibold">Digital Wallet</span>
                      <span className="text-[10px] text-zinc-400 font-normal block mt-1">Bal: Rs. {currentUser?.walletBalance || 0}</span>
                    </div>

                    {/* Method 3: Instant sandbox trial */}
                    <div
                      id="method-card-sandbox"
                      onClick={() => setCheckoutMethod('sandbox')}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        checkoutMethod === 'sandbox'
                          ? 'border-purple-500 bg-purple-500/5 dark:bg-purple-500/5 text-purple-600 dark:text-purple-400 font-bold'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <span className="block font-semibold">Instant Trial</span>
                      <span className="text-[10px] text-zinc-400 font-normal block mt-1">Direct instant simulation</span>
                    </div>

                  </div>
                </div>

                {/* Conditional Form Inputs */}
                {checkoutMethod === 'easypaisa' && (
                  <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3 animate-fade-in">
                    <div className="flex flex-col gap-1.5 pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500">Easypaisa Account Details</span>
                      <div className="flex justify-between text-[11px] text-zinc-600 dark:text-zinc-300 font-mono">
                        <span>Mobile No: <strong>03459602406</strong></span>
                        <span>Title: <strong>Abdul Waheed</strong></span>
                      </div>
                      <span className="text-[10px] text-zinc-400 leading-normal italic mt-1">
                        Please send exactly <strong>Rs. {checkoutPlan === 'standard' ? '2,780' : '5,560'}</strong> via Easypaisa to the above title, then fill verification below:
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-400">Your Sender Phone Number</label>
                        <input
                          id="inp-sub-phone"
                          type="tel"
                          required
                          placeholder="e.g. 03451234567"
                          value={senderPhoneForSub}
                          onChange={e => setSenderPhoneForSub(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-400">Easypaisa Transaction ID (TxID)</label>
                        <input
                          id="inp-sub-txid"
                          type="text"
                          required
                          placeholder="e.g. 81920194829"
                          value={txIdForSub}
                          onChange={e => setTxIdForSub(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {checkoutMethod === 'wallet' && (
                  <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-1.5 animate-fade-in text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="block font-bold text-zinc-700 dark:text-zinc-300">Wallet Deduction Confirmation</span>
                    <p className="leading-relaxed">
                      We will deduct <strong>Rs. {checkoutPlan === 'standard' ? '2,780' : '5,560'}</strong> from your digital wallet balance.
                    </p>
                    <div className="flex justify-between font-bold pt-1.5 border-t border-zinc-100 dark:border-zinc-800 mt-1.5 text-zinc-800 dark:text-zinc-200">
                      <span>Your Balance:</span>
                      <span>Rs. {currentUser?.walletBalance || 0}</span>
                    </div>
                    {(currentUser?.walletBalance || 0) < (checkoutPlan === 'standard' ? 2780 : 5560) && (
                      <div className="p-2 bg-red-500/5 text-red-500 border border-red-500/10 rounded-lg text-[10px] mt-1.5 font-semibold">
                        ⚠️ Insufficient Balance. Please go to the Wallet section and Top Up using Easypaisa first.
                      </div>
                    )}
                  </div>
                )}

                {checkoutMethod === 'sandbox' && (
                  <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-1 animate-fade-in text-xs text-zinc-400">
                    <span className="block font-bold text-zinc-700 dark:text-zinc-300">Instant Sandbox Activation</span>
                    <p className="leading-normal">This will bypass the payment gate and instantly grant Premium credentials on your local account for trial evaluation.</p>
                  </div>
                )}

                {checkoutMethod ? (
                  <button
                    id="btn-confirm-checkout"
                    type="submit"
                    disabled={checkoutMethod === 'wallet' && (currentUser?.walletBalance || 0) < (checkoutPlan === 'standard' ? 2780 : 5560)}
                    className="w-full py-2.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-95 text-white font-bold rounded-xl transition-all disabled:opacity-50"
                  >
                    Confirm & Complete Checkout
                  </button>
                ) : (
                  <div className="p-3 text-center text-zinc-400 italic font-medium bg-zinc-100 dark:bg-zinc-900/50 rounded-xl">
                    Select a payment method above to complete your transaction
                  </div>
                )}

              </form>
            )}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in text-xs">
            {/* Plan 1: Standard */}
            <div className="p-4.5 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/20 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase text-purple-500 tracking-wider">Standard Creator Plan</span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl font-display font-black text-zinc-900 dark:text-zinc-50">$9.99</span>
                  <span className="text-[10px] text-zinc-400 font-bold">/ month</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-normal pt-1.5">Perfect for indie artists aiming to verify their profiles and unlock basic stream statistics.</p>
              </div>

              <div className="space-y-3">
                <ul className="space-y-1.5 pl-4 list-disc text-[10px] text-zinc-500 dark:text-zinc-400">
                  <li>Blue Verified Badge</li>
                  <li>Basic Campaign Analytics</li>
                  <li>Expanded Loop Stories</li>
                </ul>

                <button
                  id="btn-subscribe-standard"
                  type="button"
                  onClick={() => {
                    setCheckoutPlan('standard');
                    setCheckoutMethod(null);
                  }}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-md shadow-purple-500/10 transition-all active:scale-95"
                >
                  Activate Standard Plan
                </button>
              </div>
            </div>

            {/* Plan 2: Ultra */}
            <div className="p-4.5 rounded-2xl border border-purple-500/30 bg-purple-500/5 dark:bg-purple-500/5 flex flex-col justify-between space-y-4 relative">
              <span className="absolute -top-2.5 right-3 px-2 py-0.5 bg-amber-500 text-white font-bold rounded-full text-[8px] uppercase tracking-wider shadow-sm">Best Value</span>
              
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase text-pink-500 tracking-wider">Ultra Studio Plan</span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl font-display font-black text-zinc-900 dark:text-zinc-50">$19.99</span>
                  <span className="text-[10px] text-zinc-400 font-bold">/ month</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-normal pt-1.5">For professional sound designers seeking advanced interactive widgets and unlimited chats.</p>
              </div>

              <div className="space-y-3">
                <ul className="space-y-1.5 pl-4 list-disc text-[10px] text-zinc-500 dark:text-zinc-400">
                  <li>Gold Verified Status Badge</li>
                  <li>Premium Glow Border Effects</li>
                  <li>3D Synth Preset Libraries</li>
                </ul>

                <button
                  id="btn-subscribe-ultra"
                  type="button"
                  onClick={() => {
                    setCheckoutPlan('ultra');
                    setCheckoutMethod(null);
                  }}
                  className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90 text-white font-bold rounded-xl text-xs shadow-lg transition-all active:scale-95"
                >
                  Activate Ultra Studio
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 1. THEME SWITCHER */}
      <div className={`p-5 rounded-3xl border ${containerStyle}`}>
        <h3 className="font-display font-bold text-base text-zinc-900 dark:text-zinc-50 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <span>{tDict.themeTitle}</span>
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
          {tDict.themeDesc}
        </p>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'light', label: 'Daylight', desc: 'Sleek & clean contrast', icon: Sun },
            { id: 'dark', label: 'Midnight', desc: 'Relaxing high-contrast', icon: Moon },
            { id: 'glass', label: 'Reflective Glass', desc: 'Immersive frosted glass', icon: Sparkles }
          ].map(t => {
            const Icon = t.icon;
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                id={`btn-theme-select-${t.id}`}
                onClick={() => setTheme(t.id as any)}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all active:scale-95 ${
                  active 
                    ? 'border-purple-500 bg-purple-500/5 dark:bg-purple-500/10' 
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-950/20'
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <div className={`p-2 rounded-xl ${active ? 'bg-purple-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {active && <Check className="w-4 h-4 text-purple-500" />}
                </div>
                <div className="mt-4">
                  <span className="font-semibold text-xs text-zinc-800 dark:text-zinc-200 block">{t.label}</span>
                  <span className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed block">{t.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. ACCESSIBILITY & FONTS & LANGUAGES */}
      <div className={`p-5 rounded-3xl border ${containerStyle} grid grid-cols-1 md:grid-cols-2 gap-6`}>
        
        {/* Font controls */}
        <div className="space-y-3">
          <h4 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
            <Type className="w-4.5 h-4.5 text-pink-500" />
            <span>{tDict.fontTitle}</span>
          </h4>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
            {tDict.fontDesc}
          </p>
          <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-950/40 p-1 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
            {(['sm', 'base', 'lg', 'xl'] as const).map(size => (
              <button
                key={size}
                id={`btn-font-size-${size}`}
                onClick={() => changeFontSize(size)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg uppercase transition-all ${
                  fontSize === size 
                    ? 'bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-sm border border-zinc-200 dark:border-zinc-800/80' 
                    : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Language controls */}
        <div className="space-y-3">
          <h4 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
            <Languages className="w-4.5 h-4.5 text-emerald-500" />
            <span>{tDict.langTitle}</span>
          </h4>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
            {tDict.langDesc}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'en', label: 'English (US)' },
              { id: 'es', label: 'Español' },
              { id: 'fr', label: 'Français' },
              { id: 'ja', label: '日本語' }
            ].map(l => (
              <button
                key={l.id}
                id={`btn-lang-${l.id}`}
                onClick={() => changeLanguage(l.id as any)}
                className={`py-1.5 px-3 rounded-xl border text-left text-xs font-semibold transition-all flex justify-between items-center ${
                  lang === l.id 
                    ? 'border-purple-500 bg-purple-500/5 text-purple-600 dark:text-purple-400' 
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-950/20 text-zinc-600 dark:text-zinc-300'
                }`}
              >
                <span>{l.label}</span>
                {lang === l.id && <span className="h-1.5 w-1.5 bg-purple-500 rounded-full" />}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 3. TWO-FACTOR AUTH (2FA) SECURITY SETTINGS */}
      <div className={`p-5 rounded-3xl border ${containerStyle}`}>
        <h3 className="font-display font-bold text-base text-zinc-900 dark:text-zinc-50 mb-3 flex items-center gap-2">
          <Lock className="w-5 h-5 text-purple-500" />
          <span>{tDict.securityTitle}</span>
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
          {tDict.securityDesc}
        </p>

        <div className="bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <ShieldCheck className={`w-4 h-4 ${twoFactorEnabled ? 'text-emerald-500' : 'text-zinc-400'}`} />
                <span>Authenticator App Validation (2FA)</span>
              </span>
              <span className="text-[10px] text-zinc-400 block leading-relaxed">
                Require TOTP authentication token check during new registration sequences.
              </span>
            </div>

            {twoFactorEnabled ? (
              <button
                id="btn-disable-2fa"
                onClick={handleDisable2FA}
                className="px-3.5 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl font-bold text-xs hover:bg-rose-500/20 transition-all active:scale-95"
              >
                Disable
              </button>
            ) : (
              <button
                id="btn-enable-2fa-setup"
                onClick={handleInitiate2FA}
                className="px-3.5 py-1.5 bg-purple-500 text-white rounded-xl font-bold text-xs hover:bg-purple-600 shadow-md shadow-purple-500/10 transition-all active:scale-95"
              >
                Configure 2FA
              </button>
            )}
          </div>

          {/* Expanded 2FA Setup Flow */}
          {show2FAConfig && (
            <div id="2fa-config-wizard" className="border-t border-zinc-200/50 dark:border-zinc-800/50 pt-4 space-y-4 animate-fade-in text-xs">
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3.5 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-amber-700 dark:text-amber-400 block">Guard Credentials Setup</span>
                  <span className="text-zinc-500 dark:text-zinc-400 leading-normal block">Scan the secure pixel seed with Google Authenticator or manual code entry:</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                {/* Simulated QR Code using real styled SVG for production-grade display */}
                <div className="w-24 h-24 bg-white border border-zinc-200 p-1.5 rounded-lg flex items-center justify-center shrink-0 shadow-sm relative">
                  <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="2" width="6" height="6" fill="#18181b" />
                    <rect x="16" y="2" width="6" height="6" fill="#18181b" />
                    <rect x="2" y="16" width="6" height="6" fill="#18181b" />
                    <path d="M12 2h2v4h-2zm4 12h2v2h-2zm-6 4h4v2h-4zm8-4h2v6h-2zM4 10h4v2H4zm8 0h2v4h-2zm4-2h4v2h-4z" fill="#18181b" />
                  </svg>
                  <span className="absolute bottom-0.5 right-0.5 px-1 bg-purple-500 text-white rounded text-[8px] font-bold scale-75">QR</span>
                </div>

                <div className="flex-1 space-y-2">
                  <div>
                    <span className="text-[10px] text-zinc-400 font-bold block uppercase">Secret Token Seed Code</span>
                    <span className="font-mono text-sm text-zinc-800 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg border border-zinc-200/50 dark:border-zinc-800/50 block select-all tracking-wider mt-1 font-bold">
                      {temp2FASecret}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase block">Confirm 6-Digit Authenticator OTP Code</label>
                    <div className="flex gap-2">
                      <input
                        id="otp-validation-input"
                        type="text"
                        maxLength={6}
                        placeholder="000 000"
                        value={otpInput}
                        onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                        className="font-mono text-center text-sm font-bold bg-zinc-50 dark:bg-zinc-950 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 w-28 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        id="btn-verify-otp"
                        type="button"
                        disabled={otpInput.length !== 6}
                        onClick={handleVerifyOTP}
                        className="px-4 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 disabled:opacity-40 transition-all shadow-md active:scale-95 flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        Verify
                      </button>
                    </div>
                    {otpError && (
                      <p className="text-[10px] text-rose-500 font-bold animate-pulse">! Authentication code mismatch. Try typing six digits.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. ACCOUNT RECOVERY (12-WORD MASTER KEY GENERATOR) */}
      <div className={`p-5 rounded-3xl border ${containerStyle}`}>
        <h3 className="font-display font-bold text-base text-zinc-900 dark:text-zinc-50 mb-3 flex items-center gap-2">
          <Key className="w-5 h-5 text-amber-500" />
          <span>Master Account Recovery Seed</span>
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
          In offline-first architectures, losing your device cache destroys local keys. Generate a secure 12-word recovery phrase to preserve backups of your logs:
        </p>

        <div className="bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-4 space-y-4">
          {recoverySeed.length === 0 ? (
            <button
              id="btn-generate-recovery-seed"
              onClick={handleGenerateSeed}
              className="px-4 py-2 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 active:scale-95"
            >
              <KeyRound className="w-4 h-4" />
              <span>Generate Master Recovery Phrase</span>
            </button>
          ) : (
            <div className="space-y-4 animate-fade-in text-xs">
              <span className="font-bold text-zinc-400 block uppercase text-[10px]">Your 12-Word Security Backup Code:</span>
              <div className="grid grid-cols-3 gap-2 bg-white dark:bg-zinc-950 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 font-mono text-[11px] font-bold">
                {recoverySeed.map((word, idx) => (
                  <div key={idx} className="bg-zinc-50 dark:bg-zinc-900 p-1.5 rounded border border-zinc-200/40 dark:border-zinc-800/40 flex gap-2">
                    <span className="text-zinc-400 text-[9px]">{idx + 1}.</span>
                    <span className="text-zinc-800 dark:text-zinc-100 select-all">{word}</span>
                  </div>
                ))}
              </div>

              {/* Master Phrase copy button */}
              <button
                id="btn-copy-seed"
                onClick={() => {
                  navigator.clipboard.writeText(recoverySeed.join(' '));
                  setToastMsg('Phrase copied to clipboard! 📋');
                }}
                className="flex items-center gap-1 font-bold text-[10px] text-purple-600 dark:text-purple-400 hover:underline"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy 12-word master string</span>
              </button>

              {/* Recovery Verification step */}
              <div className="border-t border-zinc-200/50 dark:border-zinc-800/50 pt-3 space-y-2">
                <span className="font-bold text-zinc-500 block">Confirm backup verification check:</span>
                <p className="text-[11px] text-zinc-400">Type the recovery word #<strong className="text-zinc-800 dark:text-zinc-200">{seedVerifyIndex + 1}</strong> to finalize secure logs:</p>
                
                <div className="flex gap-2">
                  <input
                    id="recovery-verify-input"
                    type="text"
                    placeholder="Enter word..."
                    value={seedVerifyInput}
                    onChange={e => setSeedVerifyInput(e.target.value)}
                    className="bg-white dark:bg-zinc-950 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-purple-500 w-36 font-semibold"
                  />
                  <button
                    id="btn-verify-seed-words"
                    onClick={handleVerifySeedInput}
                    className="px-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-bold hover:opacity-90 active:scale-95"
                  >
                    Verify Backup
                  </button>
                </div>

                {seedVerifySuccess && (
                  <p className="text-[10px] text-emerald-500 font-bold animate-pulse flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Master backup successfully generated & verified in cache lock.</span>
                  </p>
                )}
                {seedVerifyError && (
                  <p className="text-[10px] text-rose-500 font-bold animate-pulse">! Backup confirmation mismatch. Re-verify the seed pool index word.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. SWITCH ACCOUNTS (MOCK AUTH TESTING IN PREVIEW) */}
      <div className={`p-5 rounded-3xl border ${containerStyle}`}>
        <h3 className="font-display font-bold text-base text-zinc-900 dark:text-zinc-50 mb-3 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-indigo-500" />
          <span>{tDict.switchTitle}</span>
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
          {tDict.switchDesc}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {allUsers.map(user => {
            const active = user.id === currentUser.id;
            return (
              <button
                key={user.id}
                id={`btn-dev-switch-user-${user.id}`}
                onClick={() => onSwitchUser(user.id)}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 text-left transition-all active:scale-95 ${
                  active 
                    ? 'border-purple-500 bg-purple-500/5 dark:bg-purple-500/10' 
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-950/10'
                }`}
              >
                <img src={user.avatarUrl} alt={user.displayName} className="w-8 h-8 rounded-full object-cover" />
                <div className="min-w-0">
                  <div className="flex items-center gap-0.5">
                    <span className="font-semibold text-xs text-zinc-800 dark:text-zinc-200 truncate">{user.displayName}</span>
                    {user.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 fill-sky-500 animate-pulse" />}
                  </div>
                  <span className="text-[10px] text-zinc-400 block">@{user.username} {user.isAdmin ? '(Admin)' : ''}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. PROFILE DETAILS */}
      <div className={`p-5 rounded-3xl border ${containerStyle}`}>
        <h3 className="font-display font-bold text-base text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-pink-500" />
          <span>{tDict.profileTitle}</span>
        </h3>

        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Display Name</label>
              <input
                id="edit-displayname-input"
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className={inputStyle}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Email Address (Auth ID)</label>
              <input
                type="email"
                disabled
                value={currentUser.email}
                className={`${inputStyle} opacity-50 cursor-not-allowed`}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Profile Biography (Bio)</label>
            <textarea
              id="edit-bio-input"
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              className={`${inputStyle} resize-none`}
            />
          </div>

          {/* Quick Preset Choice Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-100 dark:border-zinc-800/40 pt-4">
            <div>
              <label className="text-xs font-semibold text-zinc-400 mb-2 block">Choose Avatar Photo</label>
              <div className="flex gap-2">
                {STOCK_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    id={`btn-stock-avatar-${idx}`}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-transform active:scale-90 ${avatarUrl === url ? 'border-purple-500 scale-105' : 'border-transparent'}`}
                  >
                    <img src={url} alt="preset avatar" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 mb-2 block">Choose Cover Banner</label>
              <div className="flex gap-2">
                {STOCK_COVERS.map((url, idx) => (
                  <button
                    key={idx}
                    id={`btn-stock-cover-${idx}`}
                    type="button"
                    onClick={() => setCoverUrl(url)}
                    className={`w-12 h-7 rounded border-2 overflow-hidden transition-transform active:scale-90 ${coverUrl === url ? 'border-purple-500 scale-105' : 'border-transparent'}`}
                  >
                    <img src={url} alt="preset cover" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            id="btn-save-profile-settings"
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl hover:opacity-90 active:scale-98 shadow-md shadow-purple-500/10 transition-all text-xs"
          >
            {tDict.saveBtn}
          </button>
        </form>
      </div>

      {/* 7. ACTIVE DEVICE SESSIONS */}
      <div className={`p-5 rounded-3xl border ${containerStyle}`}>
        <h3 className="font-display font-bold text-base text-zinc-900 dark:text-zinc-50 mb-3 flex items-center gap-2">
          <Monitor className="w-5 h-5 text-indigo-500" />
          <span>Active Device Login History</span>
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
          Monitor your active session logs. Instantly revoke any unfamiliar connections to prevent session-jacking:
        </p>

        <div className="space-y-3">
          {sessions.map(session => (
            <div
              key={session.id}
              id={`device-session-${session.id}`}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/80 hover:border-purple-500/30 transition-all animate-fade-in"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${session.current ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400'}`}>
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200">{session.device}</span>
                    {session.current && (
                      <span className="text-[8px] font-extrabold uppercase bg-emerald-500 text-white px-1.5 py-0.5 rounded">Active Session</span>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">{session.location} • {session.ip}</span>
                </div>
              </div>

              {!session.current && (
                <button
                  id={`btn-revoke-device-${session.id}`}
                  onClick={() => handleRevokeSession(session.id)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                  title="Revoke session key"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {sessions.length === 1 && (
            <p className="text-center text-[10px] text-zinc-400 py-2">All secondary devices and sessions have been logged out securely.</p>
          )}
        </div>
      </div>

      {/* 8. PRIVACY CONTROLS */}
      <div className={`p-5 rounded-3xl border ${containerStyle}`}>
        <h3 className="font-display font-bold text-base text-zinc-900 dark:text-zinc-50 mb-3 flex items-center gap-2">
          <Lock className="w-5 h-5 text-emerald-500" />
          <span>{tDict.privacyTitle}</span>
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
          {tDict.privacyDesc}
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">Private Connection Account</span>
              <span className="text-[10px] text-zinc-400 mt-0.5 block leading-relaxed">Only followers you approve can view your full technical logs, posts, and short audio waveforms.</span>
            </div>
            <input
              id="privacy-account-toggle"
              type="checkbox"
              checked={isPrivate}
              onChange={() => setIsPrivate(!isPrivate)}
              className="w-4 h-4 accent-purple-500"
            />
          </div>

          <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/40 pt-4">
            <div>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">Read Receipts Sync</span>
              <span className="text-[10px] text-zinc-400 mt-0.5 block leading-relaxed">Allow others to see when you read their text messages or play their audio voice recordings.</span>
            </div>
            <input
              id="privacy-receipts-toggle"
              type="checkbox"
              checked={readReceipts}
              onChange={() => setReadReceipts(!readReceipts)}
              className="w-4 h-4 accent-purple-500"
            />
          </div>
        </div>
      </div>

      {/* 9. RESET PASSWORD SIMULATION */}
      <div className={`p-5 rounded-3xl border ${containerStyle}`}>
        <h3 className="font-display font-bold text-base text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-amber-500" />
          <span>Security & Password Reset</span>
        </h3>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              id="security-oldpass-input"
              type="password"
              placeholder="Current Password"
              value={oldPass}
              onChange={e => setOldPass(e.target.value)}
              className={inputStyle}
            />
            <input
              id="security-newpass-input"
              type="password"
              placeholder="New Premium Password"
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
              className={inputStyle}
            />
          </div>

          <button
            id="btn-security-submit"
            type="submit"
            disabled={!oldPass || !newPass}
            className="px-5 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-semibold disabled:opacity-30"
          >
            Update Password Keys
          </button>

          {resetSuccess && (
            <p className="text-xs text-emerald-500 font-bold animate-pulse">✓ Password reset key compiled successfully! Verified securely.</p>
          )}
        </form>
      </div>

    </div>
  );
}
