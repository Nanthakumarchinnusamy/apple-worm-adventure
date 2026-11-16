import Worm from "./Worm";
import { useCallback, useEffect, useState } from "react";

export default function GameBoard({
  level,
  onBack,
  onComplete,
  score = 0,
  onAppleCollected,
}) {
  const size = level.grid_size;

  const createInitialWorm = useCallback(
    () => [{ x: level.start.x, y: level.start.y }],
    [level]
  );

  const [worm, setWorm] = useState(createInitialWorm);
  const [apples, setApples] = useState(level.apples ?? []);
  const [moves, setMoves] = useState(0);
  const [status, setStatus] = useState("playing");
  const [direction, setDirection] = useState({ x: 1, y: 0 });

  // Reset / sync whenever level changes
  useEffect(() => {
    setWorm(createInitialWorm());
    setApples(level.apples ?? []);
    setMoves(0);
    setStatus("playing");
    setDirection({ x: 1, y: 0 });
  }, [level, createInitialWorm]);

  const resetGame = useCallback(() => {
    setWorm(createInitialWorm());
    setApples(level.apples ?? []);
    setMoves(0);
    setStatus("playing");
    setDirection({ x: 1, y: 0 });
  }, [level, createInitialWorm]);

  const isAt = (pos, x, y) => pos?.x === x && pos?.y === y;

  const moveWorm = useCallback(
    (dx, dy) => {
      if (status !== "playing") return;

      const head = worm[0];
      const neck = worm[1];

      let next = {
        x: head.x + dx,
        y: head.y + dy,
      };

      // 1. Prevent 180° instant suicide into neck
      if (neck && next.x === neck.x && next.y === neck.y) {
        return;
      }

      setDirection({ x: dx, y: dy });

      // 2. Out of bounds check
      if (next.x < 0 || next.x >= size || next.y < 0 || next.y >= size) {
        setStatus("lost");
        return;
      }

      // 3. Wall collision check
      const hitWall = (level.walls ?? []).some(
        (wall) => wall.x === next.x && wall.y === next.y
      );

      if (hitWall) {
        setStatus("lost");
        return;
      }

      // 4. PORTAL TELEPORTATION (One-way pass between portals)
      const portals = level.portals ?? [];
      const portalIndex = portals.findIndex(
        (p) => p.x === next.x && p.y === next.y
      );

      if (portalIndex !== -1 && portals.length > 1) {
        // Teleport to the next portal in the array (A -> B, B -> A)
        const destinationPortal = portals[(portalIndex + 1) % portals.length];
        next = { x: destinationPortal.x, y: destinationPortal.y };
      }

      const ateApple = apples.some(
        (apple) => apple.x === next.x && apple.y === next.y
      );

      const nextWorm = [next, ...worm];

      if (!ateApple) {
        nextWorm.pop();
      }

      // 5. Body collision check
      if (
        nextWorm.slice(1).some(
          (seg) => seg.x === next.x && seg.y === next.y
        )
      ) {
        setStatus("lost");
        return;
      }

      setWorm(nextWorm);
      setMoves((count) => count + 1);

      if (ateApple) {
  setApples((remaining) =>
    remaining.filter(
      (apple) => !(apple.x === next.x && apple.y === next.y)
    )
  );

  onAppleCollected?.();
}

      // 6. ONLY the goal ends the level
      if (level.goal && next.x === level.goal.x && next.y === level.goal.y) {
  setStatus("won");
  onComplete?.(level.level_id);
}
    },
    [status, worm, apples, size, level, onComplete, onAppleCollected]
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      const directions = {
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        w: [0, -1],
        s: [0, 1],
        a: [-1, 0],
        d: [1, 0],
      };

      const dir = directions[event.key];
      if (dir) {
        event.preventDefault();
        moveWorm(dir[0], dir[1]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [moveWorm]);

  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden px-4 py-4 select-none"
      style={{
        background:
          "linear-gradient(180deg, #2a206b 0%, #4a3e87 25%, #d1837c 65%, #f1a980 90%, #f6bd9b 100%)",
        fontFamily: "'Fredoka', 'Nunito', 'Segoe UI', cursive, sans-serif",
      }}
    >
      {/* Background City Skyline */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-0 flex h-72 items-end justify-between opacity-35">
        <div className="h-44 w-20 bg-cyan-900 rounded-t-sm" />
        <div className="h-60 w-16 bg-cyan-950 rounded-t-sm" />
        <div className="h-32 w-28 bg-cyan-900 rounded-t-sm" />
        <div className="h-52 w-24 bg-cyan-950 rounded-t-sm" />
        <div className="h-64 w-20 bg-cyan-900 rounded-t-sm" />
        <div className="h-40 w-32 bg-cyan-950 rounded-t-sm" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 flex w-full max-w-xl items-center justify-between text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
        <div className="text-left">
  <p className="text-lg font-black tracking-wide">
    Moves: {moves}
  </p>
  <p className="text-lg font-black tracking-wide">
    Score: {score} ⭐
  </p>
</div>
        <h1 className="text-3xl font-black uppercase tracking-wider">
          Level {level.level_id || level.id || 3}
        </h1>
        <button
          onClick={onBack}
          className="rounded-xl border-2 border-emerald-400 bg-gradient-to-b from-emerald-500 to-green-700 px-4 py-2 font-black text-sm uppercase text-white shadow-[0_4px_0_#14532d] active:translate-y-1 active:shadow-none"
        >
          Back to Levels
        </button>
      </header>

      {/* Game Grid */}
      <div className="relative z-10 my-auto flex items-center justify-center">
        <div
          className="relative grid aspect-square w-[min(88vw,480px)] overflow-hidden rounded-md border-[3px] border-[#382618]/60 bg-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-[1px]"
          style={{
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: size * size }, (_, index) => {
            const x = index % size;
            const y = Math.floor(index / size);

            const isWall = (level.walls ?? []).some(
              (w) => w.x === x && w.y === y
            );
            const isApple = apples.some((a) => a.x === x && a.y === y);
            const isPortal = (level.portals ?? []).some(
              (p) => p.x === x && p.y === y
            );
            const isGoal = isAt(level.goal, x, y);

            return (
              <div
                key={`${x}-${y}`}
                className="relative flex aspect-square items-center justify-center border border-white/20"
              >
                {/* Wall Block */}
                {isWall && (
                  <div
                    className="absolute inset-[-1px] z-10 rounded-[4px] border border-[#52331c] shadow-inner"
                    style={{
                      background:
                        "linear-gradient(180deg, #94633b 0%, #754a27 30%, #5d381c 100%)",
                      boxShadow:
                        "inset 0 2px 0 rgba(255,255,255,0.25), inset 0 -2px 0 rgba(0,0,0,0.35)",
                    }}
                  />
                )}

                {/* Apple */}
                {isApple && (
                  <div className="relative z-10 flex h-4/5 w-4/5 items-center justify-center">
                    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]">
                      <defs>
                        <radialGradient id="appleGrad" cx="35%" cy="35%" r="65%">
                          <stop offset="0%" stopColor="#ff5757" />
                          <stop offset="50%" stopColor="#e51717" />
                          <stop offset="100%" stopColor="#800606" />
                        </radialGradient>
                      </defs>
                      <path d="M 52 26 C 60 12 75 14 74 24 C 68 28 58 26 52 26 Z" fill="#50be25" stroke="#2f7811" strokeWidth="2" />
                      <path d="M 50 30 C 50 18 45 14 41 12" stroke="#5c381c" strokeWidth="4" fill="none" strokeLinecap="round" />
                      <path d="M 50 34 C 36 22 18 28 18 52 C 18 78 36 90 50 88 C 64 90 82 78 82 52 C 82 28 64 22 50 34 Z" fill="url(#appleGrad)" stroke="#6b0606" strokeWidth="2.5" />
                      <ellipse cx="34" cy="46" rx="9" ry="14" fill="#ffffff" opacity="0.4" transform="rotate(-20 34 46)" />
                    </svg>
                  </div>
                )}

                {/* 1. ONE-WAY PORTAL (Cyan Glow: Teleports between (1,2) and (4,3)) */}
                {isPortal && (
                  <div className="relative z-10 flex h-4/5 w-4/5 items-center justify-center">
                    <div className="absolute inset-0 animate-ping rounded-full bg-cyan-400 opacity-20" />
                    <svg viewBox="0 0 100 100" className="h-full w-full animate-spin [animation-duration:5s] drop-shadow-[0_0_12px_#38bdf8]">
                      <circle cx="50" cy="50" r="46" fill="#082f49" stroke="#38bdf8" strokeWidth="4" />
                      <circle cx="50" cy="50" r="35" fill="#031826" stroke="#22d3ee" strokeWidth="3" strokeDasharray="14 8" />
                      <circle cx="50" cy="50" r="22" fill="#000000" stroke="#67e8f9" strokeWidth="2" strokeDasharray="8 6" />
                      <circle cx="50" cy="50" r="8" fill="#000000" />
                    </svg>
                  </div>
                )}

                {/* 2. FINAL DESTINATION (Purple Cosmic Vortex: Solves the Level at (5,0)) */}
                {isGoal && (
                  <div className="relative z-10 flex h-4/5 w-4/5 items-center justify-center">
                    <div className="absolute inset-0 animate-pulse rounded-full bg-fuchsia-500 opacity-30" />
                    <svg viewBox="0 0 100 100" className="h-full w-full animate-spin [animation-duration:9s] drop-shadow-[0_0_14px_#d946ef]">
                      <circle cx="50" cy="50" r="46" fill="#240733" stroke="#d946ef" strokeWidth="4" />
                      <circle cx="50" cy="50" r="35" fill="#13031c" stroke="#f472b6" strokeWidth="3.5" strokeDasharray="16 8" />
                      <circle cx="50" cy="50" r="22" fill="#000000" stroke="#f0abfc" strokeWidth="2.5" strokeDasharray="10 6" />
                      <circle cx="50" cy="50" r="8" fill="#000000" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}

          <Worm segments={worm} size={size} direction={direction} />
        </div>
      </div>

      {/* Outcome Banner */}
      {status !== "playing" && (
        <div
          className={`relative z-20 my-2 rounded-2xl border-4 px-6 py-2 text-center text-lg font-black uppercase tracking-wider text-white shadow-lg ${
            status === "won"
              ? "border-emerald-300 bg-emerald-600"
              : "border-red-400 bg-red-600"
          }`}
        >
          {status === "won" ? "Level Solved! 🎉" : "Hit a Wall! Try Again 💥"}
        </div>
      )}

      {/* D-Pad & Controls */}
      <footer className="relative z-10 flex w-full max-w-xl flex-col items-center gap-4 pb-2">
        <div className="flex flex-col items-center">
          <button
            onClick={() => moveWorm(0, -1)}
            className="h-14 w-14 rounded-2xl border-2 border-[#543825] bg-gradient-to-b from-[#a47148] to-[#6d4424] text-2xl font-black text-[#fdebd0] shadow-[0_4px_0_#382112] active:translate-y-1 active:shadow-none"
            aria-label="Up"
          >
            ▲
          </button>
          <div className="mt-1 flex gap-2">
            <button
              onClick={() => moveWorm(-1, 0)}
              className="h-14 w-14 rounded-2xl border-2 border-[#543825] bg-gradient-to-b from-[#a47148] to-[#6d4424] text-2xl font-black text-[#fdebd0] shadow-[0_4px_0_#382112] active:translate-y-1 active:shadow-none"
              aria-label="Left"
            >
              ◀
            </button>
            <button
              onClick={() => moveWorm(0, 1)}
              className="h-14 w-14 rounded-2xl border-2 border-[#543825] bg-gradient-to-b from-[#a47148] to-[#6d4424] text-2xl font-black text-[#fdebd0] shadow-[0_4px_0_#382112] active:translate-y-1 active:shadow-none"
              aria-label="Down"
            >
              ▼
            </button>
            <button
              onClick={() => moveWorm(1, 0)}
              className="h-14 w-14 rounded-2xl border-2 border-[#543825] bg-gradient-to-b from-[#a47148] to-[#6d4424] text-2xl font-black text-[#fdebd0] shadow-[0_4px_0_#382112] active:translate-y-1 active:shadow-none"
              aria-label="Right"
            >
              ▶
            </button>
          </div>
        </div>

        <div className="flex w-full justify-center gap-4">
          <button
            onClick={onBack}
            className="flex-1 max-w-[180px] rounded-2xl border-2 border-emerald-400 bg-gradient-to-b from-emerald-500 to-green-700 py-3 font-black text-sm uppercase tracking-wider text-white shadow-[0_4px_0_#14532d] active:translate-y-1 active:shadow-none"
          >
            Back to Levels
          </button>
          <button
            onClick={resetGame}
            className="flex-1 max-w-[180px] rounded-2xl border-2 border-[#6f4b30] bg-gradient-to-b from-[#b27d53] to-[#794c28] py-3 font-black text-sm uppercase tracking-wider text-[#fbeade] shadow-[0_4px_0_#3b2210] active:translate-y-1 active:shadow-none"
          >
            Restart Level
          </button>
        </div>
      </footer>
    </main>
  );
}