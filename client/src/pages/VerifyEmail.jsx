import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { resendVerificationRequest, verifyEmailRequest } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const initialEmail = new URLSearchParams(location.search).get('email') || '';
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleVerify(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setErrorMessage('');

    try {
      const { data } = await verifyEmailRequest({ email, otp });
      setSession(data);
      navigate('/chat');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setLoading(true);
    setMessage('');
    setErrorMessage('');

    try {
      const { data } = await resendVerificationRequest({ email });
      setMessage(data.message || 'Verification OTP sent.');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Could not resend OTP right now.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="font-body text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen flex items-center justify-center p-6 overflow-hidden auth-background bg-surface relative">
      <div className="grain-overlay fixed inset-0 z-50"></div>
      <main className="w-full max-w-[440px] relative z-10">
        <div className="bg-surface-container-lowest/80 backdrop-blur-xl rounded-xl p-8 md:p-12 shadow-[0_20px_40px_rgba(27,28,26,0.05)] border border-outline-variant/10">
          <header className="text-center mb-10"><div className="inline-flex items-center justify-center mb-6"><span className="material-symbols-outlined text-primary text-4xl">mark_email_unread</span></div><h1 className="font-headline text-3xl tracking-tight text-on-surface mb-2">Verify Email</h1><p className="text-on-surface-variant font-body text-sm tracking-wide">Enter your email and OTP to activate your account</p></header>
          {message ? <div className="mb-6 rounded-2xl bg-secondary-fixed px-4 py-3 text-sm text-on-secondary-fixed">{message}</div> : null}
          {errorMessage ? <div className="mb-6 rounded-2xl bg-error-container px-4 py-3 text-sm text-on-error-container">{errorMessage}</div> : null}
          <form className="space-y-8" onSubmit={handleVerify}>
            <div className="relative group">
              <input className="peer w-full bg-transparent border-b-2 border-outline-variant/20 py-2 font-body text-sm text-on-surface focus:outline-none focus:border-primary transition-colors placeholder-transparent" id="email" placeholder="Email Address" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              <label className="absolute left-0 -top-4 text-on-surface-variant text-[11px] font-bold tracking-widest uppercase transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 peer-placeholder-shown:font-normal peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-on-surface/40 peer-focus:-top-4 peer-focus:text-[11px] peer-focus:font-bold peer-focus:text-primary peer-focus:tracking-widest" htmlFor="email">Email Address</label>
            </div>
            <div className="relative group">
              <input className="peer w-full bg-transparent border-b-2 border-outline-variant/20 py-2 font-body text-sm text-on-surface text-center tracking-[0.5em] focus:outline-none focus:border-primary transition-colors placeholder-transparent" id="otp" inputMode="numeric" maxLength="6" minLength="6" placeholder="OTP" required value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} />
              <label className="absolute left-0 -top-4 text-on-surface-variant text-[11px] font-bold tracking-widest uppercase transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 peer-placeholder-shown:font-normal peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-on-surface/40 peer-focus:-top-4 peer-focus:text-[11px] peer-focus:font-bold peer-focus:text-primary peer-focus:tracking-widest" htmlFor="otp">Verification OTP</label>
            </div>
            <button disabled={loading} className="w-full bg-primary text-white py-4 rounded-lg font-body font-bold text-sm tracking-widest uppercase shadow-md shadow-primary/10 hover:bg-primary-container hover:text-on-primary-container transition-all duration-300 disabled:opacity-70" type="submit">{loading ? 'Verifying...' : 'Verify & Continue'}</button>
            <button disabled={loading || !email} type="button" onClick={handleResend} className="w-full text-primary text-sm font-bold hover:underline disabled:opacity-60">Resend OTP</button>
          </form>
          <footer className="mt-12 text-center"><Link className="text-primary font-bold hover:underline underline-offset-4 decoration-2 decoration-primary/30" to="/login">Back to Sign In</Link></footer>
        </div>
      </main>
    </div>
  );
}
