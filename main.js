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

  function buildStick(data, scale) {
    const g = document.createElementNS(NS, "g");
    const line = (x1, y1, x2, y2) => {
      const l = document.createElementNS(NS, "line");
      l.setAttribute("x1", x1);
      l.setAttribute("y1", y1);
      l.setAttribute("x2", x2);
      l.setAttribute("y2", y2);
      return l;
    };
    const torso = (data.torso || 70) * scale;
    const leg = (data.leg || 90) * scale;
    const shoulder = (data.shoulder || 40) * scale;
    const arm =
      (((data.wingspan || data.height || 180) - shoulder) / 2) * scale;
    const headR = 10 * scale;
    const neckY = headR * 2;
    const armY = neckY + headR * 0.2;
    const hipY = neckY + torso;
    const footY = hipY + leg;

    const parts = { g };
    const head = document.createElementNS(NS, "circle");
    head.setAttribute("cx", 0);
    head.setAttribute("cy", headR);
    head.setAttribute("r", headR);
    g.appendChild(head);
    parts.head = head;

    const body = line(0, neckY, 0, hipY);
    g.appendChild(body);
    parts.body = body;

    const leftArm = line(0, armY, -arm, armY + 10 * scale);
    const rightArm = line(0, armY, arm, armY + 10 * scale);
    g.appendChild(leftArm);
    g.appendChild(rightArm);
    parts.leftArm = leftArm;
    parts.rightArm = rightArm;

    const leftLeg = line(0, hipY, -shoulder / 4, footY);
    const rightLeg = line(0, hipY, shoulder / 4, footY);
    g.appendChild(leftLeg);
    g.appendChild(rightLeg);
    parts.leftLeg = leftLeg;
    parts.rightLeg = rightLeg;

    return parts;
  }

  function drawSilhouette(data) {
    const person = document.getElementById("person");
    person.innerHTML = "";
    const scale = 160 / ((data.torso || 70) + (data.leg || 90) + 40);
    const stick = buildStick(data, scale);
    stick.g.setAttribute("transform", "translate(100,10)");
    person.appendChild(stick.g);
  }

  function addRotate(el, from, to, dur, begin) {
    const anim = document.createElementNS(NS, "animateTransform");
    anim.setAttribute("attributeName", "transform");
    anim.setAttribute("type", "rotate");
    anim.setAttribute(
      "from",
      `${from} ${el.getAttribute("x1")} ${el.getAttribute("y1")}`,
    );
    anim.setAttribute(
      "to",
      `${to} ${el.getAttribute("x1")} ${el.getAttribute("y1")}`,
    );
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
      const stick = buildStick(data, scale);
      stick.g.setAttribute("transform", "translate(20,30) rotate(90)");
      container.appendChild(stick.g);

      if (name === "Freestyle" || name === "Backstroke") {
        addRotate(stick.leftArm, 0, 360, "2s");
        addRotate(stick.rightArm, 180, 540, "2s");
        addRotate(stick.leftLeg, -30, 30, "0.6s");
        addRotate(stick.rightLeg, 30, -30, "0.6s");
      } else if (name === "Breaststroke") {
        addRotate(stick.leftArm, -30, 30, "1.2s");
        addRotate(stick.rightArm, 30, -30, "1.2s");
        addRotate(stick.leftLeg, -20, 20, "1.2s");
        addRotate(stick.rightLeg, 20, -20, "1.2s");
      } else if (name === "Butterfly") {
        addRotate(stick.leftArm, -60, 60, "1s");
        addRotate(stick.rightArm, -60, 60, "1s", "0s");
        addRotate(stick.leftLeg, -20, 20, "0.8s");
        addRotate(stick.rightLeg, -20, 20, "0.8s");
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
