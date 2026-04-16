import { useState, useEffect } from "react";
import { Plus, MessageSquare, Trash2, Menu, X, History, Info, ChevronLeft, Sun, Moon } from "lucide-react";

export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

type SidebarView = "menu" | "history" | "about";

const ChatSidebar = ({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  isOpen,
  onToggle,
}: ChatSidebarProps) => {
  const [view, setView] = useState<SidebarView>("menu");
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const handleClose = () => {
    onToggle();
    setTimeout(() => setView("menu"), 300);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/40 z-40 md:hidden"
          onClick={handleClose}
        />
      )}

      <aside
        className={`fixed md:relative z-50 h-full flex flex-col bg-sidebar-dark text-sidebar-dark-foreground transition-all duration-300 ${
          isOpen ? "w-72 translate-x-0" : "w-0 -translate-x-full md:w-0 md:-translate-x-full"
        } overflow-hidden`}
      >
        <div className="flex items-center justify-between p-4 border-b border-sidebar-dark-hover">
          <h1 className="text-lg font-semibold gradient-text">WadiAi</h1>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-sidebar-dark-hover transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Main Menu View */}
        {view === "menu" && (
          <div className="flex-1 flex flex-col">
            <button
              onClick={onNew}
              className="mx-3 mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
            >
              <Plus size={16} />
              New Chat
            </button>

            <nav className="mt-4 px-3 space-y-1">
              <button
                onClick={() => setView("history")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm hover:bg-sidebar-dark-hover transition-colors text-left"
              >
                <History size={18} className="opacity-70" />
                <span>Chat History</span>
                <span className="ml-auto text-xs opacity-50">{conversations.length}</span>
              </button>

              <button
                onClick={() => setView("about")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm hover:bg-sidebar-dark-hover transition-colors text-left"
              >
                <Info size={18} className="opacity-70" />
                <span>About</span>
              </button>

              <button
                onClick={() => setDark((d) => !d)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm hover:bg-sidebar-dark-hover transition-colors text-left"
              >
                {dark ? <Sun size={18} className="opacity-70" /> : <Moon size={18} className="opacity-70" />}
                <span>{dark ? "Light Mode" : "Dark Mode"}</span>
              </button>
            </nav>
          </div>
        )}

        {/* Chat History View */}
        {view === "history" && (
          <div className="flex-1 flex flex-col">
            <button
              onClick={() => setView("menu")}
              className="mx-3 mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-sidebar-dark-hover transition-colors"
            >
              <ChevronLeft size={16} />
              Back
            </button>

            <h2 className="px-6 mt-3 text-xs font-semibold uppercase tracking-wider opacity-50">Chat History</h2>

            <nav className="flex-1 overflow-y-auto scrollbar-thin mt-2 px-2 pb-4 space-y-0.5">
              {conversations.length === 0 ? (
                <p className="px-4 py-6 text-sm text-center opacity-40">No conversations yet</p>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => { onSelect(conv.id); handleClose(); }}
                    className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer text-sm transition-colors ${
                      activeId === conv.id
                        ? "bg-sidebar-dark-hover text-sidebar-dark-active"
                        : "hover:bg-sidebar-dark-hover"
                    }`}
                  >
                    <MessageSquare size={14} className="shrink-0 opacity-60" />
                    <span className="flex-1 truncate">{conv.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(conv.id);
                      }}
                      className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity p-1"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </nav>
          </div>
        )}

        {/* About View */}
        {view === "about" && (
          <div className="flex-1 flex flex-col">
            <button
              onClick={() => setView("menu")}
              className="mx-3 mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-sidebar-dark-hover transition-colors"
            >
              <ChevronLeft size={16} />
              Back
            </button>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <h2 className="text-xl font-bold gradient-text">About WadiAi</h2>

              <p className="text-sm leading-relaxed opacity-80">
                WadiAi is a next-generation AI assistant built with passion, precision, and countless hours of hard work. 
                It's designed to feel different — smarter, faster, and more intuitive than anything you've used before.
              </p>

              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider opacity-50">What Makes Us Different</h3>
                <ul className="space-y-2 text-sm opacity-80">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">⚡</span>
                    <span>Ultra-fast streaming responses with real-time token generation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">🧠</span>
                    <span>Advanced reasoning with deep context understanding</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">🎨</span>
                    <span>Beautifully crafted UI with seasonal animations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">🔒</span>
                    <span>Privacy-first approach — your data stays yours</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider opacity-50">Built With</h3>
                <div className="flex flex-wrap gap-2">
                  {["Python", "Neural Link", "Java", "React", "TypeScript", "Rust", "Swift", "Kotlin", "Go", "Tailwind CSS"].map((tech) => (
                    <span key={tech} className="px-3 py-1.5 text-xs rounded-full border border-sidebar-dark-hover bg-sidebar-dark-hover/50">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-sidebar-dark-hover/50 border border-sidebar-dark-hover">
                <p className="text-xs opacity-60 leading-relaxed">
                  Crafted with dedication and hard work. Every line of code, every pixel, every interaction — 
                  designed to make you feel the difference. This isn't just another AI chatbot. This is WadiAi.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-dark-hover text-xs text-center">
          <span className="text-muted-foreground">Powered by </span>
          <span className="font-bold gradient-text">WadiAi</span>
          <span className="text-muted-foreground"> × </span>
          <span className="font-bold text-sidebar-dark-foreground">Xenonymous</span>
        </div>
      </aside>

      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed top-4 left-4 z-30 p-2 rounded-xl bg-card shadow-lg border border-border hover:bg-muted transition-colors"
        >
          <Menu size={18} className="text-foreground" />
        </button>
      )}
    </>
  );
};

export default ChatSidebar;
