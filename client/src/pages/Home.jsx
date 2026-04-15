import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlanDetailsModal from '../components/common/PlanDetailsModal';
import PricingModal from '../components/common/PricingModal';
import UserDropdown from '../components/common/UserDropdown';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import { hasActiveSubscription } from '../utils/format';

function getPlanMeta(user, isAuthenticated) {
  if (!isAuthenticated) return { label: '5 Free Messages', isPaidUser: false, isTopPlan: false };
  if (hasActiveSubscription(user)) return { label: 'Cosmic Plan', isPaidUser: true, isTopPlan: true };
  if ((user?.chatCredits || 0) > 0) return { label: `${user.chatCredits} Credits`, isPaidUser: true, isTopPlan: false };
  return { label: 'Free Plan', isPaidUser: false, isTopPlan: false };
}

export default function Home() {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser, logout } = useAuth();
  const [showPricing, setShowPricing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPlanDetails, setShowPlanDetails] = useState(false);

  const planMeta = getPlanMeta(user, isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      const timer = window.setTimeout(() => setShowPricing(true), 300);
      return () => window.clearTimeout(timer);
    }
  }, [isAuthenticated]);

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container">
      <div className="fixed inset-0 grain-overlay z-[100]"></div>
      <Navbar mode="home" isAuthenticated={isAuthenticated} isPaidUser={planMeta.isPaidUser} isTopPlan={planMeta.isTopPlan} planLabel={planMeta.label} onOpenPricing={() => !planMeta.isTopPlan && setShowPricing(true)} onAvatarClick={() => setShowDropdown((current) => !current)} onPlanClick={() => isAuthenticated && setShowPlanDetails(true)} />
      {showDropdown ? <div className="fixed right-8 top-[4.75rem] z-[140]"><UserDropdown user={user} onPlanClick={() => setShowPlanDetails(true)} onOpenPricing={() => setShowPricing(true)} onClose={() => setShowDropdown(false)} onLogout={() => { logout(); navigate('/'); }} /></div> : null}
      <main className="relative">
        <section className="relative min-h-[720px] flex items-start justify-center px-6 pt-24 pb-16 overflow-hidden hero-gradient">
          <div className="max-w-5xl mx-auto text-center z-10">
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-medium tracking-widest uppercase">
              <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
              The Future of Vedic Wisdom
            </div>
            <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl text-on-surface leading-[1.1] mb-8 tracking-tight">
              Unlock Your Destiny <br />
              <span className="italic text-primary">with AI Vedic Astrology</span>
            </h1>
            <p className="max-w-2xl mx-auto text-on-surface-variant text-lg md:text-xl font-light mb-12 leading-relaxed">
              Ancient cosmic insights meet cutting-edge artificial intelligence. Discover your soul's blueprint through precise planetary calculations.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button onClick={() => navigate(isAuthenticated ? '/charts' : '/register')} className="w-full sm:w-auto px-10 py-5 bg-primary text-on-primary rounded-xl font-medium text-lg shadow-xl shadow-primary/25 hover:translate-y-[-2px] transition-all">{isAuthenticated ? 'Open My Readings' : 'Begin Your Free Reading'}</button>
              <button onClick={() => navigate('/charts')} className="w-full sm:w-auto px-10 py-5 bg-surface-container-lowest text-primary border border-outline-variant/15 rounded-xl font-medium text-lg hover:bg-surface-container-low transition-all">{isAuthenticated ? 'Continue Chatting' : 'Explore Sample Chat'}</button>
            </div>
          </div>
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl"></div>
        </section>
        <section id="features" className="py-24 px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 bg-surface-container-low rounded-xl p-10 grid md:grid-cols-[minmax(0,1fr)_320px] gap-8 overflow-hidden relative group items-stretch">
              <div className="max-w-md z-10 pr-4">
                <span className="material-symbols-outlined text-secondary text-4xl mb-6">brightness_5</span>
                <h3 className="font-headline text-3xl mb-4 text-on-surface">Daily Ritual Horoscope</h3>
                <p className="text-on-surface-variant leading-relaxed mb-8">AI-tuned personalized transits based on your exact birth nakshatra. Updated every dawn.</p>
                <a className="inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-4 transition-all" href="#">Check Today's Transit <span className="material-symbols-outlined">arrow_forward</span></a>
              </div>
              <div className="relative h-full min-h-[280px] rounded-xl overflow-hidden opacity-20 group-hover:opacity-40 transition-opacity">
                <img className="object-cover h-full w-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrS4p4QYGqIUu4c7HizEVBEfjVrasFUutlKNJUROpe8ewot60IGLk-T9fKRlTGD3EaRCXc5LED-rt56Y4_XyquHcnNk79czmVCaQB1L_i2R6yA0Xr0nDC-cMiQOZ7UfAi2lnTCzpP2GwaRQ9Fjfm_g211_Snawf1vLaka5U4kZaKeoEXgPTF9Kzm4G7kW52HGdRatKSemWzKMf5V3_KKyR5Hso95qikZLzvJec3dixVf-v_56rDWawW8LyfVKol-BRlWyU0xyMAfc" alt="Celestial clock" />
              </div>
            </div>
            <div className="md:col-span-4 bg-surface-container-highest rounded-xl p-10 flex flex-col border-l-4 border-secondary">
              <span className="material-symbols-outlined text-secondary text-4xl mb-6">favorite</span>
              <h3 className="font-headline text-2xl mb-4">Koota Analysis</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-8">Detailed 8-point compatibility matching for relationships and business partnerships.</p>
              <div className="mt-auto pt-6 border-t border-outline-variant/20"><div className="flex -space-x-4"><div className="w-10 h-10 rounded-full border-2 border-surface bg-slate-200"></div><div className="w-10 h-10 rounded-full border-2 border-surface bg-amber-100 flex items-center justify-center text-[10px] font-bold">VS</div><div className="w-10 h-10 rounded-full border-2 border-surface bg-slate-300"></div></div></div>
            </div>
            <div className="md:col-span-4 bg-white rounded-xl p-8 border border-outline-variant/10 shadow-sm"><span className="material-symbols-outlined text-primary text-4xl mb-6">grid_view</span><h3 className="font-headline text-2xl mb-4">D-1 Kundli</h3><p className="text-on-surface-variant text-sm leading-relaxed">High-precision Natal Charts with exhaustive Dashas, Ashtakavarga, and Divisional charts (D-9, D-10).</p></div>
            <div className="md:col-span-8 bg-surface-container-low rounded-xl p-10 flex flex-col md:flex-row items-center gap-8"><div className="flex-1"><span className="material-symbols-outlined text-primary text-4xl mb-6">front_hand</span><h3 className="font-headline text-3xl mb-4">Palmistry AI Scan</h3><p className="text-on-surface-variant leading-relaxed mb-6">Upload a photo of your palm. Our neural network analyzes lines of life, heart, and head using ancient Vedic palmistry parameters.</p><button onClick={() => navigate(isAuthenticated ? '/charts' : '/register')} className="text-primary font-bold underline underline-offset-8">Try Photo Scan</button></div><div className="w-full md:w-64 h-48 rounded-lg overflow-hidden shrink-0"><img className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaCK3p5e9Dmog5AIOyIovKxTS8HifseRA-QG75HCf48Op3jvWbb8C8YffNkV4euBPV4rda9wl3PFB6KSkiFUcNHZOsYgxIDLIVQKzFWNna8AQEdJi7UHqnWyV_B9nYqCnNMwv99bMj9zS5xYPFWEy2GPWZ_i0LkZuPCpPzghwK6xwBiqw37Sbv6DTuCKdQ62o-S5nVM5BhW9ArBuTsjtLl3h9rEaUgafu4m_W6iB3_nskC_yxm407VhzLpfCJWkOi7dvnSGiBWqp0" alt="Palmistry" /></div></div>
          </div>
        </section>
        <footer className="bg-surface-container-low pt-20 pb-12 px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div><span className="text-2xl font-serif tracking-tighter text-primary mb-6 block">AstroAI</span><p className="text-sm text-on-surface-variant leading-relaxed">Synthesizing 5,000 years of Vedic tradition with modern computational intelligence.</p></div>
            <div><h5 className="font-bold text-xs uppercase tracking-widest mb-6">Wisdom</h5><ul className="space-y-4 text-sm text-on-surface-variant"><li><a className="hover:text-primary" href="#">Birth Chart Analysis</a></li><li><a className="hover:text-primary" href="#">Career Forecasting</a></li><li><a className="hover:text-primary" href="#">Marriage Matching</a></li></ul></div>
            <div><h5 className="font-bold text-xs uppercase tracking-widest mb-6">Platform</h5><ul className="space-y-4 text-sm text-on-surface-variant">{!planMeta.isTopPlan ? <li><button id="pricing" onClick={() => setShowPricing(true)} className="hover:text-primary">Pricing</button></li> : null}<li><a className="hover:text-primary" href="#">API for Astrologers</a></li><li><a className="hover:text-primary" href="#">Support</a></li></ul></div>
            <div><h5 className="font-bold text-xs uppercase tracking-widest mb-6">Celestial Newsletter</h5><div className="flex"><input className="bg-surface border-none outline-none px-4 py-2 text-sm w-full rounded-l-lg focus:ring-1 focus:ring-primary" placeholder="Email Address" type="email" /><button className="bg-primary text-on-primary px-4 py-2 rounded-r-lg"><span className="material-symbols-outlined text-sm">send</span></button></div></div>
          </div>
          <div className="max-w-7xl mx-auto pt-12 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-6"><p className="text-[10px] text-on-surface-variant font-medium tracking-wider">© 2024 ASTROAI. DESIGNED FOR THE MODERN SPIRIT.</p><div className="flex gap-8 text-[10px] font-bold text-on-surface/40"><a className="hover:text-primary transition-colors" href="#">PRIVACY POLICY</a><a className="hover:text-primary transition-colors" href="#">TERMS OF DIVINATION</a></div></div>
        </footer>
      </main>
      <PlanDetailsModal open={showPlanDetails} user={user} onClose={() => setShowPlanDetails(false)} onOpenPricing={() => setShowPricing(true)} />
      {!planMeta.isTopPlan ? <PricingModal open={showPricing} onClose={() => setShowPricing(false)} onPaymentSuccess={updateUser} /> : null}
    </div>
  );
}





