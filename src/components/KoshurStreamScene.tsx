import { useEffect, useState } from "react";

/**
 * Snowy scene with a black bear running across — shown above Koshur 2.0
 * streaming responses to give a Kashmir-Valley vibe while typing.
 */
const KoshurStreamScene = ({ active = true }: { active?: boolean }) => {
  const [flakes] = useState(() =>
    Array.from({ length: 22 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 4,
      dur: 4 + Math.random() * 5,
      size: 6 + Math.random() * 10,
      opacity: 0.4 + Math.random() * 0.6,
    }))
  );

  return (
    <div
      className="relative w-full h-20 rounded-2xl overflow-hidden border border-teal-200/40 mb-2"
      style={{
        background:
          "linear-gradient(180deg, #cfe9ff 0%, #e9f3ff 55%, #f6fbff 100%)",
      }}
      aria-hidden
    >
      {/* Mountains */}
      <svg viewBox="0 0 300 80" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <polygon points="0,80 60,30 110,55 170,15 230,50 300,25 300,80" fill="#9bb6c9" opacity="0.55" />
        <polygon points="0,80 40,55 90,40 150,60 210,35 260,55 300,45 300,80" fill="#7a98ad" opacity="0.7" />
        {/* Snow caps */}
        <polygon points="60,30 70,38 50,38" fill="#fff" />
        <polygon points="170,15 182,28 158,28" fill="#fff" />
        <polygon points="300,25 290,33 310,33" fill="#fff" />
      </svg>

      {/* Snowy ground */}
      <div
        className="absolute bottom-0 left-0 right-0 h-4"
        style={{
          background:
            "repeating-linear-gradient(90deg, #ffffff 0 14px, #eef6ff 14px 28px)",
          animation: active ? "koshur-ground-scroll 1.6s linear infinite" : "none",
          backgroundSize: "200px 100%",
        }}
      />

      {/* Snowflakes */}
      {flakes.map((f) => (
        <span
          key={f.id}
          className="absolute text-white"
          style={{
            left: `${f.left}%`,
            top: 0,
            fontSize: f.size,
            opacity: f.opacity,
            animation: active
              ? `koshur-snow-fall ${f.dur}s linear ${f.delay}s infinite`
              : "none",
            textShadow: "0 0 4px rgba(120,160,200,0.6)",
          }}
        >
          ❄
        </span>
      ))}

      {/* Running black bear */}
      <div
        className="absolute bottom-3"
        style={{
          left: 0,
          width: "44px",
          height: "32px",
          animation: active ? "koshur-bear-run 4.5s linear infinite" : "none",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            animation: active ? "koshur-bear-bob 0.4s ease-in-out infinite" : "none",
          }}
        >
          {/* Bear silhouette */}
          <svg viewBox="0 0 60 40" className="w-full h-full drop-shadow-md">
            {/* body */}
            <ellipse cx="28" cy="24" rx="18" ry="11" fill="#15151a" />
            {/* head */}
            <circle cx="46" cy="18" r="9" fill="#15151a" />
            {/* ears */}
            <circle cx="42" cy="10" r="3" fill="#15151a" />
            <circle cx="50" cy="10" r="3" fill="#15151a" />
            {/* snout */}
            <ellipse cx="52" cy="20" rx="3.5" ry="2.5" fill="#3a2a22" />
            {/* eye */}
            <circle cx="47" cy="16" r="0.9" fill="#fff" />
            {/* legs */}
            <rect x="14" y="30" width="4" height="8" rx="2" fill="#15151a" />
            <rect x="22" y="30" width="4" height="8" rx="2" fill="#15151a" />
            <rect x="32" y="30" width="4" height="8" rx="2" fill="#15151a" />
            <rect x="40" y="30" width="4" height="8" rx="2" fill="#15151a" />
            {/* tail */}
            <circle cx="11" cy="22" r="2.5" fill="#15151a" />
          </svg>
        </div>
      </div>

      {/* Label */}
      <div className="absolute top-1.5 left-2 text-[10px] font-bold tracking-wide text-slate-700/80 bg-white/60 backdrop-blur px-2 py-0.5 rounded-full">
        ❄ Koshur 2.0 · کٲشُر
      </div>
    </div>
  );
};

export default KoshurStreamScene;
