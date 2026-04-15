import { formatTime } from '../../utils/format';

export default function MessageBubble({ message }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end group">
        <div className="max-w-[70%] bg-secondary/10 border border-secondary/5 rounded-2xl rounded-tr-none px-6 py-4 shadow-sm">
          <p className="text-on-surface leading-relaxed whitespace-pre-wrap">{message.content}</p>
          <span className="block text-[10px] mt-2 text-secondary font-bold uppercase tracking-tighter">{formatTime(message.createdAt)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start gap-4">
      <div className="w-10 h-10 rounded-full bg-primary-fixed flex-shrink-0 flex items-center justify-center text-primary border border-primary/10">
        <span className="material-symbols-outlined text-sm">auto_awesome</span>
      </div>
      <div className="max-w-[75%] bg-surface-container-low rounded-2xl rounded-tl-none px-7 py-6 relative">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold rounded-full mb-4">
          <span className="material-symbols-outlined text-[12px]">brightness_7</span>
          AI GUIDANCE
        </div>
        <p className="text-on-surface leading-relaxed whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
