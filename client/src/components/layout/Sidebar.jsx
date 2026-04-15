export default function Sidebar({ chats, selectedChatId, onSelectChat, onNewChat, onDeleteChat, disabled = false, onLockedAction }) {
  function handleClick(callback, value) {
    if (disabled) {
      onLockedAction?.();
      return;
    }

    callback?.(value);
  }

  function handleDelete(event, chatId) {
    event.stopPropagation();
    if (disabled) {
      onLockedAction?.();
      return;
    }

    onDeleteChat?.(chatId);
  }

  return (
    <aside className="h-screen w-72 left-0 top-0 fixed bg-[#f2efe9] flex flex-col py-6 pl-4 z-40 transition-all duration-300">
      <div className="flex items-center gap-3 mb-10 px-4">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary">
          <span className="material-symbols-outlined">auto_awesome</span>
        </div>
        <div>
          <h1 className="font-serif text-lg text-[#775a19]">Celestial Insights</h1>
          <p className="text-[10px] uppercase tracking-widest text-[#1b1c1a]/50">Vedic Wisdom via AI</p>
        </div>
      </div>
      <div className="px-4 mb-8">
        <button onClick={() => handleClick(onNewChat)} className="w-full py-3 px-4 bg-primary text-on-primary rounded-xl flex items-center justify-center gap-2 font-semibold shadow-md active:scale-95 transition-transform">
          <span className="material-symbols-outlined">add</span>
          {disabled ? 'Unlock Reading' : 'New Reading'}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto space-y-1 chat-scrollbar">
        <div className="px-4 mb-2">
          <span className="text-[10px] font-bold text-on-surface/40 uppercase tracking-[0.2em]">Recent Chats</span>
        </div>
        {chats.map((chat, index) => (
          <div key={chat._id || chat.id || `${chat.title}-${index}`} className="mr-4 group">
            <div className={`flex items-center gap-2 rounded-r-full transition-all ${selectedChatId === chat._id ? 'bg-[#fbf9f5] text-[#775a19] font-medium' : 'text-[#1b1c1a]/70 hover:bg-[#fbf9f5]/50 hover:translate-x-1'}`}>
              <button onClick={() => handleClick(onSelectChat, chat._id)} className="flex flex-1 items-center gap-3 px-4 py-3 text-left min-w-0">
                <span className="material-symbols-outlined shrink-0">{index % 2 === 0 ? 'auto_awesome' : 'brightness_5'}</span>
                <span className="truncate flex-1">{chat.title || 'New Reading'}</span>
                {disabled ? <span className="material-symbols-outlined ml-auto text-sm text-primary/70 shrink-0">lock</span> : null}
              </button>
              {!disabled && chat._id ? (
                <button
                  type="button"
                  onClick={(event) => handleDelete(event, chat._id)}
                  className="mr-2 w-8 h-8 rounded-full flex items-center justify-center text-on-surface/35 hover:text-[#775a19] hover:bg-[#fbf9f5] opacity-0 group-hover:opacity-100 transition-all shrink-0"
                  aria-label="Delete chat"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </nav>
      <div className="mt-auto space-y-1">
        <a className="flex items-center gap-3 px-4 py-3 text-[#1b1c1a]/70 hover:bg-[#fbf9f5]/50 transition-all rounded-r-full mr-4" href="#"><span className="material-symbols-outlined">settings</span><span>Settings</span></a>
        <a className="flex items-center gap-3 px-4 py-3 text-[#1b1c1a]/70 hover:bg-[#fbf9f5]/50 transition-all rounded-r-full mr-4" href="#"><span className="material-symbols-outlined">help_outline</span><span>Support</span></a>
      </div>
    </aside>
  );
}
