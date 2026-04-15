import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createOrderRequest, verifyPaymentRequest } from '../../api/payment';

export default function PricingModal({ open, onClose, onPaymentSuccess }) {
  const [errorMessage, setErrorMessage] = useState('');
  const [loadingPlan, setLoadingPlan] = useState('');
  const isAuthenticated = Boolean(localStorage.getItem('astroai_token'));

  useEffect(() => {
    if (!open) {
      setErrorMessage('');
      setLoadingPlan('');
    }
  }, [open]);

  if (!open) return null;

  async function handlePlan(planType) {
    if (!isAuthenticated) {
      setErrorMessage('Please register or log in before purchasing a plan.');
      return;
    }

    if (!window.Razorpay) {
      setErrorMessage('Razorpay checkout failed to load. Refresh the page and try again.');
      return;
    }

    setErrorMessage('');
    setLoadingPlan(planType);

    try {
      const { data } = await createOrderRequest(planType);
      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'AstroAI',
        description: planType === 'credits_49' ? '10 message credits' : '30-day unlimited subscription',
        order_id: data.order.id,
        handler: async (response) => {
          try {
            const verification = await verifyPaymentRequest({
              paymentId: data.paymentId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            await onPaymentSuccess?.(verification.data.user);
            onClose();
          } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Payment was captured, but verification failed. Please contact support before retrying.');
          } finally {
            setLoadingPlan('');
          }
        },
        modal: {
          ondismiss: () => setLoadingPlan('')
        },
        theme: { color: '#775a19' }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error('Payment flow start failed:', error);
      setErrorMessage(error.response?.data?.message || error.message || 'We could not start the payment flow. Please try again.');
      setLoadingPlan('');
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-surface rounded-xl max-w-4xl w-full max-h-[921px] overflow-y-auto shadow-2xl flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-surface-container transition-colors z-20"><span className="material-symbols-outlined">close</span></button>
        <div className="w-full md:w-1/3 bg-surface-container-low p-10 border-r border-outline-variant/10">
          <h2 className="font-headline text-3xl mb-6 text-primary">Join the Cosmos</h2>
          <p className="text-on-surface-variant text-sm leading-relaxed mb-8 italic">"The stars only lean, they do not push. Let AI help you read the leaning."</p>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 text-xs font-medium text-on-surface"><span className="material-symbols-outlined text-primary text-sm">check_circle</span>No Recurring Fees</li>
            <li className="flex items-center gap-3 text-xs font-medium text-on-surface"><span className="material-symbols-outlined text-primary text-sm">check_circle</span>Privacy First Analytics</li>
            <li className="flex items-center gap-3 text-xs font-medium text-on-surface"><span className="material-symbols-outlined text-primary text-sm">check_circle</span>Downloadable PDF Reports</li>
          </ul>
          {!isAuthenticated ? (
            <div className="mt-6 flex flex-col gap-3">
              <p className="text-xs text-on-surface-variant">Create your account first, then come back to choose a plan.</p>
              <div className="flex gap-3">
                <Link to="/login" onClick={onClose} className="rounded-full border border-primary/20 px-4 py-2 text-xs font-bold text-primary">Login</Link>
                <Link to="/register" onClick={onClose} className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-on-primary">Register</Link>
              </div>
            </div>
          ) : null}
          {errorMessage ? <p className="mt-6 rounded-2xl bg-error-container px-4 py-3 text-xs text-on-error-container">{errorMessage}</p> : null}
        </div>
        <div className="flex-1 p-10 grid grid-cols-1 md:grid-cols-2 gap-8 bg-surface">
          <div className="rounded-xl border border-outline-variant/30 p-8 flex flex-col hover:border-primary/40 transition-colors group">
            <div className="mb-6"><h4 className="text-xs tracking-widest uppercase font-bold text-on-surface-variant mb-2">Basic</h4><div className="flex items-baseline gap-1"><span className="text-3xl font-headline">Rs.49</span><span className="text-xs text-on-surface-variant">/ 10 Messages</span></div></div>
            <ul className="space-y-4 mb-10 flex-1">
              <li className="text-xs flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/30"></span> Full Natal Chart</li>
              <li className="text-xs flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/30"></span> Personalized Yogas</li>
              <li className="text-xs flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/30"></span> Deducts One Credit Per Message</li>
            </ul>
            <button disabled={!isAuthenticated || loadingPlan === 'credits_49'} onClick={() => handlePlan('credits_49')} className="w-full py-3 rounded-lg border border-primary text-primary font-bold text-sm group-hover:bg-primary group-hover:text-white transition-all disabled:opacity-60">{loadingPlan === 'credits_49' ? 'Starting...' : 'Get Reading'}</button>
          </div>
          <div className="rounded-xl border-2 border-primary/40 p-8 flex flex-col bg-primary-fixed relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-primary text-on-primary text-[10px] px-3 py-1 font-bold rounded-bl-lg">POPULAR</div>
            <div className="mb-6"><h4 className="text-xs tracking-widest uppercase font-bold text-on-primary-fixed mb-2">Pro Plan</h4><div className="flex items-baseline gap-1"><span className="text-3xl font-headline text-on-primary-fixed">Rs.299</span><span className="text-xs text-on-primary-fixed-variant">/ 30 Days</span></div></div>
            <ul className="space-y-4 mb-10 flex-1">
              <li className="text-xs font-semibold flex items-center gap-2 text-on-primary-fixed"><span className="material-symbols-outlined text-[14px]">star</span> Unlimited Chat Access</li>
              <li className="text-xs font-semibold flex items-center gap-2 text-on-primary-fixed"><span className="material-symbols-outlined text-[14px]">star</span> Priority AI Chatbot Access</li>
              <li className="text-xs font-semibold flex items-center gap-2 text-on-primary-fixed"><span className="material-symbols-outlined text-[14px]">star</span> Downloadable PDF Reports</li>
              <li className="text-xs font-semibold flex items-center gap-2 text-on-primary-fixed"><span className="material-symbols-outlined text-[14px]">star</span> 30 Day Cosmic Subscription</li>
            </ul>
            <button disabled={!isAuthenticated || loadingPlan === 'subscription_299'} onClick={() => handlePlan('subscription_299')} className="w-full py-4 rounded-lg bg-primary text-on-primary font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform disabled:opacity-60">{loadingPlan === 'subscription_299' ? 'Starting...' : 'Unlock All Wisdom'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
