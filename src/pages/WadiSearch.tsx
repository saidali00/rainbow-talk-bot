import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Loader2, ArrowLeft, ExternalLink, Sparkles, Globe2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Source { title: string; url: string; snippet: string; }
interface Result { query: string; answer: string; sources: Source[]; }

const SUGGESTED = [
  "Latest news from Kashmir today",
  "Best places to visit in Anantnag",
  "What is Lovable AI Gateway?",
  "Current weather in Srinagar",
  "Recent advancements in AI 2026",
];

const WadiSearch = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Result[]>([]);

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-background/70 border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Globe2 size={18} />
            </span>
            <div>
              <h1 className="text-base font-bold leading-tight">WadiSearch</h1>
              <p className="text-[10px] text-muted-foreground">Live web answers with sources</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Search bar */}
        <div className="relative gradient-border rounded-2xl shadow-lg">
          <div className="flex items-center gap-2 bg-card rounded-2xl p-2">
            <Search size={18} className="ml-2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && run(query)}
              placeholder="Ask anything — search the live web..."
              className="flex-1 bg-transparent text-sm py-2 focus:outline-none"
              disabled={loading}
            />
            <button
              onClick={() => run(query)}
              disabled={loading || !query.trim()}
              className="px-4 py-2 rounded-xl text-white text-sm font-semibold bg-gradient-to-br from-sky-500 to-indigo-600 disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Search"}
            </button>
          </div>
        </div>

        {results.length === 0 && !loading && (
          <div className="mt-6 animate-fade-in-up">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
              <Sparkles size={12} /> Try
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => run(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:bg-muted transition-all hover:shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground animate-fade-in">
            <Loader2 size={16} className="animate-spin" />
            Searching the web & synthesizing...
          </div>
        )}

        <div className="mt-6 space-y-8">
          {results.map((r, i) => (
            <article key={i} className="animate-fade-in-up">
              <h2 className="text-lg font-bold text-foreground mb-3">{r.query}</h2>

              {r.sources.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    {r.sources.length} sources
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {r.sources.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-2 rounded-xl border border-border bg-card hover:bg-muted transition-all hover:shadow-md group"
                      >
                        <div className="flex items-center gap-1 text-[9px] text-muted-foreground mb-1">
                          <span className="w-4 h-4 rounded bg-primary/15 text-primary text-[8px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="truncate">{new URL(s.url).hostname.replace("www.", "")}</span>
                          <ExternalLink size={8} className="opacity-50 group-hover:opacity-100" />
                        </div>
                        <p className="text-[11px] font-semibold text-foreground line-clamp-2">{s.title}</p>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{r.answer}</ReactMarkdown>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
};

export default WadiSearch;