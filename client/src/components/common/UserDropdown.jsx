import { hasActiveSubscription } from '../../utils/format';

function getPlanLabel(user) {
  if (hasActiveSubscription(user)) {
    return `Cosmic Plan active until ${new Date(user.subscriptionExpiry).toLocaleDateString('en-IN')}`;
  }

  if ((user?.chatCredits || 0) > 0) {
    return `${user.chatCredits} message credits available`;
  }

  return 'Free plan with 5 free messages';
}

function ActionRow({ icon, label, sublabel, onClick, tone = 'neutral' }) {
  const toneClass = tone === 'primary'
    ? 'bg-primary text-on-primary border-primary/20 shadow-lg shadow-primary/20'
    : 'bg-surface text-on-surface border-outline-variant/15 hover:bg-surface-container-low';

  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-all ${toneClass}`}>
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${tone === 'primary' ? 'bg-white/10' : 'bg-[#f6f0e3] text-primary'}`}>
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <span className={`block text-sm font-semibold ${tone === 'primary' ? 'text-on-primary' : 'text-on-surface'}`}>{label}</span>
        {sublabel ? <span className={`block text-xs mt-0.5 ${tone === 'primary' ? 'text-white/70' : 'text-on-surface-variant'}`}>{sublabel}</span> : null}
      </div>
      <span className={`material-symbols-outlined text-[18px] ${tone === 'primary' ? 'text-on-primary' : 'text-on-surface-variant'}`}>chevron_right</span>
    </button>
  );
}

export default function UserDropdown({ user, onLogout, onClose, onPlanClick, onOpenPricing }) {
  const canUpgrade = !hasActiveSubscription(user);

  return (
    <div className="w-80 overflow-hidden rounded-[30px] border border-outline-variant/10 bg-surface-container-lowest shadow-[0_24px_60px_rgba(27,28,26,0.14)]">
      <div className="px-5 py-5 bg-gradient-to-br from-white via-[#fbf7ee] to-[#f1e3c7] border-b border-outline-variant/10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-white/75 border border-primary/10 flex items-center justify-center text-primary shadow-sm shrink-0">
            <span className="material-symbols-outlined">person</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-headline text-2xl text-primary truncate">{user?.name}</p>
            <p className="text-sm text-on-surface-variant break-all">{user?.email}</p>
          </div>
        </div>
        <div className="mt-4 rounded-2xl bg-secondary-fixed px-4 py-3 text-sm font-bold text-on-secondary-fixed">
          {getPlanLabel(user)}
        </div>
      </div>

      <div className="p-4 space-y-3 bg-white/90">
        <ActionRow icon="workspace_premium" label="View Current Plan" sublabel="See your included features" onClick={onPlanClick} />
        {canUpgrade ? <ActionRow icon="north_east" label="Upgrade Plan" sublabel="Unlock Pro benefits" onClick={onOpenPricing} tone="primary" /> : null}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button onClick={onClose} className="rounded-2xl border border-outline-variant/15 px-4 py-3 text-sm font-medium text-on-surface hover:bg-surface-container-low transition-colors">Close</button>
          <button onClick={onLogout} className="rounded-2xl bg-[#8e6a18] px-4 py-3 text-sm font-bold text-white hover:brightness-105 transition-all">Sign Out</button>
        </div>
      </div>
    </div>
  );
}
