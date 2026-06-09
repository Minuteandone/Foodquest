// Save system: persists progress to localStorage and supports
// exporting/importing the save as a JSON file.

const SAVE_KEY = "foodquest-save-v1";

export function defaultSave(playerName) {
  return {
    version: 1,
    playerName: playerName || "Explorer",
    levelId: "forest",
    position: null,           // null = use level spawn point
    organXp: {},              // organId -> total xp
    backpack: {},             // foodId -> count collected (all time)
    totalPicked: 0,
    playSeconds: 0,
    savedAt: null
  };
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || data.version !== 1) return null;
    return data;
  } catch {
    return null;
  }
}

export function writeSave(save) {
  save.savedAt = new Date().toISOString();
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}

export function exportSave(save) {
  const blob = new Blob([JSON.stringify(save, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `foodquest-${save.playerName.replace(/\s+/g, "_")}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importSave(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data || data.version !== 1) throw new Error("Not a Food Quest save file");
        writeSave(data);
        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
