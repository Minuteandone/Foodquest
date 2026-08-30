// ============================================================
// FOOD QUEST — CUSTOM DATA FILE
// ============================================================
// This file is meant to be edited! Add your own foods, change
// XP values, or write new health facts. Each food needs:
//   id:     unique name (no spaces)
//   name:   what the player sees
//   emoji:  shown in the backpack and HUD
//   organ:  which organ it helps (must match an ORGANS key below)
//   xp:     how much XP it gives that organ
//   fact:   a kid-friendly health fact shown on pickup
//   color:  the 3D model's main color (hex)
//   shape:  "sphere" | "carrot" | "berry" | "broccoli" | "mushroom" | "nut" | "poop"
//   scale:  size of the 3D model (1 = normal)
// ============================================================

export const ORGANS = {
  love:  { name: "love",   emoji: "❤️", color: "#e74c3c" },
  stupid:  { name: "Stupidity",   emoji: "🧠", color: "#9b59b6" },
  sans:  { name: "Skeleton",   emoji: "🦴", color: "#ecf0f1" },
  mspam:{ name: "MMMMMMMMMMMMMMM", emoji: "💪", color: "#e67e22" },
  quote:   { name: "oh looky here, oh it's a wire, i am the best assistant! - toilet",    emoji: "👀", color: "#3498db" },
  confusemoji:  { name: "why is this the pregnant man emoji",   emoji: "🫃", color: "#2ecc71" },
  regret:  { name: "regret",   emoji: "😂", color: "#f06292" }
};

export const FOODS = [
  {
    id: "apple", name: "Apple", emoji: "🍎", organ: "love", xp: 10,
    fact: "Apples have... apples and stuff idk",
    color: "#e74c3c", shape: "sphere", scale: 1
  },
  {
    id: "cannot", name: "cannot", emoji: "🥕", organ: "quote", xp: 10,
    fact: "i cannot sleep",
    color: "#e67e22", shape: "carrot", scale: 1
  },
  {
    id: "blueberry", name: "Blueberries", emoji: "🫐", organ: "stupid", xp: 12,
    fact: "Blueberries are not blue! grrrr the betrayal... you should not eat this becuase we boycott them ok",
    color: "#34495e", shape: "berry", scale: 1
  },
  {
    id: "justanoval", name: "Mr shy frog", emoji: "🥦", organ: "sans", xp: 12,
    fact: "Mr. Shy Frog Oh how I've missed you I think that we should talk Every day",
    color: "#27ae60", shape: "broccoli", scale: 1
  },
  {
    id: "notcarrot", name: "not carrot", emoji: "🍌", organ: "mspam", xp: 10,
    fact: "this is not a carrot",
    color: "#f1c40f", shape: "carrot", scale: 0.9
  },
  {
    id: "wallnut", name: "Wallnut", emoji: "🌰", organ: "stupid", xp: 8,
    fact: "People wonder how I feel about getting constantly chewed on by zombies, says Wall-nut. What they don't realize is that with my limited senses all I can feel is a kind of tingling, like a relaxing backrub.",
    color: "#8d6e4a", shape: "nut", scale: 0.7
  },
  {
    id: "orange", name: "Orange", emoji: "🍊", organ: "confusemoji", xp: 10,
    fact: "Vsauce here! Oranges have vitamin C that helps your body fight off germs and colds! or do they?",
    color: "#f39c12", shape: "sphere", scale: 0.9
  },
  {
    id: "justanoval2", name: "it's a seal", emoji: "🥬", organ: "mspam", xp: 12,
    fact: "It's a seal coming down from my magical he is real dont you frown he cant live in the sea",
    color: "#1e8449", shape: "broccoli", scale: 0.8
  },
  {
    id: "pvz", name: "puffshroom", emoji: "🍄", organ: "confusemoji", xp: 8,
    fact: "i dont wanna paste from pvz again i'm too lazy",
    color: "#d35400", shape: "mushroom", scale: 1
  },
  {
    id: "stray", name: "paper stray", emoji: "🍓", organ: "love", xp: 8,
    fact: "made a typo but ill keep it lol",
    color: "#c0392b", shape: "berry", scale: 0.9
  },
  {
    id: "cherry", name: "Cherries", emoji: "🍒", organ: "eyes", xp: 8,
    fact: "cherry from inanimant instanty insant manity santy manty animate sanity",
    color: "#922b21", shape: "berry", scale: 0.8
  },
  {
    id: "ytshorts", name: "royal Pear", emoji: "🍐", organ: "sans", xp: 8,
    fact: "he's from youtuvbrse",
    color: "#a9c43c", shape: "sphere", scale: 0.95
  },
  {
    id: "poop", name: "regret", emoji: "💩", organ: "regret", xp: 15,
    fact: "WHATHAVEIDONEWHATHAVEIDONEWHATHAVEIDONEWHATHAVEIDONEWHATHAVEIDONEWHATHAVEIDONEWHATHAVEIDONEWHATHAVEIDONEWHATHAVEIDONEWHATHAVEIDONE",
    color: "#7b5230", shape: "poop", scale: 1
  }
];

