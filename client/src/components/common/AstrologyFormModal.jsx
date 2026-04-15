import { useEffect, useState } from 'react';

const blankState = { fullName: '', dob: '', time: '', city: '', state: '', country: '' };

export default function AstrologyFormModal({ open, onSubmit, loading, initialValues }) {
  const [form, setForm] = useState(initialValues || blankState);

  useEffect(() => {
    if (open) {
      setForm({ ...blankState, ...(initialValues || {}) });
    }
  }, [open, initialValues]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"></div>
      <div className="relative w-full max-w-2xl rounded-xl bg-surface-container-lowest p-8 md:p-12 shadow-[0_20px_40px_rgba(27,28,26,0.08)] border border-outline-variant/10">
        <h2 className="font-headline text-3xl tracking-tight text-on-surface mb-2">Enter Your Celestial Coordinates</h2>
        <p className="text-on-surface-variant font-body text-sm tracking-wide mb-10">We use these details to generate your report and ground every chat response in your personal profile.</p>
        <form className="grid md:grid-cols-2 gap-8" onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}>
          {[
            ['fullName', 'Full Name', 'text'],
            ['dob', 'DOB', 'date'],
            ['time', 'Time (IST)', 'time'],
            ['city', 'City', 'text'],
            ['state', 'State', 'text'],
            ['country', 'Country', 'text']
          ].map(([key, label, type]) => (
            <div key={key} className="relative group">
              <input value={form[key] || ''} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} className="peer w-full bg-transparent border-b-2 border-outline-variant/20 py-2 font-body text-sm text-on-surface focus:outline-none focus:border-primary transition-colors placeholder-transparent" id={key} placeholder={label} required type={type} />
              <label className="absolute left-0 -top-4 text-on-surface-variant text-[11px] font-bold tracking-widest uppercase transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 peer-placeholder-shown:font-normal peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-on-surface/40 peer-focus:-top-4 peer-focus:text-[11px] peer-focus:font-bold peer-focus:text-primary peer-focus:tracking-widest" htmlFor={key}>{label}</label>
            </div>
          ))}
          <button disabled={loading} className="md:col-span-2 w-full bg-primary text-white py-4 rounded-lg font-body font-bold text-sm tracking-widest uppercase shadow-md shadow-primary/10 hover:bg-primary-container hover:text-on-primary-container transition-all duration-300 transform active:scale-[0.98] disabled:opacity-70" type="submit">{loading ? 'Saving...' : 'Continue to Reading'}</button>
        </form>
      </div>
    </div>
  );
}
