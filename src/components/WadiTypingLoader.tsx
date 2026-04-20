// ChatGPT-style minimal "running words" indicator for WadiX
const WadiTypingLoader = () => {
  return (
    <div className="inline-flex items-center gap-1.5 py-1 animate-fade-in-up">
      <span className="text-sm font-medium bg-gradient-to-r from-foreground/30 via-foreground to-foreground/30 bg-[length:200%_100%] bg-clip-text text-transparent animate-shimmer">
        Thinking…
      </span>
    </div>
  );
};

export default WadiTypingLoader;
