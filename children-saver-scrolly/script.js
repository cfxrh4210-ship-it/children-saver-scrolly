const charts = {
  gender: {
    eyebrow: "案件基本輪廓",
    title: "加害人與受害者性別",
    note: "部分判決書未詳細記載，故各項數據加總未必等於案件受害人數。",
    color: "#5f8db8",
    rows: [
      { label: "加害人男", value: 828, percent: 99.4 },
      { label: "加害人女", value: 4, percent: 0.5 },
      { label: "受害者女", value: 690, percent: 82.8 },
      { label: "受害者男", value: 136, percent: 16.3 },
    ],
  },
  age: {
    eyebrow: "受害者年齡",
    title: "12 至未滿 18 歲最集中",
    note: "部分判決書未詳細記載，故各項數據加總未必等於案件受害人數。",
    color: "#8371b0",
    rows: [
      { label: "14 至未滿 18 歲", value: 325, percent: 39.0 },
      { label: "12 至未滿 14 歲", value: 324, percent: 38.9 },
      { label: "7 至未滿 12 歲", value: 95, percent: 11.4 },
      { label: "未滿 7 歲", value: 28, percent: 3.4 },
    ],
  },
  relationship: {
    eyebrow: "案發時關係",
    title: "網友、伴侶關係最常見",
    note: "部分判決書未詳細記載，故各項數據加總未必等於案件受害人數。",
    color: "#6f93d8",
    rows: [
      { label: "網友", value: 559, display: "559 筆" },
      { label: "伴侶、前伴侶", value: 201, display: "201 筆" },
      { label: "其他關係", value: 74, display: "74 筆" },
    ],
  },
  platform: {
    eyebrow: "接觸平台起點",
    title: "社群與遊戲平台是常見入口",
    note: "部分判決書未詳細記載，或者僅列出平台屬性，如遊戲平台、社群平台等，故各項數據加總未必等於總案件數。",
    color: "#ff0b9d",
    rows: [
      { label: "Instagram", value: 233, display: "233 筆" },
      { label: "Facebook", value: 212, display: "212 筆" },
      { label: "傳說對決", value: 54, display: "54 筆" },
      { label: "探探", value: 32, display: "32 筆" },
      { label: "極速領域", value: 28, display: "28 筆" },
    ],
  },
  time: {
    eyebrow: "時間路徑",
    title: "取得快，曝光慢",
    note: "部分判決書未詳細記載，故各項數據加總未必等於案件受害人數。",
    color: "#6a9f9d",
    rows: [
      { label: "接觸當天取得", value: 165, display: "165 筆" },
      { label: "一周內取得", value: 130, display: "130 筆" },
      { label: "家長親屬知曉發現", value: 273, display: "273 筆" },
      { label: "被害人報案", value: 225, display: "225 筆" },
    ],
  },
};

const progressBar = document.querySelector(".scroll-progress span");
const chartCanvas = document.querySelector("#chartCanvas");
const chartEyebrow = document.querySelector("#chartEyebrow");
const chartTitle = document.querySelector("#chartTitle");
const chartNote = document.querySelector("#chartNote");
const steps = Array.from(document.querySelectorAll(".step"));
const animatedCharts = new Set();
const storyScenes = [
  { id: "top", selector: ".hero", title: "判決書裡的兒少性影像趨勢", note: "從判決書與日常對話開始" },
  { id: "intro", selector: "#intro", title: "引言", note: "案件如何進入公共討論" },
  { id: "profile", selector: "#profile", title: "判決書說了什麼", note: "關係、平台與時間路徑" },
  { id: "scripts", selector: "#scripts .script-wall", title: "三大劇本", note: "文字牆與誘導話術" },
  { id: "scriptCards", selector: "#scripts .script-light", title: "三種主要劇本", note: "情感、利益與偽裝身分" },
  { id: "after", selector: "#after", title: "第一張影像之後", note: "威脅與控制開始變形" },
  { id: "school", selector: "#school", title: "回到學校", note: "從輔導室看見真實樣貌" },
  { id: "trust", selector: "#trust", title: "信任孩子", note: "在焦慮時代保留對話" },
  { id: "method", selector: "#method", title: "資料整理", note: "判決書資料來源與限制" },
];

document.body.classList.add("scroll-enhanced");

