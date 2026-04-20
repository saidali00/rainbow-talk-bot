// ChatGPT-style minimal "running words" shimmer indicator for WadiX
const WadiTypingLoader = () => {
  return (
    <div className="inline-flex items-center py-1 animate-fade-in-up">
      <span
        className="text-sm font-medium bg-clip-text text-transparent"
        style={{
          backgroundImage:
            "linear-gradient(90deg, hsl(var(--muted-foreground) / 0.35) 0%, hsl(var(--foreground)) 50%, hsl(var(--muted-foreground) / 0.35) 100%)",
          backgroundSize: "200% 100%",
          animation: "wadi-shimmer 1.4s linear infinite",
        }}
      >
        Thinking…
      </span>
      <style>{`@keyframes wadi-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </div>
  );
};

export default WadiTypingLoader;
