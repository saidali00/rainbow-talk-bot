import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Loader2, ArrowLeft, ExternalLink, Sparkles, Globe2, Zap, Brain, Link2, TrendingUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Source { title: string; url: string; snippet: string; }
interface Result { query: string; answer: string; sources: Source[]; }

const SUGGESTED = [
  { q: "Latest news from Kashmir today", icon: TrendingUp },
  { q: "Best places to visit in Anantnag", icon: Sparkles },
  { q: "What is Lovable AI Gateway?", icon: Brain },
  { q: "Current weather in Srinagar", icon: Zap },
  { q: "Recent advancements in AI 2026", icon: TrendingUp },
];

const STAGES = [
  { icon: Globe2, label: "Scanning the live web" },
  { icon: Link2, label: "Reading top sources" },
  { icon: Brain, label: "Synthesizing answer" },
  { icon: Sparkles, label: "Adding citations" },
];

const WadiSearch = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!loading) return;
    setStage(0);
    const id = setInterval(() => setStage((s) => (s + 1) % STAGES.length), 1100);
    return () => clearInterval(id);
  }, [loading]);

  const run = async (q: string) => {
    if (!q.trim() || loading) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("web-search", { body: { query: q } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResults((prev) => [{ query: q, answer: data.answer || "No answer.", sources: data.sources || [] }, ...prev]);
      setQuery("");
    } catch (e: any) {
      toast({ title: "Search failed", description: e?.message || "Try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Animated aurora background */}
      <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
        <motion.div
          aria-hidden
          className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-sky-500/20 blur-3xl"
          animate={{ x: [0, 80, 0], y: [0, 60, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute top-1/3 -right-32 w-[420px] h-[420px] rounded-full bg-indigo-500/20 blur-3xl"
          animate={{ x: [0, -60, 0], y: [0, -80, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute bottom-0 left-1/4 w-[380px] h-[380px] rounded-full bg-fuchsia-500/15 blur-3xl"
          animate={{ x: [0, 100, 0], y: [0, -40, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <header className="sticky top-0 z-10 backdrop-blur-xl bg-background/70 border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-2">
            <motion.span
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
            >
              <Globe2 size={18} />
            </motion.span>
            <div>
              <h1 className="text-base font-bold leading-tight bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">
                WadiSearch
              </h1>
              <p className="text-[10px] text-muted-foreground">Live web answers with sources</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 relative">
        {/* Hero (only when no results) */}
        <AnimatePresence>
          {results.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-6 mt-4"
            >
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Ask the{" "}
                <span className="bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">
                  live web
                </span>
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Real sources. Real citations. Real answers.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search bar */}
        <motion.div
          layout
          className="relative rounded-2xl shadow-xl"
          whileHover={{ scale: 1.005 }}
        >
          <motion.div
            aria-hidden
            className="absolute -inset-[1.5px] rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 opacity-70 blur-[2px]"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: "200% 200%" }}
          />
          <div className="relative flex items-center gap-2 bg-card rounded-2xl p-2">
            <Search size={18} className="ml-2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && run(query)}
              placeholder="Ask anything — search the live web..."
              className="flex-1 bg-transparent text-sm py-2 focus:outline-none"
              disabled={loading}
              autoFocus
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.04 }}
              onClick={() => run(query)}
              disabled={loading || !query.trim()}
              className="px-4 py-2 rounded-xl text-white text-sm font-semibold bg-gradient-to-br from-sky-500 to-indigo-600 disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center gap-1.5"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><Sparkles size={14} /> Search</>}
            </motion.button>
          </div>
        </motion.div>

        {results.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-3">
              <Sparkles size={12} /> Try one of these
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGGESTED.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.button
                    key={s.q}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.35 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => run(s.q)}
                    className="group flex items-center gap-2.5 text-left text-xs px-3 py-2.5 rounded-xl border border-border bg-card/80 backdrop-blur hover:bg-muted hover:border-indigo-400/40 transition-all hover:shadow-md"
                  >
                    <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500/20 to-indigo-500/20 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                      <Icon size={14} />
                    </span>
                    <span className="flex-1 font-medium">{s.q}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Multi-stage animated loader */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 rounded-2xl border border-border bg-card/80 backdrop-blur p-4 shadow-lg"
            >
              <div className="space-y-3">
                {STAGES.map((s, i) => {
                  const Icon = s.icon;
                  const active = i === stage;
                  const done = i < stage;
                  return (
                    <motion.div
                      key={s.label}
                      animate={{ opacity: active ? 1 : done ? 0.5 : 0.3, x: active ? 4 : 0 }}
                      className="flex items-center gap-3 text-sm"
                    >
                      <motion.span
                        animate={active ? { scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] } : {}}
                        transition={{ duration: 1.2, repeat: active ? Infinity : 0 }}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          active
                            ? "bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-md"
                            : done
                            ? "bg-emerald-500/20 text-emerald-500"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon size={14} />
                      </motion.span>
                      <span className={active ? "font-semibold text-foreground" : "text-muted-foreground"}>
                        {s.label}
                        {active && "..."}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
              {/* Shimmer skeleton */}
              <div className="mt-4 space-y-2">
                {[90, 75, 85, 60].map((w, i) => (
                  <motion.div
                    key={i}
                    className="h-3 rounded-full bg-gradient-to-r from-muted via-muted-foreground/20 to-muted bg-[length:200%_100%]"
                    style={{ width: `${w}%` }}
                    animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "linear", delay: i * 0.1 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 space-y-8">
          <AnimatePresence initial={false}>
            {results.map((r, i) => (
              <motion.article
                key={i + r.query}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                  <Sparkles size={16} className="text-indigo-500" />
                  {r.query}
                </h2>

                {r.sources.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Link2 size={10} /> {r.sources.length} sources
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {r.sources.map((s, idx) => {
                        let host = s.url;
                        try { host = new URL(s.url).hostname.replace("www.", ""); } catch {}
                        return (
                          <motion.a
                            key={idx}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ y: -3, scale: 1.02 }}
                            className="block p-2 rounded-xl border border-border bg-card/80 backdrop-blur hover:border-indigo-400/40 hover:shadow-md group"
                          >
                            <div className="flex items-center gap-1 text-[9px] text-muted-foreground mb-1">
                              <span className="w-4 h-4 rounded bg-gradient-to-br from-sky-500 to-indigo-600 text-white text-[8px] font-bold flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <span className="truncate">{host}</span>
                              <ExternalLink size={8} className="opacity-50 group-hover:opacity-100" />
                            </div>
                            <p className="text-[11px] font-semibold text-foreground line-clamp-2">{s.title}</p>
                          </motion.a>
                        );
                      })}
                    </div>
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative rounded-2xl border border-border bg-card/90 backdrop-blur p-5 shadow-md overflow-hidden"
                >
                  <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500" />
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{r.answer}</ReactMarkdown>
                  </div>
                </motion.div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default WadiSearch;