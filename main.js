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
    .querySelectorAll("input")
    .forEach((el) => el.addEventListener("input", update));
  document
    .querySelectorAll("select")
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

  function update() {
    const data = gather();
    const m = computeMetrics(data);
    if (!m) return;
    document.getElementById("bmi").textContent = m.bmi.toFixed(1);
    document.getElementById("ape").textContent = m.apeIndex.toFixed(1);
    const strokeEntries = Object.entries(m.strokes).sort((a, b) => b[1] - a[1]);
    document.getElementById("stroke").textContent = strokeEntries
      .slice(0, 2)
      .map((s) => s[0])
      .join(", ");
    const distEntries = Object.entries(m.distances).sort((a, b) => b[1] - a[1]);
    document.getElementById("distance").textContent = distEntries
      .slice(0, 2)
      .map((s) => s[0])
      .join(", ");
    drawSilhouette(data);
    drawMini(data, m);
  }

  const NS = "http://www.w3.org/2000/svg";

  function buildSwimmer(data, scale) {
    const g = document.createElementNS(NS, "g");
    const torsoH = (data.torso || 70) * scale;
    const legH = (data.leg || 90) * scale;
    const shoulderW = (data.shoulder || 40) * scale;
    const armL =
      (((data.wingspan || data.height || 180) - shoulderW) / 2) * scale;
    const headR = 10 * scale;
    const limbW = 6 * scale;
    const neckY = headR * 2;
    const hipY = neckY + torsoH;

    const parts = { g };
    const head = document.createElementNS(NS, "circle");
    head.setAttribute("cx", 0);
    head.setAttribute("cy", headR);
    head.setAttribute("r", headR);
    g.appendChild(head);
    parts.head = head;

    const body = document.createElementNS(NS, "rect");
    body.setAttribute("x", -shoulderW / 2);
    body.setAttribute("y", neckY);
    body.setAttribute("width", shoulderW);
    body.setAttribute("height", torsoH);
    g.appendChild(body);
    parts.body = body;

    const leftArm = document.createElementNS(NS, "g");
    leftArm.setAttribute("transform", `translate(${-shoulderW / 2},${neckY})`);
    const leftArmRect = document.createElementNS(NS, "rect");
    leftArmRect.setAttribute("x", -limbW / 2);
    leftArmRect.setAttribute("y", 0);
    leftArmRect.setAttribute("width", limbW);
    leftArmRect.setAttribute("height", armL);
    leftArm.appendChild(leftArmRect);
    g.appendChild(leftArm);
    parts.leftArm = leftArm;

    const rightArm = document.createElementNS(NS, "g");
    rightArm.setAttribute("transform", `translate(${shoulderW / 2},${neckY})`);
    const rightArmRect = document.createElementNS(NS, "rect");
    rightArmRect.setAttribute("x", -limbW / 2);
    rightArmRect.setAttribute("y", 0);
    rightArmRect.setAttribute("width", limbW);
    rightArmRect.setAttribute("height", armL);
    rightArm.appendChild(rightArmRect);
    g.appendChild(rightArm);
    parts.rightArm = rightArm;

    const leftLeg = document.createElementNS(NS, "g");
    leftLeg.setAttribute("transform", `translate(${-shoulderW / 4},${hipY})`);
    const leftLegRect = document.createElementNS(NS, "rect");
    leftLegRect.setAttribute("x", -limbW / 2);
    leftLegRect.setAttribute("y", 0);
    leftLegRect.setAttribute("width", limbW);
    leftLegRect.setAttribute("height", legH);
    leftLeg.appendChild(leftLegRect);
    g.appendChild(leftLeg);
    parts.leftLeg = leftLeg;

    const rightLeg = document.createElementNS(NS, "g");
    rightLeg.setAttribute("transform", `translate(${shoulderW / 4},${hipY})`);
    const rightLegRect = document.createElementNS(NS, "rect");
    rightLegRect.setAttribute("x", -limbW / 2);
    rightLegRect.setAttribute("y", 0);
    rightLegRect.setAttribute("width", limbW);
    rightLegRect.setAttribute("height", legH);
    rightLeg.appendChild(rightLegRect);
    g.appendChild(rightLeg);
    parts.rightLeg = rightLeg;

    return parts;
  }

  function drawSilhouette(data) {
    const person = document.getElementById("person");
    person.innerHTML = "";
    const scale = 160 / ((data.torso || 70) + (data.leg || 90) + 40);
    const fig = buildSwimmer(data, scale);
    fig.g.setAttribute("transform", "translate(100,10)");
    person.appendChild(fig.g);
  }

  function addRotate(el, from, to, dur, begin) {
    const anim = document.createElementNS(NS, "animateTransform");
    anim.setAttribute("attributeName", "transform");
    anim.setAttribute("type", "rotate");
    const cx = el.getAttribute("x1") || el.getAttribute("cx") || 0;
    const cy = el.getAttribute("y1") || el.getAttribute("cy") || 0;
    anim.setAttribute("from", `${from} ${cx} ${cy}`);
    anim.setAttribute("to", `${to} ${cx} ${cy}`);
    anim.setAttribute("dur", dur);
    anim.setAttribute("repeatCount", "indefinite");
    if (begin) anim.setAttribute("begin", begin);
    el.appendChild(anim);
  }

  function drawMini(data, metrics) {
    document.querySelectorAll(".miniStroke").forEach((panel) => {
      const name = panel.dataset.label;
      const container = panel.querySelector(".miniPerson");
      container.innerHTML = "";
      const score = metrics.strokes[name] || 0;
      panel.classList.remove("good", "ok", "poor");
      if (score >= 3) panel.classList.add("good");
      else if (score > 0) panel.classList.add("ok");
      else panel.classList.add("poor");

      const scale = 30 / ((data.torso || 70) + (data.leg || 90));
      const fig = buildSwimmer(data, scale);
      fig.g.setAttribute("transform", "translate(20,30) rotate(90)");
      container.appendChild(fig.g);

      if (name === "Freestyle" || name === "Backstroke") {
        addRotate(fig.leftArm, 0, 360, "2s");
        addRotate(fig.rightArm, 180, 540, "2s");
        addRotate(fig.leftLeg, -30, 30, "0.6s");
        addRotate(fig.rightLeg, 30, -30, "0.6s");
      } else if (name === "Breaststroke") {
        addRotate(fig.leftArm, -30, 30, "1.2s");
        addRotate(fig.rightArm, 30, -30, "1.2s");
        addRotate(fig.leftLeg, -20, 20, "1.2s");
        addRotate(fig.rightLeg, 20, -20, "1.2s");
      } else if (name === "Butterfly") {
        addRotate(fig.leftArm, -60, 60, "1s");
        addRotate(fig.rightArm, -60, 60, "1s", "0s");
        addRotate(fig.leftLeg, -20, 20, "0.8s");
        addRotate(fig.rightLeg, -20, 20, "0.8s");
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
    document.getElementById("out25").textContent = `SWOLF ${sw.toFixed(
      1,
    )} | DPS ${d.toFixed(2)} m/st | SR ${sr.toFixed(1)} spm`;
  }

  function calcCSS() {
    const t200 = parseFloat(document.getElementById("t200").value);
    const t400 = parseFloat(document.getElementById("t400").value);
    if (!t200 || !t400 || t400 <= t200) return;
    const css = cssPace100(t200, t400);
    const zones = zonesFromCSS(css);
    document.getElementById("outCSS").textContent = `CSS ${css.toFixed(
      2,
    )} s/100 | Easy ${zones.easy.toFixed(1)} - Sprint ${zones.sprint.toFixed(
      1,
    )}`;
  }

  document.getElementById("save25").addEventListener("click", save25);
  document.getElementById("calcCSS").addEventListener("click", calcCSS);

  // initialize with first preset
  presetSelect.value = "Michael Phelps";
  const init = presets[presetSelect.value];
  fields.forEach((f) => {
    if (init[f] !== undefined) inputs[f].value = init[f];
  });
  update();
})();
