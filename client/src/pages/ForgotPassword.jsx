import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPasswordRequest } from '../api/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setErrorMessage('');

    try {
      const { data } = await forgotPasswordRequest({ email });
      setMessage(data.message);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'We could not send a reset link right now.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="font-body text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen flex items-center justify-center p-6 overflow-hidden auth-background bg-surface relative">
      <div className="grain-overlay fixed inset-0 z-50"></div>
      <main className="w-full max-w-[440px] relative z-10">
        <div className="bg-surface-container-lowest/80 backdrop-blur-xl rounded-xl p-8 md:p-12 shadow-[0_20px_40px_rgba(27,28,26,0.05)] border border-outline-variant/10">
          <header className="text-center mb-10">
            <div className="inline-flex items-center justify-center mb-6"><span className="material-symbols-outlined text-primary text-4xl">lock_reset</span></div>
            <h1 className="font-headline text-3xl tracking-tight text-on-surface mb-2">Reset Password</h1>
            <p className="text-on-surface-variant font-body text-sm tracking-wide">Enter your email and we will send a secure reset link</p>
          </header>
          {message ? <div className="mb-6 rounded-2xl bg-secondary-fixed px-4 py-3 text-sm text-on-secondary-fixed">{message}</div> : null}
          {errorMessage ? <div className="mb-6 rounded-2xl bg-error-container px-4 py-3 text-sm text-on-error-container">{errorMessage}</div> : null}
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="relative group">
              <input className="peer w-full bg-transparent border-b-2 border-outline-variant/20 py-2 font-body text-sm text-on-surface focus:outline-none focus:border-primary transition-colors placeholder-transparent" id="email" placeholder="Email Address" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              <label className="absolute left-0 -top-4 text-on-surface-variant text-[11px] font-bold tracking-widest uppercase transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 peer-placeholder-shown:font-normal peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-on-surface/40 peer-focus:-top-4 peer-focus:text-[11px] peer-focus:font-bold peer-focus:text-primary peer-focus:tracking-widest" htmlFor="email">Email Address</label>
            </div>
            <button disabled={loading} className="w-full bg-primary text-white py-4 rounded-lg font-body font-bold text-sm tracking-widest uppercase shadow-md shadow-primary/10 hover:bg-primary-container hover:text-on-primary-container transition-all duration-300 disabled:opacity-70" type="submit">{loading ? 'Sending Link...' : 'Send Reset Link'}</button>
          </form>
          <footer className="mt-12 text-center"><Link className="text-primary font-bold hover:underline underline-offset-4 decoration-2 decoration-primary/30" to="/login">Back to Sign In</Link></footer>
        </div>
      </main>
    </div>
  );
}