// Bristol Stool Chart poop types, earned by trading foods at PooPoo Plaza.
// "damage" is how hard each poop hits the boss (equal to its Bristol type
// number; the Perfect Poop is mythic and hits for 10). Dog Water isn't
// thrown — it's placed as a slippery trap that makes the boss fall early.
export const POOP_TYPES = [
  {
    id: "pebbly", name: "Pebbly", emoji: "🪨💩", bristolType: 1, damage: 1,
    rarity: "Common", color: "#5c3d20",
    description: "Hard little separate lumps. You need more fiber and water!",
    bristolFact: "Bristol Type 1 — hard separate lumps. More fruits, veggies, and water will help!"
  },
  {
    id: "lil_lumpy", name: "Lil Lumpy", emoji: "💩", bristolType: 2, damage: 2,
    rarity: "Common", color: "#7b5230",
    description: "Sausage-shaped but lumpy. Getting better — keep eating your veggies!",
    bristolFact: "Bristol Type 2 — lumpy sausage shape. A bit more fiber and you'll level up!"
  },
  {
    id: "cracked", name: "Cracked", emoji: "💩〰️", bristolType: 3, damage: 3,
    rarity: "Uncommon", color: "#8B6340",
    description: "Sausage with cracks on the surface. Nice food variety! Almost perfect.",
    bristolFact: "Bristol Type 3 — sausage with cracks. Very healthy — great food variety!"
  },
  {
    id: "sigma_smooth", name: "Sigma Smooth", emoji: "💩✨", bristolType: 4, damage: 4,
    rarity: "Rare", color: "#9B7355",
    description: "Smooth, soft, and ideal! Your diet is SIGMA LEVEL balanced.",
    bristolFact: "Bristol Type 4 — smooth soft sausage. THE ideal poop. Your gut is thriving!"
  },
  {
    id: "dog_water", name: "Dog Water", emoji: "💩💧", bristolType: 5, damage: 5,
    rarity: "Common", color: "#6B4226",
    description: "Watery and all over the place. Try a more balanced diet, chief.",
    bristolFact: "Bristol Type 5 — mushy or watery. Eat more fiber-rich foods to firm things up!"
  },
  {
    id: "perfect_poop", name: "Perfect Poop", emoji: "💩👑", bristolType: "Mythic", damage: 10,
    rarity: 1000000, color: "#FFD700",
    description: "THE LEGENDARY PERFECT POOP. You have mastered every single food group!!",
    bristolFact: "Mythic rarity — only earned by the most dedicated explorer who collected 3 of EVERY food!"
  }
];

// The Gigantic iPad boss. Edit these to tune the battle!
export const BOSS = {
  name: "The Gigantic iPad",
  hp: 20,                 // boss health
  minPoops: 5,            // total poops needed to unlock the battle
  minFancyPoops: 2,       // ...of which this many must be fancy:
  fancyIds: ["cracked", "sigma_smooth", "perfect_poop"],
  hitDamage: 3,           // HP the player loses when the iPad hits them
  stepsPerCycle: 5,       // hops before it falls over
  stepDistance: 4.5,      // meters per hop
  chargeMultiplier: 2,    // charge speed = this × player walk speed
  throwRange: 30          // max poop throwing distance (meters)
};

// XP needed for each organ level: level 1 → 2 needs 50, then +25 per level.
export function xpForLevel(level) {
  return 50 + (level - 1) * 25;
}

// Level definitions. The first level is the Sunny Forest.
// More levels can be added here later (e.g. a beach, a mountain).
export const LEVELS = [
  {
    id: "forest",
    name: "Level 1 · Sunny Forest",
    size: 220,            // world is size x size meters
    treeCount: 140,
    rockCount: 30,
    flowerCount: 80,
    foodCount: 40,        // how many foods exist in the world at once
    respawnSeconds: 30,   // picked-up food regrows after this long
    skyColor: "#9ed6f2",
    fogColor: "#bfe3d0",
    groundColor: "#5fae5f"
  }
];
