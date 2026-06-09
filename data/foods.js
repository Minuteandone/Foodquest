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
  heart:  { name: "Heart",   emoji: "❤️", color: "#e74c3c" },
  brain:  { name: "Brain",   emoji: "🧠", color: "#9b59b6" },
  bones:  { name: "Bones",   emoji: "🦴", color: "#ecf0f1" },
  muscles:{ name: "Muscles", emoji: "💪", color: "#e67e22" },
  eyes:   { name: "Eyes",    emoji: "👀", color: "#3498db" },
  tummy:  { name: "Tummy",   emoji: "🫃", color: "#2ecc71" },
  funny:  { name: "Funny",   emoji: "😂", color: "#f06292" }
};

export const FOODS = [
  {
    id: "apple", name: "Apple", emoji: "🍎", organ: "heart", xp: 10,
    fact: "Apples have fiber that helps keep your heart healthy and pumping strong!",
    color: "#e74c3c", shape: "sphere", scale: 1
  },
  {
    id: "carrot", name: "Carrot", emoji: "🥕", organ: "eyes", xp: 10,
    fact: "Carrots are full of vitamin A, which helps your eyes see — even in the dark!",
    color: "#e67e22", shape: "carrot", scale: 1
  },
  {
    id: "blueberry", name: "Blueberries", emoji: "🫐", organ: "brain", xp: 12,
    fact: "Blueberries are brain berries! Their antioxidants help you think and remember.",
    color: "#34495e", shape: "berry", scale: 1
  },
  {
    id: "broccoli", name: "Broccoli", emoji: "🥦", organ: "bones", xp: 12,
    fact: "Broccoli is a little tree with big power — calcium and vitamin K for strong bones!",
    color: "#27ae60", shape: "broccoli", scale: 1
  },
  {
    id: "banana", name: "Banana", emoji: "🍌", organ: "muscles", xp: 10,
    fact: "Bananas have potassium that helps your muscles move and stops cramps!",
    color: "#f1c40f", shape: "carrot", scale: 0.9
  },
  {
    id: "walnut", name: "Walnut", emoji: "🌰", organ: "brain", xp: 8,
    fact: "Walnuts even look like tiny brains! Their healthy fats help your brain grow.",
    color: "#8d6e4a", shape: "nut", scale: 0.7
  },
  {
    id: "orange", name: "Orange", emoji: "🍊", organ: "tummy", xp: 10,
    fact: "Oranges have vitamin C that helps your body fight off germs and colds!",
    color: "#f39c12", shape: "sphere", scale: 0.9
  },
  {
    id: "spinach", name: "Spinach", emoji: "🥬", organ: "muscles", xp: 12,
    fact: "Spinach has iron that carries oxygen to your muscles — that's real superpower fuel!",
    color: "#1e8449", shape: "broccoli", scale: 0.8
  },
  {
    id: "mushroom", name: "Mushroom", emoji: "🍄", organ: "tummy", xp: 8,
    fact: "Mushrooms have vitamin D and fiber that keep your tummy happy and healthy.",
    color: "#d35400", shape: "mushroom", scale: 1
  },
  {
    id: "strawberry", name: "Strawberry", emoji: "🍓", organ: "heart", xp: 8,
    fact: "Strawberries are sweet AND heart-smart, with vitamins that protect your heart.",
    color: "#c0392b", shape: "berry", scale: 0.9
  },
  {
    id: "cherry", name: "Cherries", emoji: "🍒", organ: "eyes", xp: 8,
    fact: "Cherries have antioxidants that help protect your eyes from getting tired.",
    color: "#922b21", shape: "berry", scale: 0.8
  },
  {
    id: "pear", name: "Pear", emoji: "🍐", organ: "bones", xp: 8,
    fact: "Pears have vitamin K and minerals that help your bones grow tall and tough!",
    color: "#a9c43c", shape: "sphere", scale: 0.95
  },
  {
    id: "poop", name: "Poop", emoji: "💩", organ: "funny", xp: 15,
    fact: "Hehe... EWW! But guess what — everybody poops! Eating lots of fiber from fruits and veggies keeps your poops healthy. That's how you know your tummy is doing its job!",
    color: "#7b5230", shape: "poop", scale: 1
  }
];

// Bristol Stool Chart poop types, earned by trading foods at PooPoo Plaza.
export const POOP_TYPES = [
  {
    id: "pebbly", name: "Pebbly", emoji: "🪨💩", bristolType: 1,
    rarity: "Common", color: "#5c3d20",
    description: "Hard little separate lumps. You need more fiber and water!",
    bristolFact: "Bristol Type 1 — hard separate lumps. More fruits, veggies, and water will help!"
  },
  {
    id: "lil_lumpy", name: "Lil Lumpy", emoji: "💩", bristolType: 2,
    rarity: "Common", color: "#7b5230",
    description: "Sausage-shaped but lumpy. Getting better — keep eating your veggies!",
    bristolFact: "Bristol Type 2 — lumpy sausage shape. A bit more fiber and you'll level up!"
  },
  {
    id: "cracked", name: "Cracked", emoji: "💩〰️", bristolType: 3,
    rarity: "Uncommon", color: "#8B6340",
    description: "Sausage with cracks on the surface. Nice food variety! Almost perfect.",
    bristolFact: "Bristol Type 3 — sausage with cracks. Very healthy — great food variety!"
  },
  {
    id: "sigma_smooth", name: "Sigma Smooth", emoji: "💩✨", bristolType: 4,
    rarity: "Rare", color: "#9B7355",
    description: "Smooth, soft, and ideal! Your diet is SIGMA LEVEL balanced.",
    bristolFact: "Bristol Type 4 — smooth soft sausage. THE ideal poop. Your gut is thriving!"
  },
  {
    id: "dog_water", name: "Dog Water", emoji: "💩💧", bristolType: 5,
    rarity: "Common", color: "#6B4226",
    description: "Watery and all over the place. Try a more balanced diet, chief.",
    bristolFact: "Bristol Type 5 — mushy or watery. Eat more fiber-rich foods to firm things up!"
  },
  {
    id: "perfect_poop", name: "Perfect Poop", emoji: "💩👑", bristolType: "Mythic",
    rarity: 1000000, color: "#FFD700",
    description: "THE LEGENDARY PERFECT POOP. You have mastered every single food group!!",
    bristolFact: "Mythic rarity — only earned by the most dedicated explorer who collected 3 of EVERY food!"
  }
];

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
