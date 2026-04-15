import { hasActiveSubscription } from '../../utils/format';

function getPlanConfig(user) {
  if (hasActiveSubscription(user)) {
    return {
      title: 'Cosmic Plan',
      subtitle: `Active until ${new Date(user.subscriptionExpiry).toLocaleDateString('en-IN')}`,
      features: [
        { label: 'Unlimited chat messages for 30 days', included: true },
        { label: 'Full astrology report generation', included: true },
        { label: 'Follow-up chat replies', included: true },
        { label: 'PDF report download', included: true },
        { label: 'Priority AI chatbot access', included: true }
      ],
      canUpgrade: false
    };
  }

  if ((user?.chatCredits || 0) > 0) {
    return {
      title: 'Basic Plan',
      subtitle: `${user.chatCredits} message credits available`,
      features: [
        { label: '10 paid chat messages', included: true },
        { label: 'Full astrology report generation', included: true },
        { label: 'Follow-up chat replies', included: true },
        { label: 'PDF report download', included: false },
        { label: 'Unlimited monthly access', included: false }
      ],
      canUpgrade: true,
      upgradeLabel: 'Upgrade to Pro'
    };
  }

  return {
    title: 'Free Plan',
    subtitle: '5 free messages per chat session',
    features: [
      { label: '5 free chat messages', included: true },
      { label: 'Full astrology report generation', included: true },
      { label: 'Follow-up chat replies', included: true },
      { label: 'PDF report download', included: false },
      { label: 'Unlimited monthly access', included: false }
    ],
    canUpgrade: true,
    upgradeLabel: 'View Upgrade Plans'
  };
}

export default function PlanDetailsModal({ open, user, onClose, onOpenPricing }) {
  if (!open) return null;

  const plan = getPlanConfig(user);

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-xl rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-7 shadow-[0_24px_60px_rgba(27,28,26,0.12)]">
        <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors" aria-label="Close plan details">
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="mb-5 pr-12">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary mb-2">Current Plan</p>
          <h2 className="font-headline text-3xl text-on-surface mb-1">{plan.title}</h2>
          <p className="text-sm text-on-surface-variant">{plan.subtitle}</p>
        </div>
        <section className="rounded-2xl bg-surface p-4 border border-outline-variant/10">
          <div className="grid gap-3 sm:grid-cols-2">
            {plan.features.map((feature) => (
              <div key={feature.label} className="flex items-start gap-3 rounded-xl border border-outline-variant/8 bg-surface-container-low/40 px-4 py-3 text-sm min-h-[76px]">
                <span className={`material-symbols-outlined text-[18px] mt-0.5 shrink-0 ${feature.included ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {feature.included ? 'check_circle' : 'cancel'}
                </span>
                <span className={`${feature.included ? 'text-on-surface' : 'text-on-surface-variant'} leading-relaxed`}>{feature.label}</span>
              </div>
            ))}
          </div>
        </section>
        {plan.canUpgrade ? (
          <div className="mt-5 flex justify-end">
            <button onClick={() => { onClose(); onOpenPricing?.(); }} className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
              {plan.upgradeLabel}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