function setupStoryStage() {
  const atmosphere = document.createElement("div");
  atmosphere.className = "story-atmosphere";
  atmosphere.setAttribute("aria-hidden", "true");
  document.body.prepend(atmosphere);

  const stage = document.createElement("aside");
  stage.className = "story-stage";
  stage.setAttribute("aria-label", "滾動章節狀態");
  stage.innerHTML = `
    <div class="story-stage-label">SCROLL</div>
    <div class="story-stage-title"></div>
    <div class="story-stage-note"></div>
    <div class="story-stage-progress" aria-hidden="true"><span></span></div>
    <div class="story-dots" aria-label="章節快速導覽"></div>
  `;
  document.body.append(stage);

  const sceneItems = storyScenes
    .map((scene) => ({ ...scene, el: document.querySelector(scene.selector) }))
    .filter((scene) => scene.el);
  const title = stage.querySelector(".story-stage-title");
  const note = stage.querySelector(".story-stage-note");
  const dots = stage.querySelector(".story-dots");

  sceneItems.forEach((scene, index) => {
    scene.el.dataset.scene = scene.id;
    const dot = document.createElement("button");
    dot.className = "story-dot";
    dot.type = "button";
    dot.setAttribute("aria-label", scene.title);
    dot.addEventListener("click", () => scene.el.scrollIntoView({ behavior: "smooth", block: "start" }));
    dots.append(dot);
    scene.dot = dot;
    scene.index = index;
  });

  function setScene(scene, progress = 0) {
    if (!scene) return;
    document.body.dataset.scene = scene.id;
    document.documentElement.style.setProperty("--scene-progress", progress.toFixed(3));
    title.textContent = scene.title;
    note.textContent = scene.note;
    sceneItems.forEach((item) => item.dot.classList.toggle("is-active", item === scene));
  }

  function updateScene() {
    const focusLine = window.innerHeight * 0.48;
    let active = sceneItems[0];
    for (const scene of sceneItems) {
      const rect = scene.el.getBoundingClientRect();
      if (rect.top <= focusLine && rect.bottom >= focusLine) {
        active = scene;
        break;
      }
      if (rect.top <= focusLine) active = scene;
    }

    const rect = active.el.getBoundingClientRect();
    const rawProgress = (focusLine - rect.top) / Math.max(rect.height, 1);
    const progress = Math.min(Math.max(rawProgress, 0), 1);
    setScene(active, progress);
  }

  updateScene();
  window.addEventListener("scroll", updateScene, { passive: true });
  window.addEventListener("resize", updateScene);
}

function setupScrollReveal() {
  const revealSelector = [
    ".hero-content",
    ".section-heading",
    ".text-col > p",
    ".case-profile-panel",
    ".step",
    ".inline-chart",
    ".script-card",
    ".article-callout",
    ".after-grid",
    ".after-note",
    ".school-visual",
    ".trust-heading p",
    ".trust-body p",
    ".closing-inner > *",
    ".method-inner",
  ].join(",");
  const revealItems = Array.from(document.querySelectorAll(revealSelector));

  revealItems.forEach((item, index) => {
    item.classList.add("scroll-reveal");
    item.style.setProperty("--reveal-delay", `${Math.min((index % 4) * 55, 165)}ms`);
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-inview");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -10% 0px" }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  function markVisibleItems() {
    revealItems.forEach((item) => {
      if (item.classList.contains("is-inview")) return;
      const rect = item.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.96 && rect.bottom > 0) {
        item.classList.add("is-inview");
        revealObserver.unobserve(item);
      }
    });
  }

  markVisibleItems();
  window.setTimeout(markVisibleItems, 120);
  window.addEventListener("scroll", markVisibleItems, { passive: true });
}

function setupHeroParallax() {
  function updateHeroShift() {
    const shift = Math.min(window.scrollY * 0.08, 72);
    document.documentElement.style.setProperty("--hero-shift", `${shift}px`);
  }

  updateHeroShift();
  window.addEventListener("scroll", updateHeroShift, { passive: true });
}

function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function setupScriptScrollMovie() {
  const scripts = document.querySelector("#scripts");
  const wall = document.querySelector("#scripts .script-wall");
  const light = document.querySelector("#scripts .script-light");
  const darkReturn = document.querySelector("#scripts .script-dark-return");
  const cards = Array.from(document.querySelectorAll(".script-card"));
  if (!scripts) return;

  let ticking = false;

  function sectionProgress(el, start = 0.82, end = 0.18) {
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const startLine = vh * start;
    const endLine = vh * end;
    const total = rect.height + startLine - endLine;
    return clamp((startLine - rect.top) / Math.max(total, 1));
  }

  function updateCurrentCard() {
    if (!cards.length) return;
    const vh = window.innerHeight || 1;
    const focus = vh * 0.5;
    let current = cards[0];
    let best = Infinity;

    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const distance = Math.abs(center - focus);
      if (distance < best) {
        best = distance;
        current = card;
      }
    });

    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const isCurrent = card === current && rect.bottom > 0 && rect.top < vh;
      card.classList.toggle("is-current", isCurrent);
      card.classList.toggle("is-past", rect.bottom < focus && !isCurrent);
    });
  }

  function update() {
    ticking = false;
    const wallProgress = sectionProgress(wall, 0.92, 0.18);
    const cardsProgress = sectionProgress(light, 0.82, 0.18);
    const darkProgress = sectionProgress(darkReturn, 0.82, 0.18);

    scripts.style.setProperty("--wall-progress", wallProgress.toFixed(3));
    scripts.style.setProperty("--cards-progress", cardsProgress.toFixed(3));
    scripts.style.setProperty("--dark-progress", darkProgress.toFixed(3));
    if (darkReturn) darkReturn.style.setProperty("--dark-progress", darkProgress.toFixed(3));
    updateCurrentCard();
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  requestUpdate();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
}

