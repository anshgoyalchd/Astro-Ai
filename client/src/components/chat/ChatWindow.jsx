import MessageBubble from './MessageBubble';

export default function ChatWindow({ messages, onViewReport, hasActiveChat, onCreateChat, loading, errorMessage }) {
  const showRetryState = Boolean(!loading && !hasActiveChat && errorMessage);

  return (
    <section className="flex-1 overflow-y-auto px-8 md:px-24 py-12 space-y-10 chat-scrollbar">
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16">
        <h2 className="font-headline text-4xl mb-4 text-on-surface">The Stars Align for You</h2>
        <p className="text-on-surface/60 text-lg leading-relaxed">Your personal Vedic guide is ready to interpret the cosmic shifts in your transit today. Ask about your career, relationships, or spiritual path.</p>
        {hasActiveChat ? (
          <button onClick={onViewReport} className="mt-6 text-primary font-bold underline underline-offset-8">Open Full Report</button>
        ) : (
          <button onClick={onCreateChat} className="mt-6 text-primary font-bold underline underline-offset-8">Start a New Reading</button>
        )}
      </div>

      {errorMessage && !showRetryState ? (
        <div className="max-w-3xl mx-auto bg-error-container text-on-error-container rounded-2xl px-6 py-4 text-sm border border-error/10">
          {errorMessage}
        </div>
      ) : null}

      {loading ? (
        <div className="max-w-3xl mx-auto bg-surface-container-low rounded-2xl px-7 py-10 text-center text-on-surface/60">
          Preparing your celestial conversation...
        </div>
      ) : null}

      {showRetryState ? (
        <div className="max-w-3xl mx-auto bg-surface-container-low rounded-2xl px-7 py-10 text-center border border-outline-variant/10">
          <p className="text-on-surface leading-relaxed mb-3">AstroAI could not generate your reading right now because the AI service is temporarily busy.</p>
          <p className="text-sm text-on-surface-variant mb-6">This is usually temporary. Try again in a moment.</p>
          <button onClick={onCreateChat} className="px-6 py-3 rounded-full bg-primary text-on-primary font-semibold shadow-lg shadow-primary/20">Try Again</button>
        </div>
      ) : null}

      {!loading && !hasActiveChat && !showRetryState ? (
        <div className="max-w-3xl mx-auto bg-surface-container-low rounded-2xl px-7 py-10 text-center">
          <p className="text-on-surface leading-relaxed mb-4">Create a new reading to generate your report and begin chatting with AstroAI.</p>
          <button onClick={onCreateChat} className="px-6 py-3 rounded-full bg-primary text-on-primary font-semibold shadow-lg shadow-primary/20">New Reading</button>
        </div>
      ) : null}

      {!loading && hasActiveChat
        ? messages.map((message, index) => (
            <MessageBubble key={`${message.role}-${index}-${message.createdAt || index}`} message={message} />
          ))
        : null}
    </section>
  );
}
