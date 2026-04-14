import { useState } from "react";
import { History, Info, Sparkles, Menu } from "lucide-react";
import wadiLogo from "@/assets/wadi-ai-logo.png";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface TopMenuBarProps {
  onToggleSidebar: () => void;
}

const TopMenuBar = ({ onToggleSidebar }: TopMenuBarProps) => {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
            title="Chat History"
          >
            <Menu size={18} className="text-foreground" />
          </button>
          <img src={wadiLogo} alt="WadiAi" className="w-8 h-8 rounded-lg object-contain" />
          <div>
            <span className="font-semibold text-sm gradient-text">WadiAi</span>
            <span className="text-[10px] text-muted-foreground ml-1.5">by Xenonymous</span>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          <button
            onClick={onToggleSidebar}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <History size={14} />
            <span className="hidden sm:inline">History</span>
          </button>
          <button
            onClick={() => setAboutOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <Info size={14} />
            <span className="hidden sm:inline">About</span>
          </button>
          <button
            onClick={() => setFeaturesOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <Sparkles size={14} />
            <span className="hidden sm:inline">Features</span>
          </button>
        </nav>
      </header>

      {/* About Dialog */}
      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <img src={wadiLogo} alt="WadiAi" className="w-10 h-10 rounded-xl object-contain" />
              <div>
                <span className="gradient-text text-xl">WadiAi</span>
                <p className="text-xs text-muted-foreground font-normal">by Xenonymous</p>
              </div>
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3 pt-3">
                <p className="text-sm text-muted-foreground">
                  WadiAi is a modern AI chat assistant built to help you with coding, writing, brainstorming, and more.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-muted-foreground">Developer</span>
                    <span className="font-medium text-foreground">Aakash Bashir</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-muted-foreground">Company</span>
                    <span className="font-medium text-foreground">Xenonymous</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-muted-foreground">AI Model</span>
                    <span className="font-medium text-foreground">Gemini 2.5 Flash</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-muted-foreground">Version</span>
                    <span className="font-medium text-foreground">1.0.0</span>
                  </div>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* More Features Dialog */}
      <Dialog open={featuresOpen} onOpenChange={setFeaturesOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles size={20} className="text-primary" />
              <span>Features</span>
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3 pt-3">
                <FeatureItem title="Real-time AI Chat" desc="Powered by Gemini 2.5 Flash with streaming responses" active />
                <FeatureItem title="Markdown Rendering" desc="Full markdown support including code blocks and tables" active />
                <FeatureItem title="Chat History" desc="Save and revisit your previous conversations" active />
                <FeatureItem title="Image Generation" desc="Generate images from text descriptions" />
                <FeatureItem title="File Upload" desc="Upload and analyze documents and images" />
                <FeatureItem title="Voice Input" desc="Talk to WadiAi with voice commands" />
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

const FeatureItem = ({ title, desc, active }: { title: string; desc: string; active?: boolean }) => (
  <div className={`flex items-start gap-3 p-3 rounded-xl border ${active ? "border-primary/30 bg-primary/5" : "border-border bg-muted/30 opacity-60"}`}>
    <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${active ? "bg-green-500" : "bg-muted-foreground"}`} />
    <div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
      {!active && <span className="text-[10px] text-primary mt-1 inline-block">Coming Soon</span>}
    </div>
  </div>
);

export default TopMenuBar;
