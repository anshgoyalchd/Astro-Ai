import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { downloadReportRequest, getChatRequest } from '../api/chat';
import PlanDetailsModal from '../components/common/PlanDetailsModal';
import PricingModal from '../components/common/PricingModal';
import UserDropdown from '../components/common/UserDropdown';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import { hasActiveSubscription, openBlob } from '../utils/format';

function getPlanMeta(user) {
  if (hasActiveSubscription(user)) return { label: 'Cosmic Plan', isPaidUser: true, isTopPlan: true };
  if ((user?.chatCredits || 0) > 0) return { label: `${user.chatCredits} Credits`, isPaidUser: true, isTopPlan: false };
  return { label: 'Free Plan', isPaidUser: false, isTopPlan: false };
}

export default function Report() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPricing, setShowPricing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPlanDetails, setShowPlanDetails] = useState(false);

  const planMeta = getPlanMeta(user);

  useEffect(() => {
    loadReport();
  }, [chatId]);

  async function loadReport() {
    setLoading(true);
    setErrorMessage('');
    try {
      const { data } = await getChatRequest(chatId);
      setChat(data.chat);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'We could not load this report.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    setDownloading(true);
    setErrorMessage('');
    try {
      const { data } = await downloadReportRequest(chatId);
      openBlob(data, `astroai-report-${chatId}.pdf`);
    } catch (error) {
      if (error.response?.status === 403 && !planMeta.isPaidUser) {
        setShowPricing(true);
        setErrorMessage(error.response.data.message || 'Upgrade to download the PDF report.');
      } else {
        setErrorMessage(error.response?.data?.message || 'The PDF could not be downloaded.');
      }
    } finally {
      setDownloading(false);
    }
  }

  async function refreshAfterPayment(userPatch) {
    updateUser(userPatch);
    setShowPricing(false);
    await loadReport();
  }

  const report = chat?.report || {};

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <div className="grain-overlay fixed inset-0 z-[100]"></div>
      <Navbar mode="report" isAuthenticated={true} isPaidUser={planMeta.isPaidUser} isTopPlan={planMeta.isTopPlan} planLabel={planMeta.label} onOpenPricing={() => !planMeta.isTopPlan && setShowPricing(true)} onAvatarClick={() => setShowDropdown((current) => !current)} onPlanClick={() => setShowPlanDetails(true)} />
      {showDropdown ? <div className="fixed right-8 top-[4.75rem] z-[140]"><UserDropdown user={user} onPlanClick={() => setShowPlanDetails(true)} onOpenPricing={() => setShowPricing(true)} onClose={() => setShowDropdown(false)} onLogout={() => { logout(); navigate('/'); }} /></div> : null}
      <main className="max-w-6xl mx-auto px-6 py-8 lg:py-12 relative">
        <header className="text-center mb-14 lg:mb-16 relative">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-primary/5 blur-3xl rounded-full"></div>
          <p className="font-label text-primary tracking-[0.2em] mb-3 text-xs font-semibold uppercase">Celestial Morning Report</p>
          <h1 className="text-4xl lg:text-6xl font-headline text-on-surface mb-4 tracking-tight leading-none">{report.title || 'The Radiance of Self'}</h1>
          <div className="flex flex-col items-center gap-4 max-w-3xl mx-auto">
            <p className="text-on-surface-variant text-base lg:text-lg leading-relaxed italic">{report.subtitle || 'A profound alignment is being prepared for your profile.'}</p>
            <button disabled={downloading || loading} onClick={handleDownload} className="group inline-flex items-center gap-3 px-7 py-3.5 bg-primary text-on-primary rounded-xl font-label font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-60"><span className="material-symbols-outlined">download_for_offline</span>{downloading ? 'Preparing PDF...' : 'Download PDF Report'}</button>
          </div>
        </header>

        {errorMessage ? <div className="mb-6 rounded-2xl bg-error-container px-6 py-4 text-sm text-on-error-container">{errorMessage}</div> : null}
        {loading ? <div className="rounded-2xl bg-surface-container-low px-8 py-12 text-center text-on-surface/60">Loading your celestial report...</div> : null}

        {!loading ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              <section className="md:col-span-8 bg-surface-container-lowest p-7 lg:p-10 rounded-xl border border-outline-variant/15 shadow-[0_20px_40px_rgba(27,28,26,0.03)] relative overflow-hidden group self-stretch"><div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity"><span className="material-symbols-outlined text-7xl" style={{ fontVariationSettings: "'FILL' 1" }}>brightness_7</span></div><div className="flex items-center gap-3 mb-6"><span className="material-symbols-outlined text-primary">psychology</span><h2 className="text-2xl font-headline">Core Personality</h2></div><div className="space-y-5 max-w-2xl"><p className="text-on-surface leading-loose text-lg">{report.overview}</p><p className="text-on-surface-variant leading-loose">{report.corePersonality?.summary}</p></div><div className="mt-8 pt-8 border-t border-outline-variant/10 flex flex-wrap gap-3">{(report.corePersonality?.tags || []).map((tag) => <span key={tag} className="px-4 py-2 bg-secondary-fixed text-on-secondary-fixed text-xs font-bold rounded-full tracking-wide">{tag}</span>)}</div></section>
              <section className="md:col-span-4 bg-surface-container-low p-7 rounded-xl border-l-2 border-secondary shadow-sm flex flex-col gap-8 self-stretch"><div><div className="flex items-center gap-3 mb-6"><span className="material-symbols-outlined text-secondary">favorite</span><h2 className="text-2xl font-headline">Love &amp; Connection</h2></div><div className="space-y-5"><p className="text-on-surface leading-relaxed">{report.loveConnection?.summary}</p><p className="text-on-surface-variant text-sm italic">"{report.loveConnection?.quote}"</p></div></div><div className="mt-auto"><div className="p-4 bg-surface-container-lowest rounded-lg border border-outline-variant/15 flex items-center gap-4"><div className="w-12 h-12 rounded-full overflow-hidden shrink-0"><img alt="Celestial profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPMoxhKqxV5nnEmMsA_VzduM1PpWJDY3DrJ3jZujwKvTmiNqIN8QmB7wioEO9_vBRjhsInIiaCxPgr3b6gO71idLGUg2Kox0-pFNKrD3Zo4CZS3DmiAaUxqIikukjpb8vjFLORjnshigachbE8My9hi5j2tFb0Qzsre-wRVL7nhbU4ArHANYsiOklOXOm2vNPRV9afTqZP-w9Sh30fdmlcixHn1zYQlOj7CpQhKH_lVOwWrJY6knffwMZSWWPEqBN0aif0XOIGaWk" /></div><div><p className="text-xs font-bold text-secondary tracking-widest uppercase">{report.loveConnection?.alertTitle || 'Transit Alert'}</p><p className="text-sm font-semibold leading-snug">{report.loveConnection?.alertBody}</p></div></div></div></section>
              <section className="md:col-span-6 bg-surface-container-lowest p-7 lg:p-9 rounded-xl border border-outline-variant/15 shadow-sm relative overflow-hidden self-stretch"><div className="flex items-center gap-3 mb-6"><span className="material-symbols-outlined text-primary">account_balance_wallet</span><h2 className="text-2xl font-headline">Career &amp; Abundance</h2></div><div className="grid grid-cols-1 gap-5 h-full content-start"><div className="bg-surface-container-low/50 p-5 rounded-lg"><h3 className="font-headline text-lg mb-2">The Saturn Return Echo</h3><p className="text-on-surface-variant text-sm leading-relaxed">{report.careerAbundance?.summary}</p></div><div className="flex items-center justify-between p-4 border border-outline-variant/15 rounded-lg"><span className="font-label text-sm font-bold">Financial Flux</span><div className="flex gap-1">{Array.from({ length: 4 }).map((_, index) => <div key={index} className={`w-2 h-6 rounded-full ${index < (report.careerAbundance?.financialFlux || 2) ? 'bg-primary' : 'bg-primary/10'}`}></div>)}</div></div></div></section>
              <section className="md:col-span-6 bg-surface-container-lowest p-7 lg:p-9 rounded-xl border border-outline-variant/15 shadow-sm overflow-hidden self-stretch"><div className="flex items-center gap-3 mb-6"><span className="material-symbols-outlined text-secondary">self_improvement</span><h2 className="text-2xl font-headline">Health &amp; Ritual</h2></div><div className="flex flex-col lg:flex-row gap-6 items-stretch"><div className="w-full lg:w-[46%] aspect-square rounded-xl overflow-hidden shadow-inner border border-outline-variant/15"><img alt="Meditation ritual" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSJ87VLxoVhGbVVTRXOCnhTRc_yo4LeLl0S45BdC666uDb4y9f7YJrtxxupI6qY9dacHvEp-1mB4h2qLtIhP1SPKWFUlWTt16dQOV8WsRLH94zbf5tFkqMEGECOqNO5849KLDMaINw9NdeQM_b-wxXEVyOot51OX1OORtvsinPbA_ofiEXkEw2ZAgyL-wksGHHgvJk6BwtGKxd-5G9amBI7DLPXK15Jvr7Wwjebva06h_m8SaKRWpOu-izjsw3f1N3bXjrTBevyYo" /></div><div className="w-full lg:flex-1 space-y-4 self-center"><p className="text-on-surface leading-relaxed font-medium">{report.healthRitual?.summary}</p><ul className="space-y-3">{(report.healthRitual?.rituals || []).map((item) => <li key={item} className="flex items-start gap-2 text-sm text-on-surface-variant"><span className="material-symbols-outlined text-primary text-xs mt-1">check_circle</span>{item}</li>)}</ul></div></div></section>
            </div>
            <section className="mt-16 lg:mt-20"><h2 className="text-3xl font-headline mb-8 text-center">Celestial Timeline</h2><div className="space-y-3">{(report.celestialTimeline || []).map((entry) => <div key={`${entry.date}-${entry.title}`} className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 p-5 bg-surface-container-low rounded-xl group hover:bg-surface-container-high transition-colors"><div className="w-32 shrink-0"><p className="font-bold text-xs tracking-tighter text-on-surface-variant uppercase">{entry.date}</p></div><div className="flex-grow min-w-0"><h4 className="font-headline text-lg">{entry.title}</h4><p className="text-sm text-on-surface-variant leading-relaxed">{entry.description}</p></div><div className="flex gap-2 shrink-0"><span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase">{entry.energy}</span></div></div>)}</div></section>
            <footer className="mt-20 lg:mt-24 text-center pb-12"><div className="max-w-xl mx-auto space-y-6"><div className="w-12 h-px bg-outline-variant/30 mx-auto"></div><p className="font-headline text-3xl italic text-primary/80">"{report.closingQuote}"</p><div className="flex flex-col sm:flex-row justify-center gap-3"><button disabled={downloading} onClick={handleDownload} className="px-8 py-3 bg-primary text-on-primary rounded-lg font-bold shadow-xl shadow-primary/20 hover:translate-y-[-2px] transition-transform disabled:opacity-60">Download Full Report</button><button onClick={() => navigate('/chat')} className="px-8 py-3 border border-outline-variant/30 text-on-surface rounded-lg font-bold hover:bg-surface-container-low transition-colors">Back to Chat</button></div><p className="text-[10px] text-on-surface-variant/40 tracking-widest uppercase mt-8">Calculated by AstroAI Cosmic Engine v4.2</p></div></footer>
          </>
        ) : null}
      </main>
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-surface-container-highest/90 backdrop-blur-xl border border-outline-variant/20 rounded-full px-6 py-4 flex justify-around items-center shadow-2xl z-50"><button onClick={() => navigate('/chat')} className="flex flex-col items-center gap-1 text-[#775a19]"><span className="material-symbols-outlined">chat_bubble</span><span className="text-[10px] font-bold uppercase tracking-tighter">Chat</span></button><button onClick={handleDownload} disabled={downloading} className="flex flex-col items-center gap-1 text-on-surface/60 disabled:opacity-40"><span className="material-symbols-outlined">download</span><span className="text-[10px] font-bold uppercase tracking-tighter">PDF</span></button><button onClick={() => setShowPlanDetails(true)} className="flex flex-col items-center gap-1 text-on-surface/60"><span className="material-symbols-outlined">workspace_premium</span><span className="text-[10px] font-bold uppercase tracking-tighter">Plan</span></button></div>
      <PlanDetailsModal open={showPlanDetails} user={user} onClose={() => setShowPlanDetails(false)} onOpenPricing={() => setShowPricing(true)} />
      {!planMeta.isTopPlan ? <PricingModal open={showPricing} onClose={() => setShowPricing(false)} onPaymentSuccess={refreshAfterPayment} /> : null}
    </div>
  );
}



