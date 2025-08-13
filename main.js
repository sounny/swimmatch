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

  // initialize with first preset
  presetSelect.value = "Michael Phelps";
  const init = presets[presetSelect.value];
  fields.forEach((f) => {
    if (init[f] !== undefined) inputs[f].value = init[f];
  });
  update();
})();
