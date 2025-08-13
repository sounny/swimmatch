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
    drawMini(data);
  }

  function drawSilhouette(data) {
    const person = document.getElementById("person");
    const hScale = (data.height || 180) / 180;
    const wScale = (data.wingspan || data.height || 180) / 200; // base wingspan 200
    person.setAttribute(
      "transform",
      `translate(100,0) scale(${wScale},${hScale}) translate(-100,0)`,
    );
  }

  function drawMini(data) {
    document.querySelectorAll(".miniPerson").forEach((p) => {
      const hScale = (data.height || 180) / 180;
      const wScale = (data.wingspan || data.height || 180) / 200;
      const base = 0.3;
      p.setAttribute(
        "transform",
        `translate(50,5) scale(${base * wScale},${base * hScale}) translate(-100,0)`,
      );
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
