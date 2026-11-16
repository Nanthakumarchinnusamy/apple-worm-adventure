
const API_BASE_URL = "http://127.0.0.1:8000/api/game";

export async function getLevels() {
  const response = await fetch(`${API_BASE_URL}/levels/`);

  if (!response.ok) {
    throw new Error("Failed to load game levels");
  }

  return response.json();
}

export async function getProgress() {
  const response = await fetch(`${API_BASE_URL}/progress/`);

  if (!response.ok) {
    throw new Error("Failed to load player progress");
  }

  const data = await response.json();

  if (data.status !== "success") {
    throw new Error("Unable to load player progress");
  }

  return data.progress;
}

export async function saveProgress(score, completedLevels) {
  const response = await fetch(`${API_BASE_URL}/progress/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      score,
      completed_levels: completedLevels,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to save player progress");
  }

  return response.json();
}
