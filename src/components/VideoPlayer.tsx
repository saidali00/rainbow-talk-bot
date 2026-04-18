import { useEffect, useState } from "react";
import { Download, Pause, Play } from "lucide-react";

interface VideoPlayerProps {
  frames: string[];
  prompt: string;
}

const VideoPlayer = ({ frames, prompt }: VideoPlayerProps) => {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  // 10 second video / frames = ms per frame
  const frameMs = (10 * 1000) / Math.max(frames.length, 1);

  useEffect(() => {
    if (!playing || frames.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % frames.length);
    }, frameMs);
    return () => clearInterval(id);
  }, [playing, frames.length, frameMs]);

  if (!frames.length) return null;

  return (
    <div className="relative group rounded-2xl overflow-hidden border-2 border-primary/30 shadow-lg animate-scale-in bg-black">
      <img
        src={frames[index]}
        alt={prompt}
        className="w-full max-h-96 object-contain transition-opacity duration-300"
      />
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-foreground/20">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-500 transition-all"
          style={{ width: `${((index + 1) / frames.length) * 100}%` }}
        />
      </div>
      {/* Controls */}
      <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="p-2 rounded-xl bg-foreground/70 text-background hover:bg-foreground"
          title={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <a
          href={frames[index]}
          download={`manzarx-frame-${index + 1}.png`}
          className="p-2 rounded-xl bg-foreground/70 text-background hover:bg-foreground"
          title="Download current frame"
        >
          <Download size={14} />
        </a>
      </div>
      <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-foreground/70 text-background text-[10px] font-bold">
        ManzarX • 10s
      </div>
    </div>
  );
};

export default VideoPlayer;
