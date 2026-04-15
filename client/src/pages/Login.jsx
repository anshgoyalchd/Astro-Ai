import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginRequest, meRequest } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function completeGoogleLogin() {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const googleError = params.get('googleError');

      if (googleError) {
        setErrorMessage('Google sign-in could not be completed. Please check your Google OAuth callback URL and credentials, then try again.');
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
        setErrorMessage('Google sign-in could not be completed. Please try again.');
      }
    }

    completeGoogleLogin();
  }, [location.search, navigate, setSession]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      const { data } = await loginRequest(form);
      setSession(data);
      navigate('/chat');
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.requiresVerification) {
        navigate(`/verify-email?email=${encodeURIComponent(error.response.data.email || form.email)}`);
        return;
      }
      setErrorMessage(error.response?.data?.message || 'Unable to sign in with those credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="font-body text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen flex items-center justify-center p-6 overflow-hidden auth-background bg-surface relative">
      <div className="grain-overlay fixed inset-0 z-50"></div>
      <main className="w-full max-w-[440px] relative z-10">
        <div className="bg-surface-container-lowest/80 backdrop-blur-xl rounded-xl p-8 md:p-12 shadow-[0_20px_40px_rgba(27,28,26,0.05)] border border-outline-variant/10">
          <header className="text-center mb-10"><div className="inline-flex items-center justify-center mb-6"><span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span></div><h1 className="font-headline text-3xl tracking-tight text-on-surface mb-2">Welcome Back</h1><p className="text-on-surface-variant font-body text-sm tracking-wide">Enter your celestial coordinates to continue</p></header>
          <div className="space-y-4 mb-10"><button onClick={() => { window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`; }} className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-surface rounded-lg border border-outline-variant/20 hover:bg-surface-container-low transition-colors duration-300 group"><svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path></svg><span className="font-body text-sm font-medium text-on-surface">Continue with Google</span></button></div>
          <div className="relative flex items-center mb-10"><div className="flex-grow border-t border-outline-variant/10"></div><span className="flex-shrink mx-4 text-[10px] uppercase tracking-widest text-on-surface-variant/40 font-bold">or use email</span><div className="flex-grow border-t border-outline-variant/10"></div></div>
          {errorMessage ? <div className="mb-6 rounded-2xl bg-error-container px-4 py-3 text-sm text-on-error-container">{errorMessage}</div> : null}
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="relative group"><input className="peer w-full bg-transparent border-b-2 border-outline-variant/20 py-2 font-body text-sm text-on-surface focus:outline-none focus:border-primary transition-colors placeholder-transparent" id="email" placeholder="Email Address" required type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} /><label className="absolute left-0 -top-4 text-on-surface-variant text-[11px] font-bold tracking-widest uppercase transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 peer-placeholder-shown:font-normal peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-on-surface/40 peer-focus:-top-4 peer-focus:text-[11px] peer-focus:font-bold peer-focus:text-primary peer-focus:tracking-widest" htmlFor="email">Email Address</label></div>
            <div className="relative group"><input className="peer w-full bg-transparent border-b-2 border-outline-variant/20 py-2 font-body text-sm text-on-surface focus:outline-none focus:border-primary transition-colors placeholder-transparent" id="password" placeholder="Password" required type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} /><label className="absolute left-0 -top-4 text-on-surface-variant text-[11px] font-bold tracking-widest uppercase transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 peer-placeholder-shown:font-normal peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-on-surface/40 peer-focus:-top-4 peer-focus:text-[11px] peer-focus:font-bold peer-focus:text-primary peer-focus:tracking-widest" htmlFor="password">Password</label></div>
            <div className="flex items-center justify-between pt-2"><label className="flex items-center gap-2 cursor-pointer group"><div className="relative flex items-center"><input className="peer appearance-none w-4 h-4 rounded border border-outline-variant/40 checked:bg-primary checked:border-primary transition-all" type="checkbox" /><span className="material-symbols-outlined absolute text-[12px] text-white opacity-0 peer-checked:opacity-100 left-0.5">check</span></div><span className="text-xs text-on-surface-variant font-medium">Remember me</span></label><Link className="text-xs text-secondary font-bold hover:text-on-secondary-container transition-colors" to="/forgot-password">Forgot password?</Link></div>
            <button disabled={loading} className="w-full bg-primary text-white py-4 rounded-lg font-body font-bold text-sm tracking-widest uppercase shadow-md shadow-primary/10 hover:bg-primary-container hover:text-on-primary-container transition-all duration-300 transform active:scale-[0.98] disabled:opacity-70" type="submit">{loading ? 'Signing In...' : 'Sign In'}</button>
          </form>
          <footer className="mt-12 text-center"><p className="text-sm text-on-surface-variant">New to the cosmos?<Link className="text-primary font-bold ml-1 hover:underline underline-offset-4 decoration-2 decoration-primary/30" to="/register">Join the Circle</Link></p></footer>
        </div>
      </main>
      <div className="absolute top-10 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div><div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
}
