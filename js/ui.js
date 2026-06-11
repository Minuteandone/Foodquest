// All HUD and panel logic: organ meters, backpack, pickup prompt,
// fact toasts, and menu wiring.

import { ORGANS, FOODS, POOP_TYPES, xpForLevel } from "../data/foods.js";

export function organLevel(totalXp) {
  let level = 1, remaining = totalXp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }
  return { level, intoLevel: remaining, needed: xpForLevel(level) };
}

export class UI {
  constructor(save) {
    this.save = save;
    this.factTimer = null;
    this.buildOrganPanel();
    this.refreshOrgans();
    this.refreshPlayerInfo();
  }

  buildOrganPanel() {
    const panel = document.getElementById("organ-panel");
    panel.innerHTML = "";
    this.bars = {};
    for (const [id, organ] of Object.entries(ORGANS)) {
      const row = document.createElement("div");
      row.className = "organ-row";
      row.innerHTML = `
        <span class="organ-emoji">${organ.emoji}</span>
        <div class="organ-meta">
          <span class="organ-label">${organ.name} <b class="organ-level"></b></span>
          <div class="organ-bar"><div class="organ-fill" style="background:${organ.color}"></div></div>
        </div>`;
      panel.appendChild(row);
      this.bars[id] = {
        fill: row.querySelector(".organ-fill"),
        level: row.querySelector(".organ-level"),
        row
      };
    }
  }

  refreshOrgans() {
    for (const id of Object.keys(ORGANS)) {
      const xp = this.save.organXp[id] || 0;
      const { level, intoLevel, needed } = organLevel(xp);
      this.bars[id].fill.style.width = `${Math.round((intoLevel / needed) * 100)}%`;
      this.bars[id].level.textContent = `Lv ${level}`;
    }
  }

  refreshPlayerInfo() {
    const totalXp = Object.values(this.save.organXp).reduce((a, b) => a + b, 0);
    document.getElementById("player-info").textContent =
      `${this.save.playerName} · ${this.save.totalPicked} foods · ${totalXp} XP`;
  }

  // Called when a food is picked up: pulse the meter and show the fact.
  onPickup(food) {
    this.refreshOrgans();
    this.refreshPlayerInfo();

    const bar = this.bars[food.organ];
    if (bar) {
      bar.row.classList.remove("pulse");
      void bar.row.offsetWidth; // restart the CSS animation
      bar.row.classList.add("pulse");
    }

    const organ = ORGANS[food.organ];
    this.showFact(
      `${food.emoji} ${food.name} → ${organ.emoji} ${organ.name} +${food.xp} XP`,
      food.fact
    );
  }

  // Toast with a title + body, used for pickups and shelf inspections.
  showFact(title, body) {
    document.getElementById("fact-title").textContent = title;
    document.getElementById("fact-body").textContent = body;
    const toast = document.getElementById("fact-toast");
    toast.classList.remove("hidden");
    clearTimeout(this.factTimer);
    this.factTimer = setTimeout(() => toast.classList.add("hidden"), 5000);
  }

  showPickupPrompt(food) {
    if (food) {
      this.showPrompt(`to pick up ${food.emoji} ${food.name}`);
    } else {
      this.hidePrompt();
    }
  }

  showSaved() {
    const el = document.getElementById("save-indicator");
    el.classList.remove("hidden");
    setTimeout(() => el.classList.add("hidden"), 1500);
  }

  refreshBackpack() {
    const grid = document.getElementById("backpack-grid");
    grid.innerHTML = "";
    let any = false;
    for (const food of FOODS) {
      const count = this.save.backpack[food.id] || 0;
      if (count === 0) continue;
      any = true;
      const organ = ORGANS[food.organ];
      const cell = document.createElement("div");
      cell.className = "backpack-item";
      cell.innerHTML = `
        <div class="bp-emoji">${food.emoji}</div>
        <div class="bp-name">${food.name}</div>
        <div class="bp-count">×${count}</div>
        <div class="bp-organ">${organ.emoji} ${organ.name}</div>`;
      grid.appendChild(cell);
    }
    if (!any) {
      grid.innerHTML = `<p class="bp-empty">Your backpack is empty.<br>Walk up to a food and press <kbd>F</kbd>!</p>`;
    }

    // Poop collection section
    const poops = this.save.poops || {};
    const poopEntries = POOP_TYPES.filter(p => (poops[p.id] || 0) > 0);
    if (poopEntries.length > 0) {
      const heading = document.createElement("h3");
      heading.className = "bp-section-title";
      heading.textContent = "💩 Poop Collection";
      grid.appendChild(heading);
      for (const poop of poopEntries) {
        const count = poops[poop.id];
        const cell = document.createElement("div");
        cell.className = "backpack-item poop-item";
        const isLegendary = poop.id === "perfect_poop";
        if (isLegendary) cell.classList.add("legendary-item");
        cell.innerHTML = `
          <div class="bp-emoji">${poop.emoji}</div>
          <div class="bp-name">${poop.name}</div>
          <div class="bp-count">×${count}</div>
          <div class="bp-organ">${isLegendary ? "✨ Mythic ✨" : `Bristol Type ${poop.bristolType}`}</div>`;
        grid.appendChild(cell);
      }
    }
  }

  // Generic action prompt, e.g. "to talk to Bristol 👴". The touch action
  // button stays visible so touchscreen players can do everything F does.
  showPrompt(text) {
    const prompt = document.getElementById("pickup-prompt");
    document.getElementById("pickup-food-name").textContent = text;
    prompt.classList.remove("hidden");
    document.getElementById("btn-pickup-touch").classList.remove("hidden");
  }

  hidePrompt() {
    document.getElementById("pickup-prompt").classList.add("hidden");
    document.getElementById("btn-pickup-touch").classList.add("hidden");
  }
}
