import { useState, useEffect } from "react";
import { Plus, MessageSquare, Trash2, Menu, X, History, Info, ChevronLeft, Mic, Feather, Globe2, Palette, WifiOff } from "lucide-react";
import { Link } from "react-router-dom";
import ThemePicker from "./ThemePicker";
import { applyTheme, getStoredTheme } from "@/lib/themes";

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

type SidebarView = "menu" | "history" | "about" | "themes";

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

  useEffect(() => {
    applyTheme(getStoredTheme());
  }, []);

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

              <Link
                to="/coach"
                onClick={handleClose}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm hover:bg-sidebar-dark-hover transition-colors text-left"
              >
                <Mic size={18} className="opacity-70" />
                <span>Speaking Coach</span>
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-semibold">NEW</span>
              </Link>

              <Link
                to="/mehfil"
                onClick={handleClose}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm hover:bg-sidebar-dark-hover transition-colors text-left"
              >
                <Feather size={18} className="opacity-70" />
                <span>Mehfil · Storyteller</span>
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/30 to-rose-500/30 text-amber-200 font-semibold">NEW</span>
              </Link>

              <Link
                to="/search"
                onClick={handleClose}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm hover:bg-sidebar-dark-hover transition-colors text-left"
              >
                <Globe2 size={18} className="opacity-70" />
                <span>WadiSearch · Live Web</span>
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-sky-500/30 to-indigo-500/30 text-sky-200 font-semibold">NEW</span>
              </Link>

              <Link
                to="/offline"
                onClick={handleClose}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm hover:bg-sidebar-dark-hover transition-colors text-left"
              >
                <WifiOff size={18} className="opacity-70" />
                <span>Offline Mode</span>
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500/30 to-teal-500/30 text-emerald-200 font-semibold">NEW</span>
              </Link>

              <button
                onClick={() => setView("about")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm hover:bg-sidebar-dark-hover transition-colors text-left"
              >
                <Info size={18} className="opacity-70" />
                <span>About</span>
              </button>

            <button
                onClick={() => setView("themes")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm hover:bg-sidebar-dark-hover transition-colors text-left"
              >
                <Palette size={18} className="opacity-70" />
                <span>Themes & Sounds</span>
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-fuchsia-500/30 to-amber-500/30 text-fuchsia-200 font-semibold">8</span>
              </button>
            </nav>

            {/* Social Connect */}
            <div className="mt-auto px-3 py-4 border-t border-sidebar-dark-hover">
              <h3 className="px-4 text-[10px] font-semibold uppercase tracking-wider opacity-50 mb-3 text-center">Contact Us</h3>
              <div className="flex items-center justify-center gap-4">
                <a
                  href="https://instagram.com/bhatakash07"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-yellow-500 hover:scale-110 hover:shadow-lg hover:shadow-pink-500/30 transition-all"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>

                <a
                  href="https://snapchat.com/add/bhatakash071"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 hover:scale-110 hover:shadow-lg hover:shadow-yellow-500/30 transition-all"
                  aria-label="Snapchat"
                >
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.206 1.049c-.597 0-1.104.236-1.514.703-.41.467-.615 1.094-.615 1.882 0 .76.196 1.38.589 1.858.393.479.902.718 1.527.718.594 0 1.096-.236 1.506-.707.41-.472.615-1.1.615-1.885 0-.756-.198-1.375-.593-1.857-.395-.481-.905-.722-1.528-.722h.013zm5.292 15.068c-.22.536-.576.97-1.067 1.298-.49.327-1.062.56-1.715.695-.333.074-.57.144-.71.214-.14.07-.265.187-.373.352-.136.205-.256.405-.358.597-.102.193-.223.367-.36.522-.22.25-.496.373-.828.373-.2 0-.37-.05-.512-.148-.14-.1-.26-.23-.357-.393-.097-.163-.187-.335-.27-.515-.082-.18-.17-.352-.26-.516-.09-.164-.21-.294-.36-.39-.15-.095-.36-.172-.63-.228-.444-.09-.8-.187-1.066-.29-.268-.104-.51-.25-.728-.44-.217-.19-.392-.423-.525-.697-.133-.275-.2-.586-.2-.933 0-.373.08-.73.24-1.07.16-.34.383-.623.67-.85.29-.227.613-.39.974-.49.36-.1.748-.15 1.162-.15.373 0 .738.05 1.095.15.357.1.685.257.985.47.3.213.55.474.75.783.2.31.325.655.375 1.04.05.384.005.76-.134 1.126-.14.366-.36.69-.66.97h.014c.31-.247.553-.533.73-.86.176-.326.27-.68.28-1.06.01-.38-.08-.75-.267-1.11-.187-.36-.44-.66-.76-.9-.32-.24-.68-.42-1.08-.54-.4-.12-.81-.18-1.23-.18-.47 0-.92.08-1.35.23-.43.15-.81.37-1.14.65-.33.28-.59.62-.78 1.01-.19.39-.28.82-.28 1.29 0 .39.07.74.21 1.06.14.32.33.6.57.83.24.23.52.42.84.55.32.13.66.22 1.02.26.22.03.4.07.55.13.15.06.29.15.41.28.13.13.24.28.33.46.1.18.2.36.31.54.11.18.25.33.42.45.17.12.39.18.65.18.32 0 .58-.1.78-.31.2-.21.39-.47.58-.79.11-.2.24-.36.4-.5.16-.13.37-.22.62-.27.43-.09.82-.2 1.17-.35.35-.15.66-.34.92-.58.26-.24.47-.52.63-.85.16-.33.24-.69.24-1.09 0-.46-.11-.88-.34-1.26-.22-.38-.53-.7-.92-.96-.39-.26-.84-.46-1.35-.6-.51-.14-1.05-.21-1.63-.21-.63 0-1.23.1-1.8.3-.57.2-1.08.49-1.52.87-.44.38-.79.84-1.05 1.37-.26.53-.39 1.11-.39 1.74 0 .56.1 1.06.31 1.5.21.44.5.82.86 1.13.36.31.78.55 1.25.72.47.17.96.26 1.47.26.18 0 .37-.01.56-.04l-.04.02c.34.07.6.2.78.4.18.2.34.43.48.7.14.27.3.52.48.75.18.23.43.35.76.35.35 0 .62-.1.82-.32.2-.21.4-.5.6-.85.12-.22.27-.4.45-.55.18-.15.43-.25.75-.31.37-.08.72-.18 1.04-.31.32-.13.61-.3.86-.51.25-.21.46-.47.63-.77.17-.3.26-.65.26-1.05z"/>
                  </svg>
                </a>

                <a
                  href="https://t.me/anonymousmrak"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 hover:scale-110 hover:shadow-lg hover:shadow-sky-500/30 transition-all"
                  aria-label="Telegram"
                >
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        )}

        {view === "themes" && <ThemePicker onBack={() => setView("menu")} />}

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
                      aria-label="Delete chat"
                      className="opacity-70 hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 rounded-md p-1.5 transition-all"
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
        <div className="border-t border-sidebar-dark-hover p-3">
          <div className="text-xs text-center">
            <span className="opacity-60">Powered by </span>
            <span className="font-bold gradient-text">WadiAi</span>
            <span className="opacity-60"> × </span>
            <span className="font-bold">Xenonymous</span>
          </div>
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
