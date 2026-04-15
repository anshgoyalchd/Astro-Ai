import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createChatRequest, deleteChatRequest, getChatRequest, listChatsRequest, sendMessageRequest } from '../api/chat';
import { updateAstrologyDataRequest } from '../api/user';
import ChatWindow from '../components/chat/ChatWindow';
import AstrologyFormModal from '../components/common/AstrologyFormModal';
import EmailVerificationCard from '../components/common/EmailVerificationCard';
import PlanDetailsModal from '../components/common/PlanDetailsModal';
import PricingModal from '../components/common/PricingModal';
import UserDropdown from '../components/common/UserDropdown';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';
import { hasActiveSubscription, isAstrologyComplete, remainingLabel } from '../utils/format';

const previewMessages = [
  { role: 'user', content: 'Can you look at my Jupiter transit for the next three months? I am feeling a pull towards a major career shift.', createdAt: new Date().toISOString() },
  { role: 'assistant', content: 'Jupiter in a career-supporting position often opens doors through mentors, new responsibilities, and clearer long-term vision. Register to unlock your personal chart, 5 free messages, and a full AI reading tailored to your birth details.', createdAt: new Date().toISOString() }
];

const previewChats = [
  { _id: 'preview-1', title: 'Daily Ritual' },
  { _id: 'preview-2', title: 'Birth Chart' },
  { _id: 'preview-3', title: 'Transit Map' }
];

function getPlanMeta(user, guestMode) {
  if (guestMode) return { label: '5 Free Messages', isPaidUser: false, isTopPlan: false };
  if (hasActiveSubscription(user)) return { label: 'Cosmic Plan', isPaidUser: true, isTopPlan: true };
  if ((user?.chatCredits || 0) > 0) return { label: `${user.chatCredits} Credits`, isPaidUser: true, isTopPlan: false };
  return { label: 'Free Plan', isPaidUser: false, isTopPlan: false };
}

