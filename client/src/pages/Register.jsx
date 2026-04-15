import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { meRequest, registerRequest, resendVerificationRequest, verifyEmailRequest } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [otp, setOtp] = useState('');

  useEffect(() => {
    async function completeGoogleLogin() {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const googleError = params.get('googleError');

      if (googleError) {
        setErrorMessage('Google sign-up could not be completed. Please check your Google OAuth callback URL and credentials, then try again.');
        return;
      }

      if (!token) return;

      try {
        localStorage.setItem('astroai_token', token);
        const { data } = await meRequest();
        setSession({ token, user: data.user });
        navigate('/chat', { replace: true });
      } catch (_error) {
        localStorage.removeItem('astroai_token');
        setErrorMessage('Google sign-up could not be completed. Please try again.');
      }
    }

    completeGoogleLogin();
  }, [location.search, navigate, setSession]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const { data } = await registerRequest(form);
      setPendingEmail(data.email || form.email);
      setSuccessMessage(data.message || 'Please verify your email with the OTP we sent.');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'We could not create your account.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(event) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { data } = await verifyEmailRequest({ email: pendingEmail, otp });
      setSession(data);
      navigate('/chat');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { data } = await resendVerificationRequest({ email: pendingEmail });
      setSuccessMessage(data.message || 'Verification OTP sent.');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Could not resend OTP right now.');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="font-body text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen flex items-center justify-center p-6 overflow-hidden auth-background bg-surface relative">
      <div className="grain-overlay fixed inset-0 z-50"></div>
      <main className="w-full max-w-[440px] relative z-10">
        <div className="bg-surface-container-lowest/80 backdrop-blur-xl rounded-xl p-8 md:p-12 shadow-[0_20px_40px_rgba(27,28,26,0.05)] border border-outline-variant/10">
          <header className="text-center mb-10"><div className="inline-flex items-center justify-center mb-6"><span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>{pendingEmail ? 'mark_email_unread' : 'auto_awesome'}</span></div><h1 className="font-headline text-3xl tracking-tight text-on-surface mb-2">{pendingEmail ? 'Verify Your Email' : 'Join the Circle'}</h1><p className="text-on-surface-variant font-body text-sm tracking-wide">{pendingEmail ? `Enter the OTP sent to ${pendingEmail}` : 'Create your account and begin your first reading'}</p></header>
          {!pendingEmail ? <><div className="space-y-4 mb-10"><button onClick={() => { window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`; }} className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-surface rounded-lg border border-outline-variant/20 hover:bg-surface-container-low transition-colors duration-300 group"><svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path></svg><span className="font-body text-sm font-medium text-on-surface">Continue with Google</span></button></div>
          <div className="relative flex items-center mb-10"><div className="flex-grow border-t border-outline-variant/10"></div><span className="flex-shrink mx-4 text-[10px] uppercase tracking-widest text-on-surface-variant/40 font-bold">or use email</span><div className="flex-grow border-t border-outline-variant/10"></div></div></> : null}
          {successMessage ? <div className="mb-6 rounded-2xl bg-secondary-fixed px-4 py-3 text-sm text-on-secondary-fixed">{successMessage}</div> : null}
          {errorMessage ? <div className="mb-6 rounded-2xl bg-error-container px-4 py-3 text-sm text-on-error-container">{errorMessage}</div> : null}
          {pendingEmail ? <form className="space-y-8" onSubmit={handleVerify}>
            <div className="relative group">
              <input className="peer w-full bg-transparent border-b-2 border-outline-variant/20 py-2 font-body text-sm text-on-surface text-center tracking-[0.5em] focus:outline-none focus:border-primary transition-colors placeholder-transparent" id="otp" inputMode="numeric" maxLength="6" minLength="6" placeholder="OTP" required value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} />
              <label className="absolute left-0 -top-4 text-on-surface-variant text-[11px] font-bold tracking-widest uppercase transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 peer-placeholder-shown:font-normal peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-on-surface/40 peer-focus:-top-4 peer-focus:text-[11px] peer-focus:font-bold peer-focus:text-primary peer-focus:tracking-widest" htmlFor="otp">Verification OTP</label>
            </div>
            <button disabled={loading} className="w-full bg-primary text-white py-4 rounded-lg font-body font-bold text-sm tracking-widest uppercase shadow-md shadow-primary/10 hover:bg-primary-container hover:text-on-primary-container transition-all duration-300 transform active:scale-[0.98] disabled:opacity-70" type="submit">{loading ? 'Verifying...' : 'Verify & Continue'}</button>
            <button disabled={resending} type="button" onClick={handleResend} className="w-full text-primary text-sm font-bold hover:underline disabled:opacity-60">{resending ? 'Sending OTP...' : 'Resend OTP'}</button>
          </form> : <form className="space-y-8" onSubmit={handleSubmit}>
            {['name', 'email', 'password'].map((field) => (
              <div key={field} className="relative group">
                <input className="peer w-full bg-transparent border-b-2 border-outline-variant/20 py-2 font-body text-sm text-on-surface focus:outline-none focus:border-primary transition-colors placeholder-transparent" id={field} placeholder={field} required type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'} value={form[field]} onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))} />
                <label className="absolute left-0 -top-4 text-on-surface-variant text-[11px] font-bold tracking-widest uppercase transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 peer-placeholder-shown:font-normal peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-on-surface/40 peer-focus:-top-4 peer-focus:text-[11px] peer-focus:font-bold peer-focus:text-primary peer-focus:tracking-widest" htmlFor={field}>{field === 'name' ? 'Full Name' : field === 'email' ? 'Email Address' : 'Password'}</label>
              </div>
            ))}
            <button disabled={loading} className="w-full bg-primary text-white py-4 rounded-lg font-body font-bold text-sm tracking-widest uppercase shadow-md shadow-primary/10 hover:bg-primary-container hover:text-on-primary-container transition-all duration-300 transform active:scale-[0.98] disabled:opacity-70" type="submit">{loading ? 'Creating Account...' : 'Create Account'}</button>
          </form>}
          <footer className="mt-12 text-center"><p className="text-sm text-on-surface-variant">Already aligned?<Link className="text-primary font-bold ml-1 hover:underline underline-offset-4 decoration-2 decoration-primary/30" to="/login">Sign In</Link></p></footer>
        </div>
      </main>
      <div className="absolute top-10 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div><div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
}
