(function () {
  "use strict";

  const app = document.getElementById("app");
  const BANKS = {};

  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "app-toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    window.setTimeout(function () { toast.classList.add("show"); }, 10);
    window.setTimeout(function () { toast.classList.add("hide"); }, 2400);
    window.setTimeout(function () { toast.remove(); }, 2900);
  }

  const importInput = document.createElement("input");
  importInput.type = "file";
  importInput.accept = "application/json,.json";
  importInput.style.display = "none";
  importInput.addEventListener("change", function () {
    const file = importInput.files && importInput.files[0];
    importInput.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () { if (window.handleNativeImport) window.handleNativeImport(String(reader.result)); };
    reader.readAsText(file, "utf-8");
  });
  document.body.appendChild(importInput);

  const native = {
    getCatalog: function (subjectId) {
      const bank = BANKS[subjectId];
      return bank ? JSON.stringify(bank.catalog) : "{}";
    },
    getQuestion: function (subjectId, id) {
      const bank = BANKS[subjectId];
      const question = bank && bank.questions[id];
      return question ? JSON.stringify(question) : JSON.stringify({ error: "没有找到这道题" });
    },
    getImageBase64: function () { return ""; },
    requestImport: function () { importInput.click(); },
    requestExport: function (json, filename) {
      if (json == null || json.length > 20 * 1024 * 1024) return;
      const isDoc = /\.doc$/i.test(filename || "");
      const blob = new Blob([json], { type: isDoc ? "application/msword;charset=utf-8" : "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || "学习记录.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    },
    showMessage: function (message) { showToast(message); },
    closeApp: function () { /* 网页版无需关闭 */ }
  };

  const SUBJECTS = {
    jxyl: {
      id: "jxyl", name: "机械原理", title: "机械原理刷题", brandMark: "原",
      tagline: "机构结构 · 运动分析 · 齿轮轮系 · 力分析与运转调节",
      storagePrefix: "fusion-offline-v1-jxyl",
      syncSeed: "mechanical-principles-study-cross-platform-sync-v2",
      appId: "mechanical-principles-study",
      filePrefix: "机械原理学习记录", docTitle: "机械原理模拟试卷",
      accent: "#f0b429", chapters: 11, total: 3498,
      blueprint: [
        { type: "单选", count: 12, points: Array(12).fill(1) },
        { type: "判断", count: 8, points: Array(8).fill(1) },
        { type: "多选", count: 4, points: Array(4).fill(1) },
        { type: "填空", count: 8, points: Array(8).fill(2) },
        { type: "大题", count: 5, points: Array(5).fill(12) }
      ],
      unitBlueprint: [
        { type: "单选", count: 8, points: Array(8).fill(1) },
        { type: "判断", count: 6, points: Array(6).fill(1) },
        { type: "多选", count: 3, points: Array(3).fill(1) },
        { type: "填空", count: 5, points: Array(5).fill(2) },
        { type: "大题", count: 3, points: Array(3).fill(12) }
      ],
      bigPreference: [
        ["structure"],
        ["kinematics", "structure"],
        ["cam", "gear", "linkage", "mixed", "calculation", "other"],
        ["gear-train", "gear"],
        ["force", "balance", "flywheel", "calculation", "other"]
      ]
    },
    jxsj: {
      id: "jxsj", name: "机械设计", title: "机械设计刷题", brandMark: "机",
      tagline: "连接设计 · 传动设计 · 轴系与轴承 · 综合设计",
      storagePrefix: "fusion-offline-v1-jxsj",
      syncSeed: "mechanical-design-study-cross-platform-sync-v2",
      appId: "mechanical-design-study",
      filePrefix: "机械设计学习记录", docTitle: "机械设计模拟试卷",
      accent: "#4f86e8", chapters: 14, total: 3088,
      blueprint: [
        { type: "单选", count: 12, points: Array(12).fill(1) },
        { type: "判断", count: 8, points: Array(8).fill(1) },
        { type: "多选", count: 4, points: Array(4).fill(1) },
        { type: "填空", count: 8, points: Array(8).fill(2) },
        { type: "大题", count: 5, points: Array(5).fill(12) }
      ],
      unitBlueprint: [
        { type: "单选", count: 8, points: Array(8).fill(1) },
        { type: "判断", count: 6, points: Array(6).fill(1) },
        { type: "多选", count: 3, points: Array(3).fill(1) },
        { type: "填空", count: 5, points: Array(5).fill(2) },
        { type: "大题", count: 3, points: Array(3).fill(12) }
      ],
      bigPreference: [
        ["transmission"],
        ["bolt", "fatigue"],
        ["fatigue", "bolt", "belt", "key", "calculation", "other"],
        ["bearing"],
        ["shaft-correction"]
      ]
    }
  };

  let current = null;

  function homeHtml() {
    const cards = Object.keys(SUBJECTS).map(function (id) {
      const cfg = SUBJECTS[id];
      return '<button class="subject-card" data-action="choose-subject" data-subject="' + id + '" style="--accent:' + cfg.accent + '">' +
        '<div class="subject-card-head"><div class="brand-mark">' + cfg.brandMark + '</div><div class="brand-text"><h2>' + cfg.title + '</h2><span>' + cfg.tagline + '</span></div></div>' +
        '<div class="subject-stats"><div><strong>' + cfg.chapters + '</strong><span>章</span></div><div><strong>' + cfg.total + '</strong><span>道题</span></div><div><strong>6</strong><span>类题型</span></div><div><strong>离线</strong><span>题图加密打包</span></div></div>' +
        '<span class="subject-enter">进入学习 →</span></button>';
    }).join("");
    return '<div class="home-shell">' +
      '<header class="home-hero"><div class="brand"><div class="brand-mark home-mark">械</div><div class="brand-text"><h1>机械课程刷题中心</h1><span>完全离线 · 双科目题库</span></div></div></header>' +
      '<div class="home-grid">' + cards + '</div>' +
      '<p class="home-note">题目、答案与题图已在本机加密保存，断网也能使用；每个科目独立保存进度、错题本与试卷记录，学习记录可与网页版互相导入。</p></div>';
  }

  function showHome() {
    current = null;
    app.innerHTML = homeHtml();
  }

  function classifyKindPrinciples(question) {
    const text = [question.text, question.answerText].concat(question.subparts || []).join(" ");
    if (question.chapter === 11 || /综合题|组合机构/.test(text)) return "mixed";
    if (question.chapter === 1 || /自由度|杆组|运动简图|复合铰链|局部自由度|虚约束/.test(text)) return "structure";
    if (question.chapter === 2 || /瞬心|速度瞬心|图解法|速度多边形|加速度多边形|角速度|角加速度/.test(text)) return "kinematics";
    if (question.chapter === 3 || /四杆机构|曲柄|摇杆|连杆机构|行程速比|传动角|死点|铰链四杆/.test(text)) return "linkage";
    if (question.chapter === 4 || /凸轮|压力角|基圆|廓线|推杆/.test(text)) return "cam";
    if (question.chapter === 6 || /轮系|行星轮|周转轮系|传动比/.test(text)) return "gear-train";
    if (question.chapter === 5 || /齿轮|模数|齿数|分度圆|重合度|渐开线|根切|变位/.test(text)) return "gear";
    if (question.chapter === 7 || /棘轮|槽轮|不完全齿轮|间歇/.test(text)) return "intermittent";
    if (question.chapter === 8 || /摩擦|自锁|机械效率|效率/.test(text)) return "force";
    if (question.chapter === 9 || /平衡|质径积|平衡质量/.test(text)) return "balance";
    if (question.chapter === 10 || /飞轮|速度波动|盈亏功|等效转动惯量|等效力矩|等效构件/.test(text)) return "flywheel";
    if (/计算|求|设计|校核|分析/.test(text)) return "calculation";
    return "other";
  }

  function classifyTopicPrinciples(question) {
    const text = [question.text, question.answerText].concat(question.subparts || []).join(" ");
    if (/轮系|行星轮|周转轮系|传动比/.test(text)) return "gear-train";
    if (/凸轮|压力角|基圆|廓线|推杆/.test(text)) return "cam";
    if (/棘轮|槽轮|不完全齿轮|间歇/.test(text)) return "intermittent";
    if (/飞轮|速度波动|盈亏功|等效转动惯量|等效力矩|等效构件|周期性速度/.test(text)) return "flywheel";
    if (/平衡|质径积|平衡质量|动平衡|静平衡/.test(text)) return "balance";
    if (/摩擦|自锁|机械效率|效率|力分析/.test(text)) return "force";
    if (/齿轮|模数|齿数|分度圆|重合度|渐开线|根切|变位|蜗杆/.test(text)) return "gear";
    if (/四杆机构|曲柄|摇杆|连杆机构|行程速比|传动角|死点|铰链/.test(text)) return "linkage";
    if (/瞬心|速度瞬心|图解法|速度多边形|加速度|角速度|运动分析/.test(text)) return "kinematics";
    if (/自由度|杆组|运动简图|复合铰链|局部自由度|虚约束|运动副|构件/.test(text)) return "structure";
    if (/综合|组合机构/.test(text)) return "mixed";
    return "other";
  }

  function mountStudy(subjectId) {
  const cfg = SUBJECTS[subjectId];
  if (!cfg) return;
  app.innerHTML = "";

  let catalog;
  try {
    catalog = JSON.parse(native.getCatalog(subjectId));
  } catch (_) {
    catalog = null;
  }
  if (!catalog || !catalog.chapters) {
    app.innerHTML = '<div class="boot"><div class="boot-mark">!</div><strong>离线题库读取失败，请重新安装</strong></div>';
    return;
  }

  const OBJECTIVE_TYPES = ["判断", "单选", "多选"];
  const STORAGE = {
    wrong: cfg.storagePrefix + "-wrong",
    attempts: cfg.storagePrefix + "-attempts",
    progress: cfg.storagePrefix + "-progress",
    autoAdvanceCorrect: cfg.storagePrefix + "-auto-advance",
    exams: cfg.storagePrefix + "-exams"
  };
  const EXAM_TYPES = ["判断", "单选", "多选", "填空", "大题"];
  const EXAM_BLUEPRINT = cfg.blueprint;
  const UNIT_EXAM_BLUEPRINT = cfg.unitBlueprint;
  const TERM_EXAM_MIN_CHAPTERS = 4;
  const EXAM_BIG_PREFERENCE = cfg.bigPreference;
  const SYNC_PREFIX = "M3";
  const SYNC_COMPAT_PREFIX = "M3P";
  const SYNC_KEY_SEED = cfg.syncSeed;
  const SYNC_TYPE_ORDER = ["判断", "单选", "多选", "填空", "简答", "大题"];
  const SYNC_QUESTION_BASE = 1024;
  const chapters = catalog.chapters;
  const types = catalog.types;
  const knownIds = new Set();
  const idMeta = {};
  const questionCache = Object.create(null);
  let lastScrolledQuestionId = "";
  Object.keys(catalog.ids).forEach(function (key) {
    const parts = key.split("|");
    const chapter = Number(parts[0]);
    const type = parts[1];
    catalog.ids[key].forEach(function (id, index) {
      knownIds.add(id);
      idMeta[id] = { chapter: chapter, type: type, number: index + 1 };
    });
  });

  let wrongIds = loadJson(STORAGE.wrong, []);
  let attempts = loadJson(STORAGE.attempts, {});
  let progress = loadJson(STORAGE.progress, {});
  let autoAdvanceCorrect = loadJson(STORAGE.autoAdvanceCorrect, false) === true;
  let examRecords = loadJson(STORAGE.exams, []);
  examRecords = Array.isArray(examRecords) ? examRecords.filter(function (record) { return record && typeof record.id === "string" && Array.isArray(record.questions); }) : [];
  wrongIds = Array.isArray(wrongIds) ? wrongIds.filter(function (id) { return knownIds.has(id); }) : [];

  const state = {
    view: "chapters",
    chapter: null,
    type: null,
    segment: null,
    mode: "practice",
    ids: [],
    index: 0,
    selected: [],
    draft: "",
    revealed: false,
    result: null,
    grade: null,
    notice: "",
    syncNotice: "",
    syncCode: "",
    examNotice: "",
    examBuilding: false,
    examChapters: chapters ? chapters.map(function (chapter) { return chapter.chapter; }) : [],
    examTypes: EXAM_TYPES.slice(),
    activeExamId: null,
    pickerOpen: false,
    question: null,
    optionShuffleSeed: "initial"
  };

  function loadJson(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function saveRecords() {
    localStorage.setItem(STORAGE.wrong, JSON.stringify(wrongIds));
    localStorage.setItem(STORAGE.attempts, JSON.stringify(attempts));
    localStorage.setItem(STORAGE.progress, JSON.stringify(progress));
    localStorage.setItem(STORAGE.autoAdvanceCorrect, String(autoAdvanceCorrect));
    localStorage.setItem(STORAGE.exams, JSON.stringify(examRecords));
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function formatText(value) {
    return escapeHtml(value).replace(/([_^])\{([^{}]+)\}/g, function (_, mark, content) {
      return mark === "_" ? '<sub class="formula-script">' + content + "</sub>" : '<sup class="formula-script">' + content + "</sup>";
    });
  }

  function typeName(type) {
    return type === "大题" ? "大题" : type + "题";
  }

  function isShuffledChoiceType(type) {
    return type === "单选" || type === "多选";
  }

  function stableSeed(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function seededRandom(value) {
    let seed = stableSeed(value) || 1;
    return function () {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 0x100000000;
    };
  }

  function displayOptionChoices(question, contextSeed) {
    const choices = (question.options || []).map(function (text, originalIndex) {
      return { originalIndex: originalIndex, originalLetter: String.fromCharCode(65 + originalIndex), text: text };
    });
    if (!isShuffledChoiceType(question.type) || choices.length < 2) return choices;
    const random = seededRandom(contextSeed + "|" + question.id);
    for (let index = choices.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(random() * (index + 1));
      const value = choices[index]; choices[index] = choices[swapIndex]; choices[swapIndex] = value;
    }
    if (choices.every(function (choice, index) { return choice.originalIndex === index; })) choices.push(choices.shift());
    return choices;
  }

  function correctOptionContents(question) {
    return (question.correct || []).map(function (letter) {
      return (question.options || [])[letter.charCodeAt(0) - 65];
    }).filter(Boolean);
  }

  function newOptionShuffleSeed() {
    return Date.now() + "-" + Math.random().toString(36).slice(2);
  }

  function chapterInfo(number) {
    return chapters.find(function (chapter) { return chapter.chapter === number; });
  }

  function segmentKey(chapter, type, segment) {
    return chapter + "|" + type + "|" + segment;
  }

  function resetAnswer() {
    state.selected = [];
    state.draft = "";
    state.revealed = false;
    state.result = null;
    state.grade = null;
    state.notice = "";
    state.question = null;
  }

  function navClass(target) {
    const active = target === "chapters"
      ? ["chapters", "types", "segments"].indexOf(state.view) >= 0 || (state.view === "question" && state.mode === "practice")
      : target === "wrong"
        ? state.view === "wrong" || (state.view === "question" && state.mode === "wrong")
        : target === "stats" ? state.view === "stats" : target === "settings" ? state.view === "settings" : ["examBuilder", "examRecords", "exam", "examWrong"].indexOf(state.view) >= 0;
    return active ? " active" : "";
  }

  function currentLocationText() {
    const currentChapter = chapterInfo(state.chapter);
    return state.view === "question" && state.question
      ? "第 " + state.question.chapter + " 章 · " + typeName(state.question.type)
      : currentChapter ? "第 " + currentChapter.chapter + " 章 · " + currentChapter.title : "完整离线题库 · " + catalog.total + " 题";
  }

  function bottomNavHtml() {
    return '<nav class="bottom-nav" aria-label="学习功能">' +
      '<button class="nav-btn' + navClass("chapters") + '" data-action="nav-chapters"><span class="nav-icon">练</span><span>章节刷题</span></button>' +
      '<button class="nav-btn' + navClass("wrong") + '" data-action="nav-wrong"><span class="nav-icon">错</span><span>错题本 ' + wrongIds.length + '</span></button>' +
      '<button class="nav-btn' + navClass("stats") + '" data-action="nav-stats"><span class="nav-icon">统</span><span>学习统计</span></button>' +
      '<button class="nav-btn' + navClass("settings") + '" data-action="nav-settings"><span class="nav-icon">设</span><span>刷题设置</span></button>' +
      '<button class="nav-btn' + navClass("exams") + '" data-action="nav-exams"><span class="nav-icon">卷</span><span>试卷记录 ' + examRecords.length + '</span></button>' +
    '</nav>';
  }

  function shell(content) {
    return '<div class="app-shell">' +
      '<header class="app-header"><div class="brand"><div class="brand-mark">' + cfg.brandMark + '</div><div class="brand-text"><h1>' + cfg.title + '</h1><span>' + escapeHtml(currentLocationText()) + '</span></div></div><span class="header-right"><button class="topbar-subject" data-action="goto-home">科目</button><span class="offline-badge">完全离线</span></span></header>' +
      '<main class="content">' + content + '</main>' +
      bottomNavHtml() + '</div>';
  }

  function render() {
    let content = "";
    if (state.view === "chapters") content = renderChapters();
    if (state.view === "types") content = renderTypes();
    if (state.view === "segments") content = renderSegments();
    if (state.view === "wrong") content = renderWrongChapters();
    if (state.view === "stats") content = renderStats();
    if (state.view === "settings") content = renderSettings();
    if (state.view === "examBuilder") content = renderExamBuilder();
    if (state.view === "examRecords") content = renderExamRecords();
    if (state.view === "exam" || state.view === "examWrong") content = renderQuestion();
    if (state.view === "question") content = renderQuestion();
    const existing = app.querySelector(".app-shell");
    if (!existing) {
      app.innerHTML = shell(content);
    } else {
      const main = existing.querySelector(".content");
      if (main) main.innerHTML = content;
      const loc = existing.querySelector(".brand-text span");
      if (loc) loc.textContent = currentLocationText();
      const nav = existing.querySelector(".bottom-nav");
      if (nav) nav.outerHTML = bottomNavHtml();
    }
    hydrateImages();
    scrollToCurrentQuestion();
  }

  function scrollToCurrentQuestion() {
    const questionView = state.view === "question" || state.view === "exam" || state.view === "examWrong";
    if (!questionView) {
      lastScrolledQuestionId = "";
      return;
    }
    const questionId = state.question && state.question.id;
    if (!questionId || lastScrolledQuestionId === questionId) return;
    lastScrolledQuestionId = questionId;
    const card = app.querySelector(".question-card");
    if (!card) return;
    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    requestAnimationFrame(function () {
      card.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  }

  function latestChapterProgress(chapterNumber) {
    return Object.keys(progress)
      .filter(function (key) { return key.indexOf(chapterNumber + "|") === 0; })
      .map(function (key) { return { key: key, value: progress[key] }; })
      .sort(function (a, b) { return String(b.value.updatedAt).localeCompare(String(a.value.updatedAt)); })[0];
  }

  function renderChapters() {
    const cards = chapters.map(function (chapter) {
      const latest = latestChapterProgress(chapter.chapter);
      let continuation = "点击后选择题型";
      if (latest) {
        const parts = latest.key.split("|");
        continuation = "继续：" + typeName(parts[1]) + " · 第 " + (Number(parts[2]) + 1) + " 组 · 第 " + (latest.value.questionIndex + 1) + " 题";
      }
      const typeCount = Object.keys(chapter.typeCounts).filter(function (type) { return chapter.typeCounts[type] > 0; }).length;
      return '<button class="chapter-card" data-action="select-chapter" data-chapter="' + chapter.chapter + '">' +
        '<span class="chapter-index">第 ' + chapter.chapter + ' 章</span><strong>' + escapeHtml(chapter.title) + '</strong>' +
        '<div class="tags"><span class="tag">' + chapter.total + ' 道题</span><span class="tag">' + typeCount + ' 类题型</span></div>' +
        '<small>' + escapeHtml(continuation) + '</small></button>';
    }).join("");
    return '<div class="page-head"><div><p class="eyebrow">OFFLINE STUDY · STEP 1</p><h2>选择要练习的章节</h2></div><div class="total"><strong>' + catalog.total + '</strong><span>道题</span></div></div>' +
      '<div class="info-strip"><strong>离线学习</strong><span>题目、答案和图片都已保存在本机；先选章节，再按题型和每 50 题分组练习。</span></div>' +
      '<div class="card-grid">' + cards + '</div><p class="free-use-note">本题库免费使用。作者联系：<a href="mailto:qimingzenmezhemenan@gmail.com">qimingzenmezhemenan@gmail.com</a></p>';
  }

  function renderTypes() {
    const chapter = chapterInfo(state.chapter);
    if (!chapter) return "";
    const cards = types.map(function (type) {
      const count = chapter.typeCounts[type];
      const entries = Object.keys(progress).filter(function (key) { return key.indexOf(chapter.chapter + "|" + type + "|") === 0; })
        .map(function (key) { return { key: key, value: progress[key] }; })
        .sort(function (a, b) { return String(b.value.updatedAt).localeCompare(String(a.value.updatedAt)); });
      const latest = entries[0];
      const detail = count ? (latest ? "继续第 " + (Number(latest.key.split("|")[2]) + 1) + " 组 · 第 " + (latest.value.questionIndex + 1) + " 题" : count + " 道题已导入") : "本章无此题型";
      return '<button class="type-card" data-action="select-type" data-type="' + escapeHtml(type) + '"' + (count ? "" : " disabled") + '>' +
        '<span class="type-icon">' + escapeHtml(type.slice(0, 1)) + '</span><strong>' + escapeHtml(typeName(type)) + '</strong>' +
        '<small>' + escapeHtml(count + " 道 · " + (count ? Math.ceil(count / 50) : 0) + " 组 · " + detail) + '</small></button>';
    }).join("");
    return '<button class="back" data-action="nav-chapters">← 返回章节</button>' +
      '<div class="page-head"><div><p class="eyebrow">STEP 2 · QUESTION TYPE</p><h2>第 ' + chapter.chapter + ' 章 · ' + escapeHtml(chapter.title) + '</h2></div><div class="total"><strong>' + chapter.total + '</strong><span>道题</span></div></div>' +
      '<div class="info-strip"><strong>选择题型</strong><span>判断、单选、填空和大题等分别计算 1—50、51—100，并独立保存进度。</span></div>' +
      '<div class="type-list">' + cards + '</div>';
  }

  function renderSegments() {
    const chapter = chapterInfo(state.chapter);
    const all = catalog.ids[state.chapter + "|" + state.type] || [];
    const count = Math.ceil(all.length / 50);
    let cards = "";
    for (let segment = 0; segment < count; segment++) {
      const start = segment * 50 + 1;
      const end = Math.min((segment + 1) * 50, all.length);
      const saved = progress[segmentKey(state.chapter, state.type, segment)];
      const percent = saved ? Math.round(((saved.questionIndex + 1) / (end - start + 1)) * 100) : 0;
      cards += '<button class="segment-card" data-action="enter-segment" data-segment="' + segment + '">' +
        '<div class="segment-line"><strong>' + escapeHtml(typeName(state.type)) + ' · 第 ' + (segment + 1) + ' 组</strong><b>' + start + '—' + end + '</b></div>' +
        '<div class="mini-track"><span style="width:' + percent + '%"></span></div>' +
        '<small>' + (saved ? "上次做到本组第 " + (saved.questionIndex + 1) + " 题，点击继续" : "本组 " + (end - start + 1) + " 道题，点击开始") + '</small></button>';
    }
    return '<button class="back" data-action="back-types">← 返回题型</button>' +
      '<div class="page-head"><div><p class="eyebrow">STEP 3 · 50-QUESTION BLOCK</p><h2>第 ' + chapter.chapter + ' 章 · ' + escapeHtml(typeName(state.type)) + '</h2></div><div class="total"><strong>' + all.length + '</strong><span>道题</span></div></div>' +
      '<div class="info-strip"><strong>本题型单独分组</strong><span>这里只计算本题型的题号，离开后会自动保存当前组的位置。</span></div>' +
      '<div class="segment-list">' + cards + '</div>';
  }

  function enterSegment(segment) {
    const all = catalog.ids[state.chapter + "|" + state.type] || [];
    const ids = all.slice(segment * 50, segment * 50 + 50);
    if (!ids.length) return;
    const saved = progress[segmentKey(state.chapter, state.type, segment)];
    state.segment = segment;
    state.optionShuffleSeed = newOptionShuffleSeed();
    state.mode = "practice";
    state.ids = ids;
    state.index = Math.min(saved ? saved.questionIndex : 0, ids.length - 1);
    state.view = "question";
    state.pickerOpen = false;
    resetAnswer();
    render();
  }

  function renderWrongChapters() {
    const cards = chapters.map(function (chapter) {
      const count = wrongIds.filter(function (id) { return idMeta[id] && idMeta[id].chapter === chapter.chapter; }).length;
      return '<button class="chapter-card" data-action="enter-wrong" data-chapter="' + chapter.chapter + '"' + (count ? "" : " disabled") + '>' +
        '<span class="chapter-index">第 ' + chapter.chapter + ' 章</span><strong>' + escapeHtml(chapter.title) + '</strong>' +
        '<span class="wrong-count">' + count + '</span><small>' + (count ? "点击进入本章错题" : "本章暂无错题") + '</small></button>';
    }).join("");
    return '<div class="page-head"><div><p class="eyebrow">WRONG BOOK · OFFLINE</p><h2>分章错题本</h2></div><div class="total"><strong>' + wrongIds.length + '</strong><span>道错题</span></div></div>' +
      '<div class="info-strip"><strong>跨设备同步</strong><span>导出的记录可与网页版互相导入；导入时会合并错题、作答次数和分组进度。</span></div>' +
      '<div class="sync-actions"><button class="ghost" data-action="import-record">导入记录</button><button class="primary" data-action="export-record">导出记录</button></div>' +
      '<section class="sync-code-card"><div class="sync-code-heading"><div><strong>跨平台短同步码</strong><span>内容先压缩再加密，复制到另一台设备后会自动合并记录。</span></div><b>跨平台</b></div>' +
      '<textarea class="sync-code-area" data-role="sync-code" placeholder="在这里粘贴另一台设备导出的同步码">' + escapeHtml(state.syncCode) + '</textarea>' +
      '<div class="sync-actions"><button class="ghost" data-action="import-sync-code">导入同步码</button><button class="primary" data-action="export-sync-code">生成并复制同步码</button></div></section>' +
      (state.syncNotice ? '<div class="sync-note">' + escapeHtml(state.syncNotice) + '</div>' : "") +
      '<div class="card-grid">' + cards + '</div>';
  }

  function renderStats() {
    const values = Object.values(attempts);
    const tries = values.reduce(function (sum, item) { return sum + (item.tries || 0); }, 0);
    const correct = values.reduce(function (sum, item) { return sum + (item.correct || 0); }, 0);
    const accuracy = tries ? Math.round(correct / tries * 100) : 0;
    return '<div class="page-head"><div><p class="eyebrow">LEARNING OVERVIEW</p><h2>学习统计</h2></div></div>' +
      '<div class="stats">' +
        '<div class="stat"><span>累计作答</span><strong>' + tries + '</strong><small>次提交或自评</small></div>' +
        '<div class="stat"><span>已练题目</span><strong>' + Object.keys(attempts).length + '</strong><small>题库共 ' + catalog.total + ' 道</small></div>' +
        '<div class="stat"><span>当前正确率</span><strong>' + accuracy + '%</strong><small>按全部作答计算</small></div>' +
        '<div class="stat warning"><span>待复习错题</span><strong>' + wrongIds.length + '</strong><small>已按章节归档</small></div>' +
      '</div><div class="info-strip" style="margin-top:16px"><strong>本机保存</strong><span>学习记录保存在当前设备；换设备时可复制加密同步码，或使用文件导入导出。</span></div>';
  }

  function renderSettings() {
    return '<div class="page-head"><div><p class="eyebrow">PRACTICE SETTINGS</p><h2>刷题设置</h2></div></div>' +
      '<section class="settings-card"><div class="settings-heading"><strong>答题体验</strong><span>根据你的刷题习惯调整即时反馈方式。</span></div><button class="setting-row" data-action="toggle-auto-advance" aria-pressed="' + autoAdvanceCorrect + '">' +
      '<span><strong>答对后自动跳到下一题</strong><small>仅对判断题和单选题生效；答错会停留在当前题查看答案。多选题、大题和其他主观题不会自动跳题。</small></span>' +
      '<span class="switch ' + (autoAdvanceCorrect ? "on" : "") + '"><i></i></span></button></section>' +
      '<p class="free-use-note">本题库免费使用。作者联系：<a href="mailto:qimingzenmezhemenan@gmail.com">qimingzenmezhemenan@gmail.com</a></p>';
  }

  function shuffle(values) {
    const copy = values.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      const value = copy[index]; copy[index] = copy[swap]; copy[swap] = value;
    }
    return copy;
  }

  function getQuestionCached(id) {
    if (questionCache[id]) return questionCache[id];
    const question = JSON.parse(native.getQuestion(subjectId, id));
    if (question && !question.error) questionCache[id] = question;
    return question;
  }

  function getImageCached(id) {
    return "img/" + id + ".jpg";
  }

  function loadExamQuestion(id) {
    try {
      const question = getQuestionCached(id);
      return question && !question.error ? question : null;
    } catch (_) {
      return null;
    }
  }

  function classifyExamKind(question) {
    return subjectId === "jxyl" ? classifyKindPrinciples(question) : classifyKindDesign(question);
  }

  function classifyExamTopic(question) {
    return subjectId === "jxyl" ? classifyTopicPrinciples(question) : classifyTopicDesign(question);
  }

  function classifyKindDesign(question) {
    const text = [question.text, question.answerText].concat(question.subparts || []).join(" ");
    if (/轴系|改错|错误之处|不合理/.test(text)) return "shaft-correction";
    if (/齿轮|蜗杆|蜗轮/.test(text) || question.chapter === 9 || question.chapter === 14) return "transmission";
    if (/螺栓|螺钉|预紧|螺纹/.test(text) || question.chapter === 4) return "bolt";
    if (/滚动轴承|轴承寿命|额定寿命|滑动轴承|油膜|动压润滑/.test(text) || question.chapter === 10 || question.chapter === 11) return "bearing";
    if (/疲劳|循环应力|疲劳强度/.test(text) || question.chapter === 2) return "fatigue";
    if (/带传动|带轮/.test(text) || question.chapter === 7) return "belt";
    if (/键连接|花键/.test(text) || question.chapter === 5) return "key";
    if (/计算|求|校核|设计|强度/.test(text)) return "calculation";
    return "other";
  }

  function classifyTopicDesign(question) {
    const text = [question.text, question.answerText].concat(question.subparts || []).join(" ");
    if (/轴系|轴肩|危险截面|弯扭|扭矩|转轴|轴的/.test(text)) return "shaft";
    if (/滚动轴承|额定寿命|基本额定动载荷|轴承类型|寿命计算/.test(text)) return "rolling-bearing";
    if (/滑动轴承|动压润滑|油膜|pv[<=]/i.test(text)) return "sliding-bearing";
    if (/蜗杆|蜗轮/.test(text)) return "worm";
    if (/齿轮|齿面|齿根|模数|齿数|齿宽|锥齿/.test(text)) return "gear";
    if (/带传动|V带|带轮|有效拉力|包角|张紧轮/.test(text)) return "belt";
    if (/链传动|链轮/.test(text)) return "chain";
    if (/螺栓|螺钉|螺纹|预紧|防松/.test(text)) return "bolt";
    if (/键连接|平键|花键/.test(text)) return "key";
    if (/联轴器|离合器/.test(text)) return "coupling";
    if (/润滑|摩擦|磨损/.test(text)) return "lubrication";
    if (/疲劳|变应力|安全系数|循环应力|疲劳强度/.test(text)) return "fatigue";
    if (/设计阶段|总体设计|机械设计概述/.test(text)) return "design";
    return "other";
  }

  function questionSignature(question) {
    return [question.text].concat(question.subparts || []).join(" ")
      .replace(/[A-Za-z0-9]/g, "")
      .replace(/[\s，。；：、,.()（）\[\]【】{}“”"'!?！？]/g, "")
      .replace(/(下列|关于|下述|以下|属于|的是|主要|一般|通常|正确|错误|什么|怎样|为何|目的|条件|方法|特点|计算|设计)/g, "")
      .slice(0, 180);
  }

  function collectExamCandidates() {
    const candidates = [];
    state.examTypes.forEach(function (type) {
      state.examChapters.forEach(function (chapter) {
        const ids = catalog.ids[chapter + "|" + type] || [];
        ids.forEach(function (id) {
          const question = loadExamQuestion(id);
          if (!question) return;
          candidates.push({
            id: id,
            chapter: chapter,
            type: type,
            kind: type === "大题" ? classifyExamKind(question) : "other",
            topic: classifyExamTopic(question),
            signature: questionSignature(question)
          });
        });
      });
    });
    return candidates;
  }

  function countExamCandidates(type, candidates) {
    if (candidates) return candidates.filter(function (item) { return item.type === type; }).length;
    return state.examChapters.reduce(function (sum, chapter) {
      return sum + (catalog.ids[chapter + "|" + type] || []).length;
    }, 0);
  }

  function buildExamPlan(candidates) {
    const canUseTermTemplate = state.examChapters.length >= TERM_EXAM_MIN_CHAPTERS && EXAM_BLUEPRINT.every(function (group) {
      return state.examTypes.indexOf(group.type) >= 0 && countExamCandidates(group.type, candidates) >= group.count;
    });
    const source = canUseTermTemplate ? EXAM_BLUEPRINT : UNIT_EXAM_BLUEPRINT;
    const groups = source.filter(function (group) { return state.examTypes.indexOf(group.type) >= 0; }).map(function (group) {
      const count = Math.min(group.count, countExamCandidates(group.type, candidates));
      return { type: group.type, count: count, points: group.points.slice(0, count) };
    }).filter(function (group) { return group.count > 0; });
    return { mode: canUseTermTemplate ? "term" : "unit", groups: groups };
  }

  function signatureBigrams(signature) {
    const normalized = String(signature || "").replace(/\s/g, "");
    const values = new Set();
    if (normalized.length < 2) {
      if (normalized) values.add(normalized);
      return values;
    }
    for (let index = 0; index < normalized.length - 1; index += 1) values.add(normalized.slice(index, index + 2));
    return values;
  }

  function hasSimilarStem(candidate, selected) {
    if (!candidate.signature) return false;
    const candidateBigrams = signatureBigrams(candidate.signature);
    return selected.some(function (item) {
      if (!item.signature || item.signature === candidate.signature) return Boolean(item.signature);
      const selectedBigrams = signatureBigrams(item.signature);
      const shorter = Math.min(candidateBigrams.size, selectedBigrams.size);
      if (shorter < 4) return false;
      let overlap = 0;
      candidateBigrams.forEach(function (bigram) { if (selectedBigrams.has(bigram)) overlap += 1; });
      return overlap / shorter >= 0.68;
    });
  }

  function candidateDiversityScore(candidate, selected, selectedByChapter, balanceChapters) {
    const sameTopic = selected.filter(function (item) { return item.topic === candidate.topic; }).length;
    const sameKind = candidate.type === "大题" ? selected.filter(function (item) { return item.kind === candidate.kind; }).length : 0;
    const chapterPenalty = balanceChapters ? (selectedByChapter.get(candidate.chapter) || 0) * 30 : 0;
    return (hasSimilarStem(candidate, selected) ? 10000 : 0) + sameTopic * 240 + sameKind * 70 + chapterPenalty;
  }

  function chooseDiverseCandidate(pool, selected, selectedByChapter, balanceChapters) {
    const candidates = shuffle(pool);
    let best = null;
    let bestScore = Number.POSITIVE_INFINITY;
    candidates.forEach(function (candidate) {
      const score = candidateDiversityScore(candidate, selected, selectedByChapter, balanceChapters);
      if (score < bestScore) { best = candidate; bestScore = score; }
    });
    return best;
  }

  function selectDiverseExamCandidates(pool, count, priorSelections, balanceChapters) {
    const selected = [];
    const history = (priorSelections || []).slice();
    const used = new Set(history.map(function (item) { return item.id; }));
    const selectedByChapter = new Map();
    history.forEach(function (item) { selectedByChapter.set(item.chapter, (selectedByChapter.get(item.chapter) || 0) + 1); });
    while (selected.length < count) {
      const remaining = pool.filter(function (item) { return !used.has(item.id); });
      const candidate = chooseDiverseCandidate(remaining, history, selectedByChapter, balanceChapters);
      if (!candidate) break;
      selected.push(candidate);
      history.push(candidate);
      used.add(candidate.id);
      selectedByChapter.set(candidate.chapter, (selectedByChapter.get(candidate.chapter) || 0) + 1);
    }
    return selected;
  }

  function selectBigExamCandidates(pool, count, useTermTemplate) {
    if (!useTermTemplate) return selectDiverseExamCandidates(pool, count, [], false);
    const used = new Set();
    const selected = [];
    const selectedByChapter = new Map();
    function take(preferredKinds) {
      const remaining = pool.filter(function (item) { return !used.has(item.id); });
      const preferred = remaining.filter(function (item) { return preferredKinds.indexOf(item.kind) >= 0; });
      const candidate = chooseDiverseCandidate(preferred.length ? preferred : remaining, selected, selectedByChapter, false);
      if (!candidate) return;
      used.add(candidate.id);
      selected.push(candidate);
      selectedByChapter.set(candidate.chapter, (selectedByChapter.get(candidate.chapter) || 0) + 1);
    }
    EXAM_BIG_PREFERENCE.slice(0, count).forEach(take);
    while (selected.length < count) take([]);
    return selected;
  }

  function toggleExamChapter(chapter) {
    state.examChapters = state.examChapters.indexOf(chapter) >= 0
      ? state.examChapters.filter(function (item) { return item !== chapter; })
      : state.examChapters.concat(chapter).sort(function (a, b) { return a - b; });
    render();
  }

  function toggleExamType(type) {
    state.examTypes = state.examTypes.indexOf(type) >= 0
      ? state.examTypes.filter(function (item) { return item !== type; })
      : state.examTypes.concat(type);
    render();
  }

  function renderExamBuilder() {
    const chapterButtons = chapters.map(function (chapter) {
      const active = state.examChapters.indexOf(chapter.chapter) >= 0;
      return '<button class="exam-chip ' + (active ? "active" : "") + '" data-action="toggle-exam-chapter" data-chapter="' + chapter.chapter + '">第 ' + chapter.chapter + ' 章 · ' + escapeHtml(chapter.title) + '</button>';
    }).join("");
    const typeButtons = EXAM_TYPES.map(function (type) {
      const active = state.examTypes.indexOf(type) >= 0;
      return '<button class="exam-chip ' + (active ? "active" : "") + '" data-action="toggle-exam-type" data-type="' + escapeHtml(type) + '">' + escapeHtml(typeName(type)) + '</button>';
    }).join("");
    const plan = buildExamPlan();
    const blueprint = plan.groups.map(function (group) {
      const points = group.points.reduce(function (sum, value) { return sum + value; }, 0);
      return '<span>' + escapeHtml(typeName(group.type)) + ' ' + group.count + '题 / ' + points + '分</span>';
    }).join("");
    const totalPoints = plan.groups.reduce(function (sum, group) { return sum + group.points.reduce(function (part, value) { return part + value; }, 0); }, 0);
    const paperHint = plan.mode === "term"
      ? "选定范围满足期末模拟卷条件，生成 100 分试卷并保留样卷大题顺序。"
      : "单章、少章节或题型不足时自动生成单元卷，并优先分散知识点和题干相近的题目。";
    return '<button class="back" data-action="nav-exams">← 返回试卷记录</button>' +
      '<div class="page-head"><div><p class="eyebrow">OFFLINE EXAM BUILDER</p><h2>范围组卷</h2></div><div class="total"><strong>' + totalPoints + '</strong><span>预计分</span></div></div>' +
      '<div class="info-strip"><strong>智能组卷</strong><span>' + paperHint + ' 全程离线。</span></div>' +
      '<div class="exam-builder-section"><div class="exam-section-heading"><strong>选择章节范围</strong><button class="link" data-action="toggle-all-exam-chapters">' + (state.examChapters.length === chapters.length ? "全部取消" : "全选章节") + '</button></div><div class="exam-chip-grid">' + chapterButtons + '</div></div>' +
      '<div class="exam-builder-section"><div class="exam-section-heading"><strong>选择题型范围</strong><button class="link" data-action="toggle-all-exam-types">' + (state.examTypes.length === EXAM_TYPES.length ? "全部取消" : "全选题型") + '</button></div><div class="exam-chip-grid">' + typeButtons + '</div></div>' +
      '<div class="exam-blueprint"><strong>本套卷预计结构</strong><div>' + blueprint + '</div></div>' +
      '<button class="primary exam-create-button" data-action="create-exam"' + (state.examBuilding ? " disabled" : "") + '>' + (state.examBuilding ? "正在组卷…" : "生成随机试卷") + '</button>' +
      (state.examNotice ? '<div class="sync-note">' + escapeHtml(state.examNotice) + '</div>' : "");
  }

  function renderExamRecords() {
    const records = examRecords.slice().reverse();
    const list = records.map(function (record) {
      const totalPoints = record.questions.reduce(function (sum, item) { return sum + item.points; }, 0);
      const answered = Array.isArray(record.answeredIds) ? record.answeredIds.length : 0;
      return '<article class="exam-record-card"><div class="exam-record-main"><span class="chapter-index">第 ' + record.number + ' 套</span><h3>' + escapeHtml(record.title) + '</h3><p>' + escapeHtml(new Date(record.createdAt).toLocaleString("zh-CN")) + ' · 范围：' + escapeHtml(record.chapters.map(function (chapter) { return "第" + chapter + "章"; }).join("、")) + '</p><div class="exam-record-tags"><span>' + record.questions.length + ' 题</span><span>' + totalPoints + ' 分</span><span>已做 ' + answered + ' / ' + record.questions.length + '</span><span class="' + (record.wrongIds && record.wrongIds.length ? "danger-tag" : "good-tag") + '">错题 ' + (record.wrongIds ? record.wrongIds.length : 0) + '</span></div></div><div class="exam-record-actions"><button class="primary" data-action="continue-exam" data-exam-id="' + escapeHtml(record.id) + '">继续做卷</button><button class="ghost" data-action="exam-wrong" data-exam-id="' + escapeHtml(record.id) + '"' + (!(record.wrongIds && record.wrongIds.length) ? " disabled" : "") + '>本卷错题</button><button class="ghost" data-action="export-exam" data-exam-id="' + escapeHtml(record.id) + '">导出 Word</button><button class="ghost danger-button" data-action="delete-exam" data-exam-id="' + escapeHtml(record.id) + '">删除试卷</button></div></article>';
    }).join("");
    return '<div class="page-head"><div><p class="eyebrow">SIMULATED EXAM · LOCAL RECORDS</p><h2>试卷记录</h2></div><button class="primary" data-action="open-exam-builder">再出一套卷</button></div>' +
      '<div class="info-strip"><strong>本地保存</strong><span>每次组卷都会保留题目顺序、作答进度和本卷错题；记录会包含在同步码中。</span></div>' +
      (state.examNotice ? '<div class="sync-note">' + escapeHtml(state.examNotice) + '</div>' : "") +
      (list || '<div class="empty"><div class="empty-icon">卷</div><h3>还没有模拟卷</h3><p>选择章节范围后生成第一套模拟卷。</p><button class="primary" data-action="open-exam-builder">开始组卷</button></div>');
  }

  function createExam() {
    if (!state.examChapters.length || !state.examTypes.length) {
      state.examNotice = "至少选择一个章节和一种题型。"; render(); return;
    }
    state.examBuilding = true; state.examNotice = "正在整理题型与知识点…"; render();
    window.setTimeout(function () {
      try {
        const candidates = collectExamCandidates();
        const plan = buildExamPlan(candidates);
        if (!plan.groups.length) throw new Error("所选范围内没有可用题目，请调整章节或题型。 ");
        const questions = [];
        const selectedSmallQuestions = [];
        plan.groups.forEach(function (group) {
          const pool = candidates.filter(function (candidate) { return candidate.type === group.type; });
          const picked = group.type === "大题"
            ? selectBigExamCandidates(pool, group.count, plan.mode === "term")
            : selectDiverseExamCandidates(pool, group.count, selectedSmallQuestions, true);
          if (group.type !== "大题") picked.forEach(function (candidate) { selectedSmallQuestions.push(candidate); });
          picked.forEach(function (candidate, index) { questions.push({ id: candidate.id, type: group.type, points: group.points[index] }); });
        });
        const expected = plan.groups.reduce(function (sum, group) { return sum + group.count; }, 0);
        if (questions.length < expected) throw new Error("所选范围内的题目读取不完整，请重新组卷或调整范围。 ");
        const number = examRecords.reduce(function (max, record) { return Math.max(max, Number(record.number) || 0); }, 0) + 1;
        const record = { id: "exam-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8), number: number, title: "第 " + number + " 套" + (plan.mode === "term" ? "期末模拟卷" : "单元卷"), createdAt: new Date().toISOString(), chapters: state.examChapters.slice(), types: state.examTypes.slice(), groups: plan.groups, paperMode: plan.mode, questions: questions, currentIndex: 0, answeredIds: [], wrongIds: [], completedAt: null };
        examRecords.push(record); saveRecords(); state.activeExamId = record.id; state.mode = "exam"; state.ids = questions.map(function (item) { return item.id; }); state.index = 0; state.view = "exam"; state.pickerOpen = false; state.examBuilding = false; state.examNotice = ""; resetAnswer(); render();
      } catch (error) {
        state.examBuilding = false; state.examNotice = error && error.message ? error.message : "组卷失败，请稍后重试。"; render();
      }
    }, 30);
  }

  function findExam(id) { return examRecords.find(function (record) { return record.id === id; }); }

  function enterExam(record, wrongOnly) {
    const refs = wrongOnly ? record.questions.filter(function (item) { return (record.wrongIds || []).indexOf(item.id) >= 0; }) : record.questions;
    if (!refs.length) return;
    state.activeExamId = record.id; state.mode = wrongOnly ? "examWrong" : "exam"; state.ids = refs.map(function (item) { return item.id; }); state.index = wrongOnly ? 0 : Math.min(record.currentIndex || 0, state.ids.length - 1); state.view = wrongOnly ? "examWrong" : "exam"; state.pickerOpen = false; resetAnswer(); render();
  }

  function deleteExam(id) {
    const record = findExam(id);
    if (!record || !window.confirm("确定删除“" + record.title + "”吗？只删除本地试卷记录和本卷错题。")) return;
    examRecords = examRecords.filter(function (item) { return item.id !== id; });
    if (state.activeExamId === id) { state.activeExamId = null; state.view = "examRecords"; resetAnswer(); }
    saveRecords(); state.examNotice = record.title + " 已删除。"; render();
  }

  function loadCurrentQuestion() {
    const id = state.ids[state.index];
    if (!id) return null;
    try {
      const question = getQuestionCached(id);
      if (question.error) throw new Error(question.error);
      state.question = question;
      if (state.mode === "practice") {
        const key = segmentKey(state.chapter, state.type, state.segment);
        progress[key] = { questionIndex: state.index, questionId: id, updatedAt: new Date().toISOString() };
        saveRecords();
      } else if (state.mode === "exam" && state.activeExamId) {
        const record = findExam(state.activeExamId);
        if (record) { record.currentIndex = state.index; saveRecords(); }
      }
      return question;
    } catch (_) {
      return null;
    }
  }

  function renderQuestion() {
    if (!state.ids.length) {
      return '<div class="empty"><div class="empty-icon">✓</div><h3>本章错题已经清空</h3><p>返回错题章节，可以继续复习其他章节。</p><button class="primary" data-action="nav-wrong">返回错题本</button></div>';
    }
    state.index = Math.max(0, Math.min(state.index, state.ids.length - 1));
    const question = loadCurrentQuestion();
    if (!question) {
      return '<div class="empty"><div class="empty-icon">!</div><h3>题目读取失败</h3><p>请重新安装离线应用后再试。</p><button class="primary" data-action="retry-question">重新读取</button></div>';
    }
    const chapter = chapterInfo(question.chapter);
    const isObjective = OBJECTIVE_TYPES.indexOf(question.type) >= 0;
    const isExam = state.mode === "exam" || state.mode === "examWrong";
    const backLabel = state.mode === "practice" ? "返回本章分组" : isExam ? "返回试卷记录" : "返回错题章节";
    const activeExam = state.activeExamId ? findExam(state.activeExamId) : null;
    const displayedOptions = displayOptionChoices(question, activeExam ? activeExam.id : state.optionShuffleSeed);
    const title = state.mode === "practice"
      ? chapter.title + " · " + typeName(question.type) + " · 第 " + (state.segment + 1) + " 组"
      : isExam ? (activeExam ? activeExam.title : "模拟卷") + " · " + typeName(question.type) : chapter.title + " · 错题";
    const percent = Math.round((state.index + 1) / state.ids.length * 100);
    const subparts = question.subparts && question.subparts.length
      ? '<ol class="subparts">' + question.subparts.map(function (part) { return '<li><span class="formula-text">' + formatText(part) + '</span></li>'; }).join("") + '</ol>' : "";
    const questionImages = imageGallery(question.questionImages, "题图");
    const answerImages = imageGallery(question.answerImages, "参考答案图");

    let response = "";
    if (isObjective) {
      response = '<div class="options">' + displayedOptions.map(function (choice, optionIndex) {
        const selected = state.selected.indexOf(choice.originalLetter) >= 0;
        const correct = state.revealed && (question.correct || []).indexOf(choice.originalLetter) >= 0;
        const wrongChoice = state.revealed && selected && !correct;
        const classes = ["option", selected ? "selected" : "", correct ? "correct" : "", wrongChoice ? "wrong-choice" : ""].filter(Boolean).join(" ");
        return '<button class="' + classes + '" data-action="select-option" data-letter="' + choice.originalLetter + '"' + (state.revealed ? " disabled" : "") + '><span class="letter">' + String.fromCharCode(65 + optionIndex) + '</span><span class="formula-text option-content">' + formatText(choice.text) + '</span></button>';
      }).join("") + '</div><p class="hint">' + (question.type === "多选" ? "选项顺序已随机打乱；可选择多个选项，再统一提交。" : question.type === "单选" ? "选项顺序已随机打乱；选择后立即显示答案。" : "选择后立即显示答案。") + '</p>';
    } else {
      response = '<div class="draft"><label for="draft">' + (question.type === "大题" ? "先在纸上计算，也可以在这里记下思路" : "先写下自己的答案") + '</label>' +
        '<textarea id="draft" data-role="draft"' + (state.revealed ? " disabled" : "") + ' placeholder="完成后再显示参考答案……">' + escapeHtml(state.draft) + '</textarea></div>';
    }

    let answer = "";
    if (state.revealed) {
      const resultText = isObjective ? '<span class="answer-result">' + (state.result ? "回答正确" : "需要复习") + '</span>' : "";
      const remove = wrongIds.indexOf(question.id) >= 0 ? '<button class="link" data-action="remove-wrong">从错题本移除</button>' : "";
      let grade = "";
      if (!isObjective) {
        grade = '<div class="grade"><strong>对照答案后，你觉得：</strong><div class="grade-buttons">' + ["掌握", "模糊", "不会"].map(function (item) {
          return '<button data-action="grade" data-grade="' + item + '" class="' + (state.grade === item ? "chosen" : "") + '"' + (state.grade ? " disabled" : "") + '>' + item + '</button>';
        }).join("") + '</div></div>';
      }
      answer = '<section class="answer ' + (state.result === true ? "good" : state.result === false ? "review" : "") + '">' +
        '<div class="answer-head"><div><span class="answer-kicker">参考答案</span>' + resultText + '</div>' + remove + '</div>' +
        (isShuffledChoiceType(question.type)
          ? '<p class="answer-body correct-answer-content"><strong>正确答案：</strong><span class="formula-text">' + formatText(correctOptionContents(question).join("；")) + '</span></p>'
          : '<p class="answer-body formula-text">' + formatText(question.answerText) + '</p>') + answerImages + grade + '</section>';
    }

    const primary = !state.revealed && (question.type === "多选" || !isObjective)
      ? '<button class="primary" data-action="submit">' + (isObjective ? "提交答案" : "显示参考答案") + '</button>'
      : state.index < state.ids.length - 1
        ? '<button class="primary" data-action="next-question">下一题</button>'
        : '<button class="primary" data-action="finish-group">' + (state.mode === "practice" ? "完成本组" : isExam ? "返回试卷记录" : "返回错题章节") + '</button>';

    return '<button class="back" data-action="question-back">← ' + backLabel + '</button>' +
      '<div class="question-head"><div><p class="eyebrow">' + (state.mode === "practice" ? "OFFLINE 50-QUESTION BLOCK" : isExam ? "OFFLINE SIMULATED EXAM" : "OFFLINE WRONG BOOK") + '</p><h2>' + escapeHtml(title) + '</h2><span class="autosave">进度已保存在本机</span></div>' +
      '<div class="question-count"><strong>' + (state.index + 1) + '</strong> / ' + state.ids.length + '</div></div>' +
      '<div class="progress-track"><span style="width:' + percent + '%"></span></div>' + renderPicker() +
      '<article class="question-card"><div class="question-meta"><span class="question-id">' + escapeHtml(question.id) + ' · 本题型第 ' + question.number + ' 题</span>' +
      '<div class="meta-tags"><span>第 ' + question.chapter + ' 章</span><span>' + escapeHtml(typeName(question.type)) + '</span></div></div>' +
      '<div class="question-text formula-text">' + formatText(question.text) + '</div>' + subparts + questionImages + response +
      (state.notice ? '<p class="notice">' + escapeHtml(state.notice) + '</p>' : "") + answer +
      '<div class="question-actions"><button class="ghost" data-action="prev-question"' + (state.index === 0 ? " disabled" : "") + '>上一题</button><div class="action-right">' + primary + '</div></div></article>';
  }

  function renderPicker() {
    const items = state.ids.map(function (id, index) {
      const meta = idMeta[id];
      const classes = ["picker-item", index === state.index ? "current" : "", attempts[id] ? "done" : "", wrongIds.indexOf(id) >= 0 ? "wrong" : ""].filter(Boolean).join(" ");
      return '<button class="' + classes + '" data-action="pick-question" data-index="' + index + '">' + (meta ? meta.number : index + 1) + '</button>';
    }).join("");
    return '<section class="picker"><button class="picker-toggle" data-action="toggle-picker"><span>' + (state.pickerOpen ? "收起题目列表" : "展开题目列表并选题") + '</span><b>' + (state.pickerOpen ? "−" : "+") + '</b></button>' +
      (state.pickerOpen ? '<div class="picker-panel"><div class="legend"><span><i class="lc"></i>当前</span><span><i class="ld"></i>已做</span><span><i class="lw"></i>错题</span></div><div class="picker-grid">' + items + '</div></div>' : "") + '</section>';
  }

  function imageGallery(ids, label) {
    if (!ids || !ids.length) return "";
    return '<div class="gallery">' + ids.map(function (id, index) {
      return '<figure><img data-image-id="' + escapeHtml(id) + '" alt="' + label + (index + 1) + '" /><figcaption>' + label + (ids.length > 1 ? " " + (index + 1) : "") + '</figcaption></figure>';
    }).join("") + '</div>';
  }

  function prefetchNearbyQuestions() {
    const nearby = [state.ids[state.index + 1], state.ids[state.index + 2]];
    nearby.forEach(function (id) {
      if (!id || questionCache[id]) return;
      setTimeout(function () {
        try { getQuestionCached(id); } catch (_) {}
      }, 0);
    });
  }

  function hydrateImages() {
    Array.from(document.querySelectorAll("img[data-image-id]")).forEach(function (image) {
      if (image.getAttribute("src")) return;
      image.addEventListener("error", function () { image.alt = "图片缺失"; image.removeAttribute("src"); }, { once: true });
      image.src = "img/" + image.dataset.imageId + ".jpg";
    });
    prefetchNearbyQuestions();
  }

  function goQuestion(index) {
    state.index = Math.max(0, Math.min(index, state.ids.length - 1));
    if (state.mode === "exam" && state.activeExamId) {
      const record = findExam(state.activeExamId);
      if (record) { record.currentIndex = state.index; saveRecords(); }
    }
    state.pickerOpen = false;
    resetAnswer();
    render();
  }

  function addWrong(id) {
    if (wrongIds.indexOf(id) < 0) wrongIds.push(id);
    saveRecords();
  }

  function removeWrong(id) {
    wrongIds = wrongIds.filter(function (item) { return item !== id; });
    if (state.mode === "wrong" || state.mode === "examWrong") {
      state.ids = state.ids.filter(function (item) { return item !== id; });
      state.index = Math.min(state.index, Math.max(0, state.ids.length - 1));
      resetAnswer();
    }
    if ((state.mode === "exam" || state.mode === "examWrong") && state.activeExamId) {
      const record = findExam(state.activeExamId);
      if (record) record.wrongIds = (record.wrongIds || []).filter(function (item) { return item !== id; });
    }
    saveRecords();
  }

  function recordAttempt(id, correct) {
    const old = attempts[id] || { tries: 0, correct: 0, lastCorrect: false };
    attempts[id] = { tries: old.tries + 1, correct: old.correct + (correct ? 1 : 0), lastCorrect: correct };
    saveRecords();
  }

  function recordExamOutcome(id, correct) {
    if (!state.activeExamId) return;
    const record = findExam(state.activeExamId);
    if (!record) return;
    record.answeredIds = Array.from(new Set((record.answeredIds || []).concat(id)));
    record.wrongIds = correct
      ? (record.wrongIds || []).filter(function (item) { return item !== id; })
      : Array.from(new Set((record.wrongIds || []).concat(id)));
    saveRecords();
  }

  function submitCurrent() {
    const question = state.question;
    if (!question) return;
    if (OBJECTIVE_TYPES.indexOf(question.type) >= 0) {
      if (!state.selected.length) {
        state.notice = "请先选择答案。";
        render();
        return;
      }
      const selected = state.selected.slice().sort().join("|");
      const correct = (question.correct || []).slice().sort().join("|");
      state.result = selected === correct;
      state.revealed = true;
      recordAttempt(question.id, state.result);
      recordExamOutcome(question.id, state.result);
      if (!state.result) addWrong(question.id);
    } else {
      state.revealed = true;
      state.notice = "";
    }
    render();
  }

  function gradeCurrent(grade) {
    if (!state.question || state.grade) return;
    const mastered = grade === "掌握";
    state.grade = grade;
    state.result = mastered;
    recordAttempt(state.question.id, mastered);
    recordExamOutcome(state.question.id, mastered);
    if (mastered) removeWrong(state.question.id); else addWrong(state.question.id);
    render();
  }

  function makeStudyRecord() {
    return { app: cfg.appId, version: 2, exportedAt: new Date().toISOString(), wrongIds: wrongIds.slice(), attempts: attempts, progress: progress, exams: examRecords };
  }

  function sanitizeExamRecord(record) {
    if (!record || typeof record.id !== "string" || !Array.isArray(record.questions)) return null;
    const questions = record.questions.filter(function (item) { return item && knownIds.has(item.id) && EXAM_TYPES.indexOf(item.type) >= 0 && Number.isFinite(item.points); }).map(function (item) { return { id: item.id, type: item.type, points: Number(item.points) }; });
    if (!questions.length) return null;
    return { id: record.id, number: Number(record.number) || 0, title: String(record.title || "模拟卷"), createdAt: String(record.createdAt || new Date().toISOString()), chapters: Array.isArray(record.chapters) ? record.chapters.map(Number).filter(function (chapter) { return chapterInfo(chapter); }) : [], types: Array.isArray(record.types) ? record.types.filter(function (type) { return EXAM_TYPES.indexOf(type) >= 0; }) : [], questions: questions, currentIndex: Math.max(0, Math.min(Number(record.currentIndex) || 0, questions.length - 1)), answeredIds: Array.isArray(record.answeredIds) ? record.answeredIds.filter(function (id) { return questions.some(function (item) { return item.id === id; }); }) : [], wrongIds: Array.isArray(record.wrongIds) ? record.wrongIds.filter(function (id) { return questions.some(function (item) { return item.id === id; }); }) : [], completedAt: record.completedAt || null };
  }

  function applyStudyRecord(payload) {
    if (!payload || payload.app !== cfg.appId || (payload.version !== 1 && payload.version !== 2)) throw new Error("这不是本题库导出的学习记录，请进入对应科目后再导入。");
    const incomingWrong = Array.isArray(payload.wrongIds) ? payload.wrongIds.filter(function (id) { return knownIds.has(id); }) : [];
    wrongIds = Array.from(new Set(wrongIds.concat(incomingWrong)));
    const incomingAttempts = payload.attempts && typeof payload.attempts === "object" ? payload.attempts : {};
    Object.keys(incomingAttempts).forEach(function (id) {
      const item = incomingAttempts[id];
      if (!knownIds.has(id) || !item || !Number.isInteger(item.tries) || !Number.isInteger(item.correct) || item.tries < 0 || item.correct < 0 || item.correct > item.tries || typeof item.lastCorrect !== "boolean") return;
      const old = attempts[id];
      if (!old || item.tries > old.tries || (item.tries === old.tries && item.correct > old.correct)) attempts[id] = item;
    });
    const incomingProgress = payload.progress && typeof payload.progress === "object" ? payload.progress : {};
    Object.keys(incomingProgress).forEach(function (key) {
      const item = incomingProgress[key]; const parts = key.split("|");
      if (parts.length !== 3 || !item || !Number.isInteger(item.questionIndex) || item.questionIndex < 0 || isNaN(Date.parse(item.updatedAt))) return;
      const all = catalog.ids[parts[0] + "|" + parts[1]] || []; const segment = Number(parts[2]); const expected = all[segment * 50 + item.questionIndex];
      if (!expected || expected !== item.questionId) return;
      if (!progress[key] || String(item.updatedAt) > String(progress[key].updatedAt)) progress[key] = item;
    });
    if (Array.isArray(payload.exams)) {
      payload.exams.map(sanitizeExamRecord).filter(Boolean).forEach(function (incoming) {
        const old = findExam(incoming.id);
        if (!old) { examRecords.push(incoming); return; }
        old.currentIndex = Math.max(old.currentIndex || 0, incoming.currentIndex || 0);
        old.answeredIds = Array.from(new Set((old.answeredIds || []).concat(incoming.answeredIds || [])));
        old.wrongIds = Array.from(new Set((old.wrongIds || []).concat(incoming.wrongIds || [])));
        old.completedAt = old.completedAt || incoming.completedAt;
      });
    }
    saveRecords();
  }

  function exportRecord() {
    const record = makeStudyRecord();
    native.requestExport(JSON.stringify(record, null, 2), cfg.filePrefix + "-" + record.exportedAt.slice(0, 10) + ".json");
    state.syncNotice = "已打开文件保存窗口；保存后可在另一台设备或网页版导入。";
    render();
  }

  function importRecord(text) {
    try {
      applyStudyRecord(JSON.parse(text));
      state.syncNotice = "导入完成：错题、学习进度和试卷记录已与本机合并。";
      state.view = "wrong"; render(); native.showMessage("学习记录导入完成");
    } catch (error) {
      state.syncNotice = error && error.message ? error.message : "记录文件读取失败。";
      state.view = "wrong"; render();
    }
  }

  function bytesToBase64Url(bytes) {
    let binary = "";
    for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode.apply(null, bytes.subarray(index, index + 0x8000));
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function base64UrlToBytes(value) {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - value.length % 4) % 4);
    const binary = atob(base64); const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  }

  async function syncKey() {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(SYNC_KEY_SEED));
    return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
  }

  function compactQuestionId(id) {
    const match = /^CH(\d{2})-(判断|单选|多选|填空|简答|大题)-(\d{3})$/.exec(id);
    if (!match) return id;
    const typeIndex = SYNC_TYPE_ORDER.indexOf(match[2]);
    if (typeIndex < 0) return id;
    return ((Number(match[1]) * SYNC_TYPE_ORDER.length + typeIndex) * SYNC_QUESTION_BASE + Number(match[3])).toString(36);
  }

  function expandQuestionId(value) {
    if (typeof value !== "string" || /^CH\d{2}-(判断|单选|多选|填空|简答|大题)-\d{3}$/.test(value)) return typeof value === "string" ? value : "";
    const packed = Number.parseInt(value, 36);
    if (!Number.isFinite(packed) || packed <= 0) return value;
    const number = packed % SYNC_QUESTION_BASE;
    const typeValue = Math.floor(packed / SYNC_QUESTION_BASE);
    const typeIndex = typeValue % SYNC_TYPE_ORDER.length;
    const chapter = Math.floor(typeValue / SYNC_TYPE_ORDER.length);
    if (!Number.isInteger(chapter) || chapter < 1 || !Number.isInteger(number) || number < 1 || number > 999 || !SYNC_TYPE_ORDER[typeIndex]) return value;
    return "CH" + String(chapter).padStart(2, "0") + "-" + SYNC_TYPE_ORDER[typeIndex] + "-" + String(number).padStart(3, "0");
  }

  function compactQuestionType(type) {
    const index = SYNC_TYPE_ORDER.indexOf(type);
    return index >= 0 ? index : type;
  }

  function expandQuestionType(value) {
    if (typeof value === "number" && SYNC_TYPE_ORDER[value]) return SYNC_TYPE_ORDER[value];
    return typeof value === "string" ? value : "";
  }

  function compactSyncRecord(record) {
    return {
      v: 3,
      w: record.wrongIds.map(compactQuestionId),
      a: Object.keys(record.attempts).map(function (id) { const attempt = record.attempts[id]; return [compactQuestionId(id), attempt.tries, attempt.correct, attempt.lastCorrect ? 1 : 0]; }),
      p: Object.keys(record.progress).map(function (key) { const entry = record.progress[key]; return [key, entry.questionIndex, compactQuestionId(entry.questionId), entry.updatedAt]; }),
      e: (record.exams || []).map(function (exam) {
        return { i: exam.id, n: exam.number, t: exam.title, c: exam.createdAt, h: exam.chapters, y: exam.types.map(compactQuestionType), q: exam.questions.map(function (question) { return [compactQuestionId(question.id), compactQuestionType(question.type), question.points]; }), x: exam.currentIndex, d: exam.answeredIds.map(compactQuestionId), w: exam.wrongIds.map(compactQuestionId), f: exam.completedAt };
      })
    };
  }

  function expandSyncRecord(payload) {
    if (!payload || payload.v !== 3 || !Array.isArray(payload.w)) throw new Error("同步码内容不完整或版本不受支持。");
    const attempts = {};
    (Array.isArray(payload.a) ? payload.a : []).forEach(function (item) {
      if (Array.isArray(item) && item.length >= 4) attempts[expandQuestionId(item[0])] = { tries: Number(item[1]), correct: Number(item[2]), lastCorrect: item[3] === 1 };
    });
    const progress = {};
    (Array.isArray(payload.p) ? payload.p : []).forEach(function (item) {
      if (Array.isArray(item) && item.length >= 4) progress[String(item[0])] = { questionIndex: Number(item[1]), questionId: expandQuestionId(item[2]), updatedAt: String(item[3]) };
    });
    const exams = (Array.isArray(payload.e) ? payload.e : []).map(function (item) {
      return {
        id: String(item && item.i != null ? item.i : ""), number: Number(item && item.n != null ? item.n : 0), title: String(item && item.t != null ? item.t : "模拟卷"), createdAt: String(item && item.c != null ? item.c : ""),
        chapters: Array.isArray(item && item.h) ? item.h.map(Number) : [],
        types: Array.isArray(item && item.y) ? item.y.map(expandQuestionType).filter(function (type) { return SYNC_TYPE_ORDER.indexOf(type) >= 0; }) : [],
        questions: Array.isArray(item && item.q) ? item.q.map(function (question) { return { id: expandQuestionId(question && question[0]), type: expandQuestionType(question && question[1]), points: Number(question && question[2]) }; }) : [],
        currentIndex: Number(item && item.x != null ? item.x : 0), answeredIds: Array.isArray(item && item.d) ? item.d.map(expandQuestionId) : [], wrongIds: Array.isArray(item && item.w) ? item.w.map(expandQuestionId) : [], completedAt: item && item.f ? String(item.f) : null
      };
    });
    return { app: cfg.appId, version: 2, exportedAt: new Date().toISOString(), wrongIds: payload.w.map(expandQuestionId), attempts: attempts, progress: progress, exams: exams };
  }

  async function transformSyncBytes(bytes, direction) {
    const Constructor = window[direction === "compress" ? "CompressionStream" : "DecompressionStream"];
    if (!Constructor) throw new Error("当前系统不支持压缩同步码");
    const input = new Blob([bytes]).stream();
    const output = input.pipeThrough(new Constructor("deflate"));
    return new Uint8Array(await new Response(output).arrayBuffer());
  }

  function maskCompatSyncBytes(bytes) {
    const seed = new TextEncoder().encode(SYNC_KEY_SEED);
    const masked = new Uint8Array(bytes.length);
    for (let index = 0; index < bytes.length; index += 1) {
      masked[index] = bytes[index] ^ seed[index % seed.length] ^ ((index * 31 + 17) & 0xff);
    }
    return masked;
  }

  async function encodeCompatSyncRecord(record) {
    const raw = new TextEncoder().encode(JSON.stringify(compactSyncRecord(record)));
    let packed = raw;
    let compressed = false;
    try {
      const candidate = await transformSyncBytes(raw, "compress");
      if (candidate.length + 1 < raw.length) { packed = candidate; compressed = true; }
    } catch (_) { }
    const envelope = new Uint8Array(packed.length + 2);
    envelope[0] = 0x43;
    envelope[1] = compressed ? 1 : 0;
    envelope.set(maskCompatSyncBytes(packed), 2);
    return SYNC_COMPAT_PREFIX + "." + bytesToBase64Url(envelope);
  }

  async function decodeCompatSyncRecord(value) {
    const envelope = base64UrlToBytes(value.slice(SYNC_COMPAT_PREFIX.length + 1));
    if (envelope.length <= 2 || envelope[0] !== 0x43) throw new Error("同步码内容不完整。 ");
    const packed = maskCompatSyncBytes(envelope.slice(2));
    const raw = envelope[1] === 1 ? await transformSyncBytes(packed, "decompress") : packed;
    return expandSyncRecord(JSON.parse(new TextDecoder().decode(raw)));
  }

  async function encodeSyncRecord(record) {
    const localHttp = window.location && window.location.protocol === "http:" && /^(localhost|127(?:\.\d{1,3}){3})$/.test(window.location.hostname);
    if (localHttp || !window.crypto || !window.crypto.subtle) return encodeCompatSyncRecord(record);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const raw = new TextEncoder().encode(JSON.stringify(compactSyncRecord(record)));
    let packed = raw;
    let compressed = false;
    try {
      const candidate = await transformSyncBytes(raw, "compress");
      if (candidate.length + 1 < raw.length) { packed = candidate; compressed = true; }
    } catch (_) { }
    const clear = new Uint8Array(packed.length + 1); clear[0] = compressed ? 1 : 0; clear.set(packed, 1);
    const aad = new TextEncoder().encode(SYNC_PREFIX);
    const cipher = new Uint8Array(await window.crypto.subtle.encrypt({ name: "AES-GCM", iv: iv, additionalData: aad }, await syncKey(), clear));
    const envelope = new Uint8Array(iv.length + cipher.length); envelope.set(iv, 0); envelope.set(cipher, iv.length);
    return SYNC_PREFIX + "." + bytesToBase64Url(envelope);
  }

  async function decodeSyncRecord(value) {
    value = value.trim();
    if (value.startsWith(SYNC_COMPAT_PREFIX + ".")) return decodeCompatSyncRecord(value);
    const parts = value.trim().split(".");
    if (parts.length !== 2 || parts[0] !== SYNC_PREFIX) throw new Error("同步码格式不正确或已过期，请重新生成短同步码。 ");
    if (!window.crypto || !window.crypto.subtle) throw new Error("当前设备无法解密加密短码，请在支持浏览器加密能力的设备中导入。 ");
    const envelope = base64UrlToBytes(parts[1]); const aad = new TextEncoder().encode(SYNC_PREFIX);
    if (envelope.length <= 12 + 16) throw new Error("同步码内容不完整。 ");
    const clear = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: envelope.slice(0, 12), additionalData: aad }, await syncKey(), envelope.slice(12)));
    const raw = clear[0] === 1 ? await transformSyncBytes(clear.slice(1), "decompress") : clear.slice(1);
    return expandSyncRecord(JSON.parse(new TextDecoder().decode(raw)));
  }

  async function exportSyncCode() {
    try {
      state.syncNotice = "正在生成同步码……";
      render();
      state.syncCode = await encodeSyncRecord(makeStudyRecord());
      const compatible = state.syncCode.startsWith(SYNC_COMPAT_PREFIX + ".");
      state.syncNotice = compatible ? "兼容短码已生成，请长按文本框复制完整内容。" : "同步码已生成，请长按文本框复制完整内容。";
      render();
      const clipboard = navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText.bind(navigator.clipboard) : null;
      if (clipboard) {
        const copyTimeout = new Promise(function (_, reject) { window.setTimeout(function () { reject(new Error("复制超时")); }, 1000); });
        Promise.race([clipboard(state.syncCode), copyTimeout]).then(function () {
          state.syncNotice = compatible ? "兼容短码已生成并复制，可粘贴到另一台设备导入。" : "同步码已生成并复制，可粘贴到另一台设备导入。";
          render();
        }).catch(function () { });
      }
      return;
    } catch (error) { state.syncNotice = error && error.message ? error.message : "同步码生成失败。"; }
    render();
  }

  async function importSyncCode() {
    try { applyStudyRecord(await decodeSyncRecord(state.syncCode)); state.syncNotice = "同步码导入完成：错题、进度和试卷记录已合并。"; state.view = "wrong"; render(); native.showMessage("同步码导入完成"); }
    catch (error) { state.syncNotice = error && error.message ? error.message : "同步码无效或已损坏。"; render(); }
  }

  let docImageMap = {};

  function examImageHtml(ids) {
    return (ids || []).map(function (id) { const encoded = docImageMap[id]; return encoded ? '<p class="figure"><img src="data:image/jpeg;base64,' + encoded + '" /></p>' : ""; }).join("");
  }

  function docText(value) {
    return escapeHtml(value).replace(/_\{([^{}]+)\}/g, '<sub class="doc-sub">$1</sub>').replace(/\^\{([^{}]+)\}/g, '<sup class="doc-sup">$1</sup>').replace(/\n/g, "<br />");
  }

  function buildExamDocHtml(record, questions) {
    const map = {};
    questions.forEach(function (question) {
      if (!isShuffledChoiceType(question.type)) { map[question.id] = question; return; }
      const choices = displayOptionChoices(question, record.id);
      map[question.id] = Object.assign({}, question, {
        options: choices.map(function (choice) { return choice.text; }),
        correct: choices.flatMap(function (choice, index) { return (question.correct || []).indexOf(choice.originalLetter) >= 0 ? [String.fromCharCode(65 + index) + ". " + choice.text] : []; }),
        answerText: ""
      });
    });
    const labels = { 判断: "是非题", 单选: "单项选择题", 多选: "多项选择题", 填空: "填空题", 大题: "计算与综合分析题" };
    const groups = Array.isArray(record.groups) && record.groups.length ? record.groups : EXAM_BLUEPRINT.filter(function (group) {
      return record.types.indexOf(group.type) >= 0;
    }).map(function (group) {
      const refs = record.questions.filter(function (item) { return item.type === group.type; });
      return { type: group.type, count: refs.length, points: refs.map(function (item) { return item.points; }) };
    }).filter(function (group) { return group.count > 0; });
    function sectionTitle(group, index, answer) { const points = group.points.reduce(function (sum, value) { return sum + value; }, 0); const same = group.points.every(function (value) { return value === group.points[0]; }); return ["一", "二", "三", "四", "五", "六"][index] + "、" + labels[group.type] + (answer ? "参考答案" : "（" + (same ? "每题" + group.points[0] + "分，共" + points + "分" : "共" + points + "分") + "）"); }
    const body = groups.map(function (group, groupIndex) { const refs = record.questions.filter(function (item) { return item.type === group.type; }); return '<h2>' + sectionTitle(group, groupIndex, false) + '</h2>' + refs.map(function (ref, index) { const question = map[ref.id]; if (!question) return ""; const options = question.options && question.options.length ? '<div class="options">' + question.options.map(function (option, optionIndex) { return '<p>' + String.fromCharCode(65 + optionIndex) + ". " + docText(option) + '</p>'; }).join("") + '</div>' : ""; const subparts = question.subparts && question.subparts.length ? '<ol>' + question.subparts.map(function (part) { return '<li>' + docText(part) + '</li>'; }).join("") + '</ol>' : ""; const space = group.type === "大题" ? '<div class="answer-space large"></div>' : group.type === "填空" ? '<div class="answer-space"></div>' : ""; return '<article class="question-block"><p class="question"><strong>' + (index + 1) + '. </strong>' + docText(question.text) + ' <em>（' + ref.points + '分）</em></p>' + subparts + options + examImageHtml(question.questionImages) + space + '</article>'; }).join(""); }).join("");
    const answerBody = groups.map(function (group, groupIndex) { const refs = record.questions.filter(function (item) { return item.type === group.type; }); return '<h2>' + sectionTitle(group, groupIndex, true) + '</h2>' + refs.map(function (ref, index) { const question = map[ref.id]; if (!question) return ""; const objective = question.correct && question.correct.length ? '<span class="answer-line"><strong>答案：</strong>' + escapeHtml(question.correct.join("、")) + '</span>' : ""; const answer = question.answerText ? '<span class="answer-text"><strong>' + (objective ? "解析：" : "参考答案：") + '</strong>' + docText(question.answerText) + '</span>' : ""; return '<article class="answer-block"><p><strong>' + (index + 1) + '. </strong>' + objective + answer + '</p>' + examImageHtml(question.answerImages) + '</article>'; }).join(""); }).join("");
    const chaptersText = record.chapters.map(function (chapter) { return "第" + chapter + "章"; }).join("、");
    return '<!doctype html><html><head><meta charset="utf-8"><title>' + escapeHtml(record.title) + '</title><style>@page{size:A4;margin:1.8cm 2cm 2cm}body{font-family:SimSun,serif;color:#111;line-height:1.45;margin:0;font-size:11.5pt}h1{text-align:center;font-size:22pt;margin:0 0 5pt}.paper-title{text-align:center;font-size:14pt;margin:0 0 9pt}.meta{text-align:center;color:#555;font-size:10.5pt;margin:0 0 12pt}h2{font-size:15pt;border-bottom:1px solid #888;padding-bottom:3pt;margin:14pt 0 7pt;page-break-after:avoid}.question-block{margin:0 0 8pt;page-break-inside:avoid}.question{margin:0 0 3pt}.question em{font-style:normal;color:#555;font-size:10pt}.options{margin:2pt 0 3pt 18pt}.options p{margin:1pt 0}.question-block ol{margin:2pt 0 4pt 24pt}.figure{text-align:center;margin:4pt 0;page-break-inside:avoid}.figure img{max-width:14cm;max-height:7.5cm;width:auto;height:auto;object-fit:contain}.doc-sub,.doc-sup{font-size:72%;line-height:0;position:relative;vertical-align:baseline}.doc-sub{bottom:-.25em}.doc-sup{top:-.35em}.answer-space{min-height:1cm;border-bottom:1px solid #bbb}.answer-space.large{min-height:4.2cm;border-bottom:0}.page-break{page-break-before:always}.answer-block{margin:0 0 8pt;page-break-inside:avoid}.answer-block>p{margin:0}.answer-line,.answer-text{display:block;margin:2pt 0}</style></head><body><h1>' + escapeHtml(cfg.docTitle) + '</h1><p class="paper-title">' + escapeHtml(record.title) + '</p><p class="meta">范围：' + escapeHtml(chaptersText || "未指定") + '&emsp;&emsp;总题数：' + record.questions.length + '&emsp;&emsp;总分：' + record.questions.reduce(function (sum, item) { return sum + item.points; }, 0) + '分</p>' + body + '<div class="page-break"></div><h1>参考答案</h1><p class="paper-title">' + escapeHtml(record.title) + '</p><p class="meta">答案与试卷题号一一对应</p>' + answerBody + '</body></html>';
  }

  async function exportExamDoc(id) {
    const record = findExam(id); if (!record) return;
    try {
      const questions = record.questions.map(function (ref) { return getQuestionCached(ref.id); });
      docImageMap = {};
      const imageIds = Array.from(new Set(questions.flatMap(function (question) { return [].concat(question.questionImages || [], question.answerImages || []); })));
      await Promise.all(imageIds.map(async function (imageId) {
        try {
          const response = await fetch("img/" + imageId + ".jpg");
          if (!response.ok) return;
          const blob = await response.blob();
          docImageMap[imageId] = await new Promise(function (resolve) {
            const reader = new FileReader();
            reader.onload = function () { resolve(String(reader.result).split(",")[1] || ""); };
            reader.onerror = function () { resolve(""); };
            reader.readAsDataURL(blob);
          });
        } catch (_) { }
      }));
      native.requestExport(buildExamDocHtml(record, questions), record.title + ".doc");
      state.examNotice = record.title + " 已导出为 Word 文件。"; render();
    } catch (error) { state.examNotice = error && error.message ? error.message : "Word 导出失败。"; render(); }
  }

  function onInput(event) {
    if (event.target && event.target.dataset.role === "draft") state.draft = event.target.value;
    if (event.target && event.target.dataset.role === "sync-code") state.syncCode = event.target.value;
  }

  function onAction(action, button) {
    if (action === "nav-chapters") { state.view = "chapters"; state.chapter = null; resetAnswer(); render(); }
    if (action === "nav-wrong") { state.view = "wrong"; resetAnswer(); render(); }
    if (action === "nav-stats") { state.view = "stats"; resetAnswer(); render(); }
    if (action === "nav-settings") { state.view = "settings"; resetAnswer(); render(); }
    if (action === "nav-exams") { state.view = "examRecords"; resetAnswer(); render(); }
    if (action === "select-chapter") { state.chapter = Number(button.dataset.chapter); state.view = "types"; render(); }
    if (action === "select-type") { state.type = button.dataset.type; state.view = "segments"; render(); }
    if (action === "back-types") { state.view = "types"; render(); }
    if (action === "enter-segment") enterSegment(Number(button.dataset.segment));
    if (action === "enter-wrong") {
      state.chapter = Number(button.dataset.chapter);
      state.mode = "wrong";
      state.optionShuffleSeed = newOptionShuffleSeed();
      state.ids = wrongIds.filter(function (id) { return idMeta[id] && idMeta[id].chapter === state.chapter; });
      state.index = 0; state.view = "question"; state.pickerOpen = false; resetAnswer(); render();
    }
    if (action === "question-back" || action === "finish-group") {
      state.view = state.mode === "practice" ? "segments" : (state.mode === "exam" || state.mode === "examWrong") ? "examRecords" : "wrong"; resetAnswer(); render();
    }
    if (action === "toggle-picker") { state.pickerOpen = !state.pickerOpen; render(); }
    if (action === "pick-question") goQuestion(Number(button.dataset.index));
    if (action === "prev-question") goQuestion(state.index - 1);
    if (action === "next-question") goQuestion(state.index + 1);
    if (action === "retry-question") { state.question = null; render(); }
    if (action === "select-option") {
      const letter = button.dataset.letter;
      state.notice = "";
      if (state.question.type === "多选") state.selected = state.selected.indexOf(letter) >= 0 ? state.selected.filter(function (item) { return item !== letter; }) : state.selected.concat(letter);
      else {
        state.selected = [letter];
        const correct = state.selected.slice().sort().join("|") === (state.question.correct || []).slice().sort().join("|");
        state.result = correct;
        state.revealed = true;
        recordAttempt(state.question.id, correct);
        recordExamOutcome(state.question.id, correct);
        if (!correct) addWrong(state.question.id);
        if (autoAdvanceCorrect && correct && state.index < state.ids.length - 1) {
          const questionId = state.question.id;
          const nextIndex = state.index + 1;
          window.setTimeout(function () {
            if (state.question && state.question.id === questionId && state.revealed && state.result === true) goQuestion(nextIndex);
          }, 650);
        }
      }
      render();
    }
    if (action === "submit") submitCurrent();
    if (action === "toggle-auto-advance") { autoAdvanceCorrect = !autoAdvanceCorrect; saveRecords(); render(); }
    if (action === "grade") gradeCurrent(button.dataset.grade);
    if (action === "remove-wrong") { removeWrong(state.question.id); state.notice = "已从错题本移除。"; render(); }
    if (action === "import-record") native.requestImport();
    if (action === "export-record") exportRecord();
    if (action === "import-sync-code") importSyncCode();
    if (action === "export-sync-code") exportSyncCode();
    if (action === "open-exam-builder") { state.view = "examBuilder"; state.examNotice = ""; render(); }
    if (action === "toggle-exam-chapter") toggleExamChapter(Number(button.dataset.chapter));
    if (action === "toggle-exam-type") toggleExamType(button.dataset.type);
    if (action === "toggle-all-exam-chapters") { state.examChapters = state.examChapters.length === chapters.length ? [] : chapters.map(function (chapter) { return chapter.chapter; }); render(); }
    if (action === "toggle-all-exam-types") { state.examTypes = state.examTypes.length === EXAM_TYPES.length ? [] : EXAM_TYPES.slice(); render(); }
    if (action === "create-exam") createExam();
    if (action === "continue-exam") { const record = findExam(button.dataset.examId); if (record) enterExam(record, false); }
    if (action === "exam-wrong") { const record = findExam(button.dataset.examId); if (record) enterExam(record, true); }
    if (action === "export-exam") exportExamDoc(button.dataset.examId);
    if (action === "delete-exam") deleteExam(button.dataset.examId);
  }

  function back() {
    if (state.view === "question" || state.view === "exam" || state.view === "examWrong") { state.view = state.mode === "practice" ? "segments" : (state.mode === "exam" || state.mode === "examWrong") ? "examRecords" : "wrong"; resetAnswer(); render(); return true; }
    if (state.view === "segments") { state.view = "types"; render(); return true; }
    if (state.view === "types" || state.view === "wrong" || state.view === "stats" || state.view === "settings" || state.view === "examBuilder" || state.view === "examRecords") { state.view = "chapters"; state.chapter = null; render(); return true; }
    return false;
  }

  current = { onInput: onInput, onAction: onAction, back: back, importRecord: importRecord };
  saveRecords();
  render();
  }

  app.addEventListener("input", function (event) {
    if (current) current.onInput(event);
  });

  app.addEventListener("click", function (event) {
    const button = event.target.closest("[data-action]");
    if (!button || button.disabled) return;
    const action = button.dataset.action;
    if (action === "choose-subject") { mountStudy(button.dataset.subject); return; }
    if (action === "goto-home") { showHome(); return; }
    if (current) current.onAction(action, button);
  });

  window.handleNativeImport = function (text) { if (current) current.importRecord(text); };
  window.nativeBack = function () {
    if (!current) native.closeApp();
    else if (!current.back()) showHome();
  };

  (async function boot() {
    app.innerHTML = '<div class="boot"><div class="boot-mark">械</div><strong>正在打开题库…</strong></div>';
    try {
      await Promise.all(Object.keys(SUBJECTS).map(async function (id) {
        const response = await fetch("data/" + id + ".json");
        if (!response.ok) throw new Error("data/" + id + ".json 读取失败");
        BANKS[id] = await response.json();
      }));
    } catch (_) {
      app.innerHTML = '<div class="boot"><div class="boot-mark">!</div><strong>题库数据加载失败，请刷新页面重试</strong></div>';
      return;
    }
    const hash = (window.location.hash || "").replace(/^#\/?/, "");
    if (SUBJECTS[hash]) mountStudy(hash);
    else showHome();
  })();
})();