function fillTextWall(selector, parentSelector, multiplier = 1.35) {
  const wall = document.querySelector(selector);
  const parent = parentSelector ? document.querySelector(parentSelector) : wall;
  if (!wall || !parent) return;

  const original = wall.dataset.originalHtml || wall.innerHTML;
  wall.dataset.originalHtml = original;
  wall.innerHTML = original;

  let guard = 0;
  const targetHeight = parent.getBoundingClientRect().height * multiplier;
  while (wall.scrollHeight < targetHeight && guard < 10) {
    wall.insertAdjacentHTML("beforeend", original);
    guard += 1;
  }
}

function fillAllTextWalls() {
  fillTextWall(".script-text-wall", ".script-wall", 1.35);
}

function renderChart(key) {
  const chartKey = charts[key] ? key : "relationship";
  const chart = charts[chartKey];
  const max = Math.max(...chart.rows.map((row) => row.value));
  const shouldAnimate = !animatedCharts.has(chartKey);

  chartEyebrow.textContent = chart.eyebrow;
  chartTitle.textContent = chart.title;
  chartNote.textContent = chart.note;
  chartCanvas.innerHTML = "";

  chart.rows.forEach((row) => {
    const width = `${Math.max((row.value / max) * 100, 3)}%`;
    const item = document.createElement("div");
    item.className = "bar-row";
    item.innerHTML = `
      <span class="bar-label">${row.label}</span>
      <span class="bar-track">
        <span class="bar-fill" style="--bar-color:${chart.color}"></span>
      </span>
      <span class="bar-value">${row.display || `${row.value} 件 | ${row.percent}%`}</span>
    `;
    chartCanvas.appendChild(item);

    const fill = item.querySelector(".bar-fill");
    if (shouldAnimate) {
      requestAnimationFrame(() => {
        fill.style.width = width;
      });
    } else {
      fill.style.transition = "none";
      fill.style.width = width;
    }
  });

  animatedCharts.add(chartKey);
}

function setActiveStep(step) {
  steps.forEach((item) => item.classList.toggle("is-active", item === step));
  renderChart(step.dataset.chart);
}

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible) {
      setActiveStep(visible.target);
    }
  },
  {
    threshold: [0.35, 0.5, 0.7],
    rootMargin: "-18% 0px -35% 0px",
  }
);

steps.forEach((step) => observer.observe(step));
renderChart("relationship");

const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const stat = entry.target;
      const target = Number(stat.dataset.count);
      let value = 0;
      const increment = Math.max(Math.ceil(target / 40), 1);

      const timer = window.setInterval(() => {
        value = Math.min(value + increment, target);
        stat.textContent = value.toLocaleString("zh-TW");
        if (value === target) window.clearInterval(timer);
      }, 24);

      statObserver.unobserve(stat);
    });
  },
  { threshold: 0.6 }
);

document.querySelectorAll(".stat-number").forEach((stat) => statObserver.observe(stat));

function updateScrollProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const percent = max > 0 ? (window.scrollY / max) * 100 : 0;
  progressBar.style.width = `${percent}%`;
}

window.addEventListener("scroll", updateScrollProgress, { passive: true });
window.addEventListener("resize", () => {
  fillAllTextWalls();
  updateScrollProgress();
});
updateScrollProgress();
fillAllTextWalls();
setupStoryStage();
setupScrollReveal();
setupHeroParallax();
setupScriptScrollMovie();

function scrollToInitialHash() {
  const target = window.location.hash ? document.querySelector(window.location.hash) : null;
  if (target) {
    window.setTimeout(() => target.scrollIntoView({ block: "start" }), 80);
  }
}

if (document.readyState === "complete") {
  scrollToInitialHash();
} else {
  window.addEventListener("load", scrollToInitialHash);
}
