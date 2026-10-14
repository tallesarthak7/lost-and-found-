const Item = require("../items/items.schema");
const Match = require("../matches/matches.schema");

async function matchEngine(baseItem) {
  const oppositeType = baseItem.type === "lost" ? "found" : "lost";

  const candidates = await Item.find({
    type: oppositeType,
    category: baseItem.category,
    status: "approved",
    isActive: true,
  });

  const matches = [];

  for (let c of candidates) {
    let score = 0;
    let reasons = [];

    // category
    if (baseItem.category === c.category) {
      score += 40;
      reasons.push("Same category");
    }

    // location
    if (baseItem.location === c.location) {
      score += 25;
      reasons.push("Same location");
    }

    // keywords
    const common = (baseItem.keywords || []).filter(k =>
      (c.keywords || []).includes(k)
    );

    if (common.length) {
      score += common.length * 10;
      reasons.push("Keyword match");
    }

    // date proximity
    const diff =
      Math.abs(new Date(baseItem.date) - new Date(c.date)) /
      (1000 * 60 * 60 * 24);

    if (diff <= 3) {
      score += 20;
      reasons.push("Close date");
    }

    if (score >= 50) {
      matches.push({
        lostItemId:
          baseItem.type === "lost" ? baseItem._id : c._id,
        foundItemId:
          baseItem.type === "found" ? baseItem._id : c._id,
        matchScore: score,
        matchReason: reasons.join(", "),
      });
    }
  }

  return matches;
}

module.exports = matchEngine;