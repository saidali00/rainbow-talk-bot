import { useState } from "react";
import { Plus, MessageSquare, Trash2, Menu, X } from "lucide-react";

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

const ChatSidebar = ({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  isOpen,
  onToggle,
}: ChatSidebarProps) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/40 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed md:relative z-50 h-full flex flex-col bg-sidebar-dark text-sidebar-dark-foreground transition-all duration-300 ${
          isOpen ? "w-72 translate-x-0" : "w-0 -translate-x-full md:w-0 md:-translate-x-full"
        } overflow-hidden`}
      >
        <div className="flex items-center justify-between p-4 border-b border-sidebar-dark-hover">
          <h1 className="text-lg font-semibold gradient-text">WadiAi</h1>
          <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-sidebar-dark-hover transition-colors">
            <X size={18} />
          </button>
        </div>

        <button
          onClick={onNew}
          className="mx-3 mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          New Chat
        </button>

        <nav className="flex-1 overflow-y-auto scrollbar-thin mt-2 px-2 pb-4 space-y-0.5">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelect(conv.id)}
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
          ))}
        </nav>

        <div className="p-3 border-t border-sidebar-dark-hover text-xs text-muted-foreground text-center">
          Powered by Xenonymous
        </div>
      </aside>

      {/* Toggle button when closed */}
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