export default function Chat({ guestMode = false }) {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [limitState, setLimitState] = useState({ plan: 'free', remaining: 5, allowed: false });
  const [message, setMessage] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [sending, setSending] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(!guestMode);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPricing, setShowPricing] = useState(guestMode);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const [showAstrologyForm, setShowAstrologyForm] = useState(!guestMode && !isAstrologyComplete(user?.astrologyData));
  const [showCelestialAlert, setShowCelestialAlert] = useState(true);

  const activeMessages = guestMode ? previewMessages : (selectedChat?.messages || []);
  const sidebarChats = guestMode ? previewChats : chats;
  const planMeta = getPlanMeta(user, guestMode);
  const activeChatId = selectedChat?._id || selectedChatId;
  const canSend = Boolean(!guestMode && activeChatId && message.trim() && limitState.allowed && !sending && !bootstrapping);
  const guestFooterLabel = 'Register to unlock your chart and 5 free messages';

  useEffect(() => {
    if (guestMode) {
      setBootstrapping(false);
      setSelectedChatId('preview-1');
      setSelectedChat({ _id: 'preview-1', messages: previewMessages });
      setLimitState({ plan: 'free', remaining: 5, allowed: false });
      setShowAstrologyForm(false);
      return;
    }

    setShowAstrologyForm(!isAstrologyComplete(user?.astrologyData));
  }, [guestMode, user?.astrologyData]);

  useEffect(() => {
    if (!guestMode) {
      bootstrap();
    }
  }, [guestMode]);

  async function bootstrap() {
    setBootstrapping(true);
    setErrorMessage('');
    try {
      const { data } = await listChatsRequest();
      setChats(data.chats);
      if (data.chats.length > 0) {
        await loadChat(data.chats[0]._id);
      } else {
        setSelectedChat(null);
        setSelectedChatId(null);
        setLimitState({ plan: 'free', remaining: 5, allowed: false });
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'We could not load your chats right now.');
    } finally {
      setBootstrapping(false);
    }
  }

  async function loadChat(chatId) {
    if (guestMode) {
      setShowPricing(true);
      return;
    }

    setSelectedChatId(chatId);
    setErrorMessage('');
    try {
      const { data } = await getChatRequest(chatId);
      setSelectedChat(data.chat);
      setLimitState(data.limitState);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'We could not open that reading.');
    }
  }

  async function handleCreateChat(astrologyDataOverride = user?.astrologyData) {
    const profileForReading = isAstrologyComplete(astrologyDataOverride) ? astrologyDataOverride : user?.astrologyData;
    if (guestMode) {
      setShowPricing(true);
      return;
    }

    if (!isAstrologyComplete(profileForReading)) {
      setShowAstrologyForm(true);
      return;
    }

    setBootstrapping(true);
    setErrorMessage('');
    try {
      const { data } = await createChatRequest({ title: 'New Reading' });
      setChats((current) => {
        const withoutDuplicate = current.filter((chat) => chat._id !== data.chat._id);
        return [data.chat, ...withoutDuplicate];
      });
      await loadChat(data.chat._id);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'We could not create a new reading.');
    } finally {
      setBootstrapping(false);
    }
  }

  async function handleDeleteChat(chatId) {
    if (guestMode || !chatId) return;

    setErrorMessage('');
    try {
      await deleteChatRequest(chatId);
      const remainingChats = chats.filter((chat) => chat._id !== chatId);
      setChats(remainingChats);

      if (selectedChatId === chatId) {
        const nextChat = remainingChats[0] || null;
        if (nextChat) {
          await loadChat(nextChat._id);
        } else {
          setSelectedChat(null);
          setSelectedChatId(null);
          setLimitState({ plan: 'free', remaining: 5, allowed: false });
        }
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'We could not delete that chat.');
    }
  }

  async function handleAstrologySubmit(values) {
    setSavingProfile(true);
    setErrorMessage('');
    try {
      const { data } = await updateAstrologyDataRequest(values);
      updateUser({ astrologyData: data.astrologyData, name: values.fullName });
      setShowAstrologyForm(false);
      if (!selectedChatId) {
        await handleCreateChat(data.astrologyData);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'We could not save your astrology profile.');
    } finally {
      setSavingProfile(false);
    }
  }

  async function refreshAfterPayment(userPatch) {
    updateUser(userPatch);
    setShowPricing(false);
    if (!guestMode && activeChatId) {
      await loadChat(activeChatId);
    }
  }

  async function handleSendMessage(event) {
    event.preventDefault();
    if (guestMode) {
      setShowPricing(true);
      return;
    }

    const activeId = selectedChat?._id || selectedChatId;
    const trimmedMessage = message.trim();

    if (!activeId || !trimmedMessage || sending) return;

    setSending(true);
    setErrorMessage('');
    setMessage('');

    try {
      const { data } = await sendMessageRequest(activeId, trimmedMessage);
      setSelectedChatId(data.chat._id || activeId);
      setSelectedChat(data.chat);
      setLimitState(data.limitState);
      setChats((current) => {
        const updated = current.map((chat) => (chat._id === data.chat._id ? data.chat : chat));
        const selected = updated.find((chat) => chat._id === data.chat._id);
        const remaining = updated.filter((chat) => chat._id !== data.chat._id);
        return selected ? [selected, ...remaining] : updated;
      });
      if (!data.limitState.allowed && !planMeta.isPaidUser) {
        setShowPricing(true);
      }
    } catch (error) {
      setMessage(trimmedMessage);
      if (error.response?.status === 402) {
        if (!planMeta.isPaidUser) {
          setShowPricing(true);
        }
        setLimitState(error.response.data.limitState);
        setErrorMessage('Your current message limit has been reached. Upgrade to continue the conversation.');
      } else {
        setErrorMessage(error.response?.data?.message || 'Your message could not be sent.');
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-surface text-on-surface flex h-screen overflow-hidden">
      <div className="fixed inset-0 grain-overlay z-0"></div>
      <Sidebar chats={sidebarChats} selectedChatId={selectedChatId} onSelectChat={loadChat} onNewChat={handleCreateChat} onDeleteChat={handleDeleteChat} disabled={guestMode} onLockedAction={() => setShowPricing(true)} />
      <main className="flex-1 ml-72 flex flex-col relative bg-surface">
        <Navbar mode="app" isAuthenticated={!guestMode} isPaidUser={planMeta.isPaidUser} isTopPlan={planMeta.isTopPlan} planLabel={planMeta.label} onOpenPricing={() => !planMeta.isTopPlan && setShowPricing(true)} onAvatarClick={() => setShowDropdown((current) => !current)} onPlanClick={() => setShowPlanDetails(true)} />
        {!guestMode && showDropdown ? <div className="fixed right-8 top-[4.75rem] z-[140]"><UserDropdown user={user} onPlanClick={() => setShowPlanDetails(true)} onOpenPricing={() => setShowPricing(true)} onClose={() => setShowDropdown(false)} onLogout={() => { logout(); navigate('/'); }} /></div> : null}
        {!guestMode && user && !user.isEmailVerified ? <div className="px-8 md:px-24 pt-6"><div className="max-w-4xl mx-auto"><EmailVerificationCard /></div></div> : null}
        <ChatWindow messages={activeMessages} onViewReport={() => !guestMode && activeChatId && navigate(`/report/${activeChatId}`)} hasActiveChat={Boolean(activeChatId)} onCreateChat={handleCreateChat} loading={bootstrapping} errorMessage={errorMessage} />
        <footer className="px-8 md:px-24 pb-8 pt-4 bg-gradient-to-t from-surface via-surface to-transparent">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSendMessage} className="relative bg-surface-container-highest rounded-2xl p-2 shadow-lg shadow-on-surface/5 border border-outline-variant/10">
              <div className="flex items-end gap-2 px-4 py-2">
                <textarea value={message} onChange={(event) => setMessage(event.target.value)} onFocus={() => guestMode && setShowPricing(true)} disabled={guestMode || !activeChatId || !limitState.allowed || sending || bootstrapping} className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder-on-surface/40 py-2 resize-none leading-relaxed overflow-hidden disabled:opacity-60" placeholder={guestMode ? 'Register to unlock this chat experience...' : activeChatId ? (limitState.allowed ? 'Ask the cosmos...' : 'Message limit reached. Upgrade to continue.') : 'Start a reading to ask the cosmos...'} rows="1"></textarea>
                <div className="flex items-center gap-2 pb-1">
                  <button type="button" onClick={() => guestMode && setShowPricing(true)} className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"><span className="material-symbols-outlined">attachment</span></button>
                  <button type="submit" disabled={!canSend} className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg hover:scale-105 transition-transform active:scale-95 disabled:opacity-60"><span className="material-symbols-outlined">arrow_upward</span></button>
                </div>
              </div>
              <div className="flex justify-between items-center px-4 py-1 border-t border-outline-variant/10">
                <div className="flex gap-4"><button type="button" onClick={() => guestMode && setShowPricing(true)} className="text-[10px] font-bold text-on-surface/40 uppercase tracking-widest hover:text-primary transition-colors">Palm Reading</button><button type="button" onClick={() => guestMode && setShowPricing(true)} className="text-[10px] font-bold text-on-surface/40 uppercase tracking-widest hover:text-primary transition-colors">Love Synastry</button></div>
                <div className="flex items-center gap-2"><span className="text-[10px] font-bold text-secondary uppercase tracking-widest">{guestMode ? guestFooterLabel : activeChatId ? remainingLabel(limitState) : 'Start a reading to begin'}</span><div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></div></div>
              </div>
            </form>
            <p className="text-center text-[10px] text-on-surface/30 mt-4 tracking-tight">AI interpretations are for spiritual guidance only. Consult your chart for specific alignments.</p>
          </div>
        </footer>
        {showCelestialAlert ? (
          <div className="fixed right-8 bottom-32 flex flex-col gap-3 z-40">
            <div className="bg-surface-container-lowest shadow-xl border border-outline-variant/15 p-4 rounded-2xl w-48 relative">
              <button
                type="button"
                onClick={() => setShowCelestialAlert(false)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
                aria-label="Close celestial alert"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
              <div className="flex items-center gap-2 mb-2 pr-6"><span className="material-symbols-outlined text-primary text-sm">stars</span><span className="text-[10px] font-bold uppercase tracking-widest">Celestial Alert</span></div>
              <p className="text-[11px] leading-tight text-on-surface/70">Mercury is entering Retrograde soon. Prepare your communications.</p>
            </div>
          </div>
        ) : null}
      </main>
      <div className="fixed -top-24 -right-24 w-96 h-96 bg-primary-container/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed top-1/2 -left-24 w-64 h-64 bg-secondary-container/10 rounded-full blur-[100px] pointer-events-none"></div>
      {!guestMode ? <AstrologyFormModal open={showAstrologyForm} onSubmit={handleAstrologySubmit} loading={savingProfile} initialValues={user?.astrologyData} /> : null}
      {!guestMode ? <PlanDetailsModal open={showPlanDetails} user={user} onClose={() => setShowPlanDetails(false)} onOpenPricing={() => setShowPricing(true)} /> : null}
      {!planMeta.isTopPlan ? <PricingModal open={showPricing} onClose={() => setShowPricing(false)} onPaymentSuccess={refreshAfterPayment} /> : null}
    </div>
  );
}



