(function () {
  const fields = [
    "sex",
    "age",
    "height",
    "weight",
    "wingspan",
    "torso",
    "leg",
    "shoulder",
    "waist",
    "hand",
    "foot",
  ];
  const inputs = {};
  fields.forEach((f) => (inputs[f] = document.getElementById(f)));

  const presetSelect = document.getElementById("preset");
  Object.keys(presets).forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    presetSelect.appendChild(opt);
  });

  presetSelect.addEventListener("change", (e) => {
    const p = presets[e.target.value];
    if (!p) return;
    fields.forEach((f) => {
      if (p[f] !== undefined) inputs[f].value = p[f];
    });
    update();
  });

  document
    .querySelectorAll("input, select")
    .forEach((el) => el.addEventListener("input", update));

  function gather() {
    const data = {};
    fields.forEach((f) => {
      const v = parseFloat(inputs[f].value);
      if (!isNaN(v)) data[f] = v;
    });
    data.sex = inputs.sex.value;
    return data;
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function setMeter(prefix, value, note) {
    const clamped = Math.max(0, Math.min(100, Math.round(value)));
    setText(`${prefix}Score`, clamped);
    const bar = document.getElementById(`${prefix}Bar`);
    if (bar) bar.style.setProperty("--meter", `${clamped}%`);
    const noteEl = document.getElementById(`${prefix}Note`);
    if (noteEl) noteEl.textContent = note || "";
  }

  function bmiNote(bmi) {
    if (!bmi) return " - ";
    if (bmi < 18.5) return "Ultra-lean: layer power and kicks.";
    if (bmi < 21.5) return "Race lean with naturally low drag.";
    if (bmi < 24.5) return "Power-to-drag balanced for most events.";
    return "Power heavy: streamline and rhythm matter most.";
  }

  function physiqueLabel(bmi) {
    if (!bmi) return "Frame";
    if (bmi < 19) return "Feather-light";
    if (bmi < 22.5) return "Lean racer";
    if (bmi < 24.5) return "Balanced power";
    return "Power sprinter";
  }

  function distanceNoteFrom(key) {
    switch (key) {
      case "Sprint 50-100":
        return "Explosive turnover, best for short-course pop.";
      case "Middle 200-400":
        return "Blend of length + aerobic rhythm for mid-distance.";
      case "Distance 800-1500":
        return "Economy build that likes steady gears.";
      default:
        return " - ";
    }
  }

  function renderCallouts(highlights) {
    const wrap = document.getElementById("callouts");
    if (!wrap) return;
    wrap.innerHTML = "";
    const list =
      highlights && highlights.length
        ? highlights.slice(0, 3)
        : ["Neutral build - dial the sliders."];
    list.forEach((text) => {
      const pill = document.createElement("span");
      pill.className = "pill";
      pill.textContent = text;
      wrap.appendChild(pill);
    });
  }

  function strokeDescriptor(name, data, metrics) {
    if (!metrics) return " - ";
    if (name === "Freestyle") {
      return metrics.leverage > 70
        ? "Long line catch - ride distance per stroke early."
        : "Neutral reach: tempo and turns drive speed.";
    }
    if (name === "Backstroke") {
      return metrics.streamline > 65
        ? "Slim profile keeps hips high; spin the tempo."
        : "Stay compact on rotation to hold a clean line.";
    }
    if (name === "Breaststroke") {
      return metrics.timing > 60
        ? "Torso / leg timing suits a snap kick and glide."
        : "Shorten the pullout and protect streamline.";
    }
    if (name === "Butterfly") {
      return metrics.kick > 65
        ? "Kick drive supports two-beat rhythm on the surface."
        : "Keep undulation compact and breathe inside the line.";
    }
    return " - ";
  }

  function update() {
    const data = gather();
    const m = computeMetrics(data);
    if (!m) return;

    const strokeEntries = Object.entries(m.strokes).sort((a, b) => b[1] - a[1]);
    const distEntries = Object.entries(m.distances).sort((a, b) => b[1] - a[1]);

    setText("bmi", m.bmi.toFixed(1));
    setText("bmiNote", bmiNote(m.bmi));
    setText("ape", m.apeIndex.toFixed(1));
    setText("wingspanStat", `${data.wingspan || data.height || 0} cm`);
    setText(
      "spanNote",
      `${m.apeIndex >= 0 ? "+" : ""}${m.apeIndex.toFixed(1)} cm over height`,
    );
    setText("frameStat", `${m.shoulderRatio.toFixed(2)} :1 shoulder / waist`);
    setText(
      "frameNote",
      m.shoulderRatio > 1.4
        ? "Broad shoulders feed pull leverage."
        : "Tighter frame - win with precision catch.",
    );
    setText("footStat", `${data.foot || 0} cm feet`);
    setText(
      "footNote",
      m.footRatio > 0.16
        ? "Fin-like feet give easy kick lift."
        : "Neutral kick length - train cadence.",
    );

    setText("heightBadge", `${data.height || 0} cm height`);
    setText("spanBadge", `${data.wingspan || data.height || 0} cm wingspan`);
    setText("torsoBadge", `Torso ${data.torso || 0} / Leg ${data.leg || 0} cm`);

    setText(
      "stroke",
      strokeEntries
        .slice(0, 2)
        .map((s) => s[0])
        .join(", "),
    );
    setText("strokeNote", strokeDescriptor(strokeEntries[0][0], data, m));
    setText("distance", distEntries[0][0]);
    setText("distanceNote", distanceNoteFrom(distEntries[0][0]));

    setText("physiqueTag", physiqueLabel(m.bmi));

    setMeter("leverage", m.leverage, m.notes.leverage);
    setMeter("streamline", m.streamline, m.notes.streamline);
    setMeter("kick", m.kick, m.notes.kick);
    setMeter("timing", m.timing, m.notes.timing);

    renderCallouts(m.highlights);
    drawSilhouette(data, m);
    drawMini(data, m);
  }

  const NS = "http://www.w3.org/2000/svg";

  function buildSwimmer(data, scale, options = {}) {
    const g = document.createElementNS(NS, "g");
    const torsoH = (data.torso || 70) * scale;
    const legH = (data.leg || 90) * scale;
    const shoulderW = (data.shoulder || 40) * scale;
    const armL = Math.max(
      (((data.wingspan || data.height || 180) - (data.shoulder || 40)) / 2) *
        scale *
        0.95,
      18 * scale,
    );
    const headR = (options.head || 9) * scale;
    const limbW = (options.limb || 4.4) * scale;
    const waistAdjust = data.waist ? (data.waist - 70) * scale * 0.1 : 0;
    const waistW = Math.max(shoulderW * 0.62, shoulderW * 0.7 + waistAdjust);
    const hipW = waistW * 1.05;
    const topY = headR * 1.6;
    const hipY = topY + torsoH;
    const kneeY = hipY + legH * 0.55;
    const footY = hipY + legH;

    const head = document.createElementNS(NS, "circle");
    head.setAttribute("cx", 0);
    head.setAttribute("cy", headR);
    head.setAttribute("r", headR);
    head.setAttribute("class", "joint");
    g.appendChild(head);

    const torso = document.createElementNS(NS, "path");
    const halfShoulder = shoulderW / 2;
    const halfWaist = waistW / 2;
    const halfHip = hipW / 2;
    const torsoPath = [
      `M ${-halfShoulder} ${topY}`,
      `C ${-halfShoulder * 1.05} ${topY + torsoH * 0.32} ${-halfWaist} ${topY + torsoH * 0.62} ${-halfHip} ${hipY}`,
      `L ${halfHip} ${hipY}`,
      `C ${halfWaist} ${topY + torsoH * 0.62} ${halfShoulder * 1.05} ${topY + torsoH * 0.32} ${halfShoulder} ${topY}`,
      "Z",
    ].join(" ");
    torso.setAttribute("d", torsoPath);
    torso.setAttribute("class", "body");
    g.appendChild(torso);

    const spine = document.createElementNS(NS, "path");
    spine.setAttribute("d", `M 0 ${topY * 0.75} L 0 ${footY}`);
    spine.setAttribute("class", "spine");
    g.appendChild(spine);

    function limbGroup(x, y, path, extraClass) {
      const group = document.createElementNS(NS, "g");
      group.setAttribute("transform", `translate(${x},${y})`);
      path.setAttribute("class", `limb ${extraClass || ""}`.trim());
      path.setAttribute("stroke-width", limbW);
      group.appendChild(path);
      const joint = document.createElementNS(NS, "circle");
      const end = path.getPointAtLength(path.getTotalLength());
      joint.setAttribute("cx", end.x);
      joint.setAttribute("cy", end.y);
      joint.setAttribute("r", limbW * 0.6);
      joint.setAttribute("class", "joint");
      group.appendChild(joint);
      return group;
    }

    const leftArmPath = document.createElementNS(NS, "path");
    leftArmPath.setAttribute(
      "d",
      `M 0 0 Q ${-limbW * 0.8} ${-armL * 0.45} ${-limbW * 0.3} ${-armL * 0.8} T 0 ${-armL}`,
    );
    const leftArm = limbGroup(-halfShoulder, topY, leftArmPath, "arm");
    g.appendChild(leftArm);

    const rightArmPath = document.createElementNS(NS, "path");
    rightArmPath.setAttribute(
      "d",
      `M 0 0 Q ${limbW * 0.8} ${-armL * 0.45} ${limbW * 0.3} ${-armL * 0.8} T 0 ${-armL}`,
    );
    const rightArm = limbGroup(halfShoulder, topY, rightArmPath, "arm");
    g.appendChild(rightArm);

    const leftLegPath = document.createElementNS(NS, "path");
    leftLegPath.setAttribute(
      "d",
      `M 0 0 Q ${-limbW * 0.6} ${legH * 0.35} ${-limbW * 0.2} ${kneeY - hipY} T 0 ${footY - hipY}`,
    );
    const leftLeg = limbGroup(-halfHip * 0.55, hipY, leftLegPath, "leg");
    g.appendChild(leftLeg);

    const rightLegPath = document.createElementNS(NS, "path");
    rightLegPath.setAttribute(
      "d",
      `M 0 0 Q ${limbW * 0.6} ${legH * 0.35} ${limbW * 0.2} ${kneeY - hipY} T 0 ${footY - hipY}`,
    );
    const rightLeg = limbGroup(halfHip * 0.55, hipY, rightLegPath, "leg");
    g.appendChild(rightLeg);

    return { g, leftArm, rightArm, leftLeg, rightLeg };
  }

  function drawSilhouette(data, metrics) {
    const svg = document.getElementById("silhouette");
    const guides = svg ? svg.querySelector(".guides") : null;
    const person = document.getElementById("person");
    if (!svg || !guides || !person) return;
    guides.innerHTML = "";
    person.innerHTML = "";

    const scale = 210 / (data.height || 180);
    const fig = buildSwimmer(data, scale, { strokeWidth: 4 });
    fig.g.setAttribute("transform", "translate(120,12)");

    const heightGuide = document.createElementNS(NS, "line");
    heightGuide.setAttribute("x1", "210");
    heightGuide.setAttribute("x2", "210");
    heightGuide.setAttribute("y1", "14");
    heightGuide.setAttribute("y2", "240");
    heightGuide.setAttribute("class", "guide");
    guides.appendChild(heightGuide);

    const spanGuide = document.createElementNS(NS, "line");
    spanGuide.setAttribute("x1", "40");
    spanGuide.setAttribute("x2", "210");
    spanGuide.setAttribute("y1", "34");
    spanGuide.setAttribute("y2", "34");
    spanGuide.setAttribute("class", "guide");
    guides.appendChild(spanGuide);

    person.appendChild(fig.g);
  }

  function addRotate(el, from, to, dur, begin) {
    const anim = document.createElementNS(NS, "animateTransform");
    anim.setAttribute("attributeName", "transform");
    anim.setAttribute("type", "rotate");
    anim.setAttribute("from", `${from} 0 0`);
    anim.setAttribute("to", `${to} 0 0`);
    anim.setAttribute("dur", dur);
    anim.setAttribute("repeatCount", "indefinite");
    if (begin) anim.setAttribute("begin", begin);
    el.appendChild(anim);
  }

  function drawMini(data, metrics) {
    document.querySelectorAll(".miniStroke").forEach((panel) => {
      const name = panel.dataset.label;
      const container = panel.querySelector(".miniPerson");
      if (!container) return;
      container.innerHTML = "";
      const score = metrics.strokes[name] || 0;
      panel.classList.remove("good", "ok", "poor");
      if (score >= 3) panel.classList.add("good");
      else if (score > 0) panel.classList.add("ok");
      else panel.classList.add("poor");

      const scoreEl = panel.querySelector(".lane-score");
      if (scoreEl) scoreEl.textContent = score.toFixed(1);
      const hint = panel.querySelector(".lane-hint");
      if (hint) hint.textContent = strokeDescriptor(name, data, metrics);

      const scale = 26 / ((data.torso || 70) + (data.leg || 90));
      const fig = buildSwimmer(data, scale, {
        strokeWidth: 3,
        head: 8,
        limb: 3.4,
      });
      fig.g.setAttribute("transform", "translate(36,64) rotate(90)");

      const mover = document.createElementNS(NS, "g");
      mover.appendChild(fig.g);
      const swim = document.createElementNS(NS, "animateTransform");
      swim.setAttribute("attributeName", "transform");
      swim.setAttribute("type", "translate");
      swim.setAttribute("values", "0 0; 150 0; 0 0");
      swim.setAttribute("dur", name === "Breaststroke" ? "3.4s" : "2.6s");
      swim.setAttribute("repeatCount", "indefinite");
      mover.appendChild(swim);
      container.appendChild(mover);

      if (name === "Freestyle" || name === "Backstroke") {
        addRotate(fig.leftArm, -70, 80, "1.6s");
        addRotate(fig.rightArm, 110, -40, "1.6s");
        addRotate(fig.leftLeg, -25, 25, "0.7s");
        addRotate(fig.rightLeg, 25, -25, "0.7s");
      } else if (name === "Breaststroke") {
        addRotate(fig.leftArm, -25, 25, "1.4s");
        addRotate(fig.rightArm, 25, -25, "1.4s");
        addRotate(fig.leftLeg, -18, 18, "1.4s");
        addRotate(fig.rightLeg, 18, -18, "1.4s");
      } else if (name === "Butterfly") {
        addRotate(fig.leftArm, -60, 60, "1.1s");
        addRotate(fig.rightArm, -60, 60, "1.1s", "0.15s");
        addRotate(fig.leftLeg, -18, 18, "0.9s");
        addRotate(fig.rightLeg, -18, 18, "0.9s");
      }
    });
  }

  const tests = JSON.parse(localStorage.getItem("tests") || "[]");

  function save25() {
    const time = parseFloat(document.getElementById("t25").value);
    const strokes = parseFloat(document.getElementById("s25").value);
    if (!time || !strokes) return;
    const sw = swolf(time, strokes);
    const d = dps(25, strokes);
    const sr = strokeRate(strokes, time);
    tests.push({
      date: Date.now(),
      time,
      strokes,
      swolf: sw,
      dps: d,
      sr,
    });
    localStorage.setItem("tests", JSON.stringify(tests));
    document.getElementById("out25").textContent =
      `SWOLF ${sw.toFixed(1)} | DPS ${d.toFixed(
        2,
      )} m/st | SR ${sr.toFixed(1)} spm`;
  }

  function calcCSS() {
    const t200 = parseFloat(document.getElementById("t200").value);
    const t400 = parseFloat(document.getElementById("t400").value);
    if (!t200 || !t400 || t400 <= t200) return;
    const css = cssPace100(t200, t400);
    const zones = zonesFromCSS(css);
    document.getElementById("outCSS").textContent =
      `CSS ${css.toFixed(2)} s/100 | Easy ${zones.easy.toFixed(
        1,
      )} - Sprint ${zones.sprint.toFixed(1)}`;
  }

  document.getElementById("save25").addEventListener("click", save25);
  document.getElementById("calcCSS").addEventListener("click", calcCSS);

  presetSelect.value = "Michael Phelps";
  const init = presets[presetSelect.value];
  fields.forEach((f) => {
    if (init[f] !== undefined) inputs[f].value = init[f];
  });
  update();
})();
