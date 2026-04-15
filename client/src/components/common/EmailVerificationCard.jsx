import { useState } from 'react';
import { resendVerificationRequest, verifyEmailRequest } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

export default function EmailVerificationCard() {
  const { user, setSession } = useAuth();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!user || user.isEmailVerified) {
    return null;
  }

  async function handleVerify(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setErrorMessage('');

    try {
      const { data } = await verifyEmailRequest({ email: user.email, otp });
      setSession(data);
      setMessage(data.message);
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
      const { data } = await resendVerificationRequest({ email: user.email });
      setMessage(data.message);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Could not resend OTP right now.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[28px] border border-primary/15 bg-[#fff8e8] p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[20px]">mark_email_unread</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-headline text-xl text-on-surface">Verify your email</h3>
          <p className="mt-1 text-sm text-on-surface-variant">Enter the 6 digit OTP sent to {user.email}.</p>
          <form className="mt-4 flex flex-col sm:flex-row gap-3" onSubmit={handleVerify}>
            <input className="min-w-0 flex-1 rounded-full border border-outline-variant/20 bg-white px-4 py-3 text-sm outline-none focus:border-primary" maxLength="6" minLength="6" placeholder="6 digit OTP" required value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} />
            <button disabled={loading} className="rounded-full bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-60" type="submit">Verify</button>
          </form>
          <button disabled={loading} className="mt-3 text-sm font-bold text-primary hover:underline disabled:opacity-60" type="button" onClick={handleResend}>Resend OTP</button>
          {message ? <p className="mt-3 text-sm text-primary">{message}</p> : null}
          {errorMessage ? <p className="mt-3 text-sm text-error">{errorMessage}</p> : null}
        </div>
      </div>
    </div>
  );
}
