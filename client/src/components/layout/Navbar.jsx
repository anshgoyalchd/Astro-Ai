import clsx from 'clsx';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ mode = 'home', isAuthenticated, isTopPlan, planLabel, onOpenPricing, onAvatarClick, onPlanClick }) {
  const location = useLocation();
  const linkBaseClass = 'inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-all duration-300';
  const navPillClass = 'hidden md:flex items-center gap-2 rounded-full border border-[#775a19]/10 bg-white/70 p-1 shadow-sm shadow-[#1b1c1a]/5';

  const chatLinkClass = clsx(
    linkBaseClass,
    location.pathname === '/chats' || location.pathname === '/chat'
      ? 'bg-[#775a19] text-white shadow-md shadow-[#775a19]/20'
      : 'text-[#1b1c1a]/70 hover:bg-[#775a19]/6 hover:text-[#775a19]'
  );

  const pricingLinkClass = clsx(linkBaseClass, 'text-[#1b1c1a]/70 hover:bg-[#775a19]/6 hover:text-[#775a19]');

  const navLinks = (
    <div className={navPillClass}>
      <Link className={chatLinkClass} to="/chats">
        <span className="material-symbols-outlined text-[16px] mr-2">chat_bubble</span>
        My Chats
      </Link>
      {!isTopPlan ? (
        <button type="button" onClick={onOpenPricing} className={pricingLinkClass}>
          <span className="material-symbols-outlined text-[16px] mr-2">workspace_premium</span>
          Pricing
        </button>
      ) : null}
    </div>
  );

  const authActions = isAuthenticated ? (
    <div className="flex items-center gap-3 shrink-0">
      <button
        type="button"
        onClick={onPlanClick}
        className={clsx(
          'rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] transition-all',
          isTopPlan
            ? 'border-primary/10 bg-primary/10 text-primary hover:bg-primary/15'
            : 'border-primary/10 bg-white/80 text-primary hover:bg-primary/5'
        )}
      >
        {planLabel}
      </button>
      <button
        type="button"
        onClick={onAvatarClick}
        className={clsx(
          mode === 'report' ? 'w-9 h-9 bg-surface-container-high' : 'w-10 h-10 border-2 border-primary/20 bg-white/70',
          'rounded-full flex items-center justify-center shadow-sm shadow-[#1b1c1a]/5 overflow-hidden'
        )}
      >
        <span className="material-symbols-outlined text-sm">person</span>
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-3 shrink-0">
      <div className="hidden lg:block rounded-full border border-primary/15 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-primary">5 Free Messages</div>
      <Link to="/login" className="font-['Noto_Serif'] text-sm tracking-wide text-[#775a19] border border-[#775a19]/20 px-6 py-2 rounded-full hover:bg-primary/5 transition-all">Login</Link>
      <Link to="/register" className="bg-primary text-white font-['Noto_Serif'] text-sm tracking-wide px-6 py-2.5 rounded-full shadow-lg shadow-primary/20 active:scale-95 transition-all">Register</Link>
    </div>
  );

  if (mode === 'home') {
    return (
      <nav className="sticky top-0 z-50 bg-[#fbf9f5]/80 backdrop-blur-md flex justify-between items-center gap-6 px-8 py-4 max-w-full shadow-sm shadow-[#1b1c1a]/5">
        <div className="flex items-center gap-6 min-w-0">
          <Link className="text-2xl font-serif tracking-tighter text-[#775a19] shrink-0" to="/">AstroAI</Link>
          {navLinks}
        </div>
        {authActions}
      </nav>
    );
  }

  return (
    <header className="bg-[#fbf9f5]/80 backdrop-blur-md sticky top-0 z-50 flex justify-between items-center gap-6 px-8 py-4 max-w-full shadow-sm shadow-[#1b1c1a]/5">
      <div className="flex items-center gap-6 min-w-0">
        <Link className="text-2xl font-serif tracking-tighter text-[#775a19] shrink-0" to="/">AstroAI</Link>
        {navLinks}
      </div>
      {authActions}
    </header>
  );
}
