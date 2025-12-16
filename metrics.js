const presets = {
  "Michael Phelps": {
    sex: "M",
    age: 23,
    height: 193,
    weight: 88,
    wingspan: 203,
    torso: 70,
    leg: 96,
    shoulder: 52,
    waist: 80,
    hand: 21,
    foot: 31,
  },
  "Caeleb Dressel": {
    sex: "M",
    age: 24,
    height: 191,
    weight: 88,
    wingspan: 201,
    torso: 68,
    leg: 94,
    shoulder: 50,
    waist: 79,
    hand: 20,
    foot: 29,
  },
  "Bobby Finke": {
    sex: "M",
    age: 24,
    height: 183,
    weight: 77,
    wingspan: 191,
    torso: 66,
    leg: 90,
    shoulder: 48,
    waist: 76,
    hand: 19,
    foot: 28,
  },
  "Katie Ledecky": {
    sex: "F",
    age: 24,
    height: 183,
    weight: 70,
    wingspan: 191,
    torso: 67,
    leg: 88,
    shoulder: 46,
    waist: 73,
    hand: 19,
    foot: 27,
  },
  "Summer McIntosh": {
    sex: "F",
    age: 17,
    height: 182,
    weight: 70,
    wingspan: 190,
    torso: 66,
    leg: 86,
    shoulder: 45,
    waist: 70,
    hand: 18,
    foot: 26,
  },
};

function clamp(val, min = 0, max = 100) {
  return Math.min(max, Math.max(min, val));
}

function dps(distanceMeters, strokes) {
  return strokes > 0 ? distanceMeters / strokes : 0;
}

function strokeRate(strokes, timeSeconds) {
  return timeSeconds > 0 ? (strokes / timeSeconds) * 60 : 0;
}

function swolf(timeSeconds, strokes) {
  return (timeSeconds || 0) + (strokes || 0);
}

function cssPace100(t200Seconds, t400Seconds) {
  if (!t200Seconds || !t400Seconds || t400Seconds <= t200Seconds) return 0;
  return (t400Seconds - t200Seconds) / 2;
}

function zonesFromCSS(css100) {
  return {
    easy: css100 + 8,
    steady: css100 + 4,
    css: css100,
    speed: css100 - 4,
    sprint: css100 - 8,
  };
}

function worldAquaticsPoints(timeSeconds, baseTimeSeconds) {
  if (!timeSeconds || !baseTimeSeconds) return 0;
  return Math.floor(1000 * (baseTimeSeconds / timeSeconds) ** 3);
}

function computeMetrics(data) {
  const h = data.height;
  const w = data.weight;
  if (!h || !w) return null;
  const bmi = w / (h / 100) ** 2;
  const ape = (data.wingspan || h) - h;
  const shoulderRatio =
    data.shoulder && data.waist ? data.shoulder / data.waist : 1;
  const legRatio = data.leg ? data.leg / h : 0;
  const torsoRatio = data.torso ? data.torso / h : 0;
  const footRatio = data.foot ? data.foot / h : 0;

  const leverage = clamp(
    55 + ape * 2.5 + (shoulderRatio - 1.1) * 45 + (torsoRatio - 0.34) * 120,
  );
  const streamline = clamp(
    68 -
      (data.waist ? (data.waist / h) * 210 : 0) +
      (torsoRatio - 0.34) * 150 -
      (bmi - 22) * 4,
  );
  const kick = clamp(50 + footRatio * 480 + legRatio * 110 - (bmi - 22) * 4);
  const timing = clamp(
    50 +
      (torsoRatio / Math.max(legRatio, 0.01)) * 26 +
      (ape > 0 ? 8 : -6) +
      (shoulderRatio - 1.05) * 28,
  );

  const strokes = {
    Freestyle: 0,
    Backstroke: 0,
    Breaststroke: 0,
    Butterfly: 0,
  };
  if (ape > 5) {
    strokes.Freestyle += 2;
    strokes.Backstroke += 2;
    strokes.Butterfly += 1;
  }
  if (shoulderRatio > 1.4) {
    strokes.Freestyle += 1;
    strokes.Butterfly += 1;
  }
  if (footRatio > 0.16) {
    strokes.Breaststroke += 2;
    strokes.Butterfly += 1;
  }
  if (leverage > 65) {
    strokes.Freestyle += 2;
    strokes.Backstroke += 1;
  }
  if (kick > 60) {
    strokes.Butterfly += 1;
    strokes.Breaststroke += 1;
  }
  if (streamline > 65) {
    strokes.Backstroke += 1;
    strokes.Freestyle += 1;
  }
  if (timing > 60) {
    strokes.Breaststroke += 1;
    strokes.Butterfly += 1;
  }

  const distances = {
    "Sprint 50-100": 0,
    "Middle 200-400": 0,
    "Distance 800-1500": 0,
  };
  if (bmi < 20 || streamline > leverage) distances["Distance 800-1500"] += 2;
  else if (bmi < 23.5) distances["Middle 200-400"] += 2;
  else distances["Sprint 50-100"] += 2;

  if (kick > 65) distances["Sprint 50-100"] += 1;
  if (streamline > 70) distances["Middle 200-400"] += 1;
  if (leverage > 70) distances["Distance 800-1500"] += 1;
  if (bmi > 24) distances["Sprint 50-100"] += 1;

  const notes = {
    leverage:
      leverage >= 70
        ? "Long reach + broad shoulders feed the catch."
        : "Neutral reach - win with high elbow anchor.",
    streamline:
      streamline >= 68
        ? "Low drag frame keeps hips high in the lane."
        : "Protect line: squeeze the kick and chin position.",
    kick:
      kick >= 65
        ? "Fin-like feet and long legs fuel kick drive."
        : "Kick is neutral - train rhythm to lift hips.",
    timing:
      timing >= 62
        ? "Body ratios suit smooth timing changes."
        : "Use tempo trainers to sharpen timing.",
  };

  const highlights = [];
  if (ape > 5) highlights.push(`Wingspan surplus +${ape.toFixed(1)} cm`);
  if (footRatio > 0.16)
    highlights.push(`${data.foot} cm feet for strong kick lift`);
  if (shoulderRatio > 1.45)
    highlights.push(`${shoulderRatio.toFixed(2)} shoulder:waist pull frame`);
  if (highlights.length < 3 && bmi < 21.5)
    highlights.push("Lean profile reduces drag on every stroke");
  if (highlights.length < 3)
    highlights.push("Tempo + leverage hints update in real time");

  return {
    bmi: Math.round(bmi * 10) / 10,
    apeIndex: Math.round(ape * 10) / 10,
    strokes,
    distances,
    leverage,
    streamline,
    kick,
    timing,
    shoulderRatio,
    legRatio,
    torsoRatio,
    footRatio,
    notes,
    highlights,
  };
}

if (typeof module !== "undefined") {
  module.exports = {
    computeMetrics,
    presets,
    dps,
    strokeRate,
    swolf,
    cssPace100,
    zonesFromCSS,
    worldAquaticsPoints,
    clamp,
  };
}
