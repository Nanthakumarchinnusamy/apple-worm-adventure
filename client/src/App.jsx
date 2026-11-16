import { useEffect, useState } from "react";
import {
  getLevels,
  getProgress,
  saveProgress,
} from "./services/gameApi";
import GameBoard from "./components/GameBoard";

export default function App() {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [completedLevels, setCompletedLevels] = useState(() => {
  try {
    return JSON.parse(
      localStorage.getItem("appleWormCompletedLevels") || "[]"
    );
  } catch {
    return [];
  }
});


  const [score, setScore] = useState(() => {
  try {
    return Number(localStorage.getItem("appleWormScore") || 0);
  } catch {
    return 0;
  }
});

  useEffect(() => {
    getLevels()
      .then((data) => setLevels(data.levels ?? []))
      .catch((err) => {
        console.error("Levels API error:", err);
        setError("Unable to load levels. Please check the backend.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
  let cancelled = false;

  getProgress()
    .then((progress) => {
      if (cancelled) return;

      setScore(progress.score);
      setCompletedLevels(progress.completed_levels);
    })
    .catch((err) => {
      console.error("Progress API error:", err);
      // Keep the existing localStorage values as a fallback.
    })
    .finally(() => {
      if (!cancelled) {
        setProgressLoaded(true);
      }
    });

  return () => {
    cancelled = true;
  };
}, []);

  const handleLevelComplete = (levelId) => {
  if (completedLevels.includes(levelId)) return;

  setCompletedLevels((previous) =>
    previous.includes(levelId) ? previous : [...previous, levelId]
  );

  setScore((previous) => previous + 50);
};

  useEffect(() => {
  localStorage.setItem(
    "appleWormCompletedLevels",
    JSON.stringify(completedLevels)
  );
}, [completedLevels]);



  useEffect(() => {
  localStorage.setItem("appleWormScore", String(score));
}, [score]);

  useEffect(() => {
  if (!progressLoaded) return;

  saveProgress(score, completedLevels).catch((err) => {
    console.error("Unable to save progress to Django:", err);
  });
}, [score, completedLevels, progressLoaded]);


  if (selectedLevel) {
    return (
      <GameBoard
  level={selectedLevel}
  onBack={() => setSelectedLevel(null)}
  onComplete={handleLevelComplete}
  score={score}
  onAppleCollected={() => setScore((previous) => previous + 10)}
/>
    );
  }

  const highestUnlockedLevel =
    completedLevels.length === 0
      ? 1
      : Math.max(...completedLevels) + 1;

  return (
    <main className="min-h-screen bg-gradient-to-b from-lime-50 to-emerald-100 px-4 py-10 text-emerald-950 sm:px-8">
      <header className="mx-auto max-w-5xl text-center">
        <div className="mb-4 text-6xl">🍎</div>

        <h1 className="text-3xl font-black tracking-tight text-green-800 sm:text-5xl md:text-6xl">
          APPLE WORM ADVENTURE
        </h1>

        <p className="mt-4 text-base text-green-900 sm:text-lg">
          🍏 Collect apples. Solve puzzles. Reach the goal!
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm">
            🧩 Puzzle Adventure
          </span>
          <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm">
            ⭐ Earn Rewards
          </span>
        </div>
      </header>

      <section className="mx-auto mt-12 max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">
              Choose Your Level
            </h2>
            <p className="mt-1 text-sm text-emerald-800">
              Complete levels to unlock your next challenge.
            </p>
          </div>

          <span className="rounded-xl bg-green-700 px-3 py-2 text-sm font-bold text-white">
            {completedLevels.length}/{levels.length} Completed
          </span>
        </div>

        {loading && (
          <p className="rounded-2xl bg-white p-6 text-center shadow">
            Loading your adventure...
          </p>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <p className="font-semibold">{error}</p>
            <p className="mt-2 text-sm">
              Open the browser console (F12) for the error details.
            </p>
          </div>
        )}

        {!loading && !error && levels.length === 0 && (
          <p className="rounded-2xl bg-white p-6 text-center shadow">
            No levels found. Add some levels to your database first.
          </p>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {levels.map((level) => {
            const levelId = level.level_id;
            const isCompleted = completedLevels.includes(levelId);
            const isUnlocked = levelId <= highestUnlockedLevel;

            return (
              <article
                key={levelId}
                className={`rounded-3xl border bg-white p-6 shadow-md transition duration-200 ${
                  isUnlocked
                    ? "border-green-100 hover:-translate-y-1 hover:shadow-xl"
                    : "border-gray-200 opacity-70"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-lime-100 px-3 py-1 text-sm font-bold text-green-800">
                    LEVEL {levelId}
                  </span>

                  <span className="text-3xl">
                    {isCompleted ? "🏆" : isUnlocked ? "🐛" : "🔒"}
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-bold">{level.name}</h3>

                <p className="mt-2 text-sm text-gray-600">
                  Grid: {level.grid_size} × {level.grid_size}
                </p>

                <p className="mt-3 text-sm font-semibold">
                  {isCompleted
                    ? "✅ Completed"
                    : isUnlocked
                      ? "🔓 Unlocked"
                      : "🔒 Complete the previous level first"}
                </p>

                <button
                  type="button"
                  disabled={!isUnlocked}
                  onClick={() => setSelectedLevel(level)}
                  className={`mt-6 w-full rounded-xl px-4 py-3 font-bold text-white transition focus:outline-none focus:ring-4 ${
                    isUnlocked
                      ? "bg-green-700 hover:bg-green-800 focus:ring-green-300"
                      : "cursor-not-allowed bg-gray-400"
                  }`}
                >
                  {isCompleted
                    ? "Replay Level ↻"
                    : isUnlocked
                      ? "Play Level →"
                      : "Locked 🔒"}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <footer className="mx-auto mt-16 max-w-5xl text-center text-sm text-green-800">
        APPLE WORM ADVENTURE · Collect, grow, and conquer!
      </footer>
    </main>
  );
}
