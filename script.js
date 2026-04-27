/* ════════════════════════════════════════
   EcoSort AI – script.js
   ════════════════════════════════════════ */

// ─── CONFIG ─────────────────────────────────────────────
const MODEL_URL = 'https://teachablemachine.withgoogle.com/models/0brwdJ-9M/';
// Để lưu vào Google Sheets, dán URL Web App của bạn vào đây:
const SHEETS_URL = ''; // Ví dụ: 'https://script.google.com/macros/s/xxxxx/exec'

// ─── WASTE TYPE CONFIG ───────────────────────────────────
// 4 loại rác khớp với mô hình Teachable Machine của bạn
const WASTE_TYPES = {
  'thuc-pham': {
    name: 'Thực phẩm thừa',
    icon: '🟢',
    emoji: '🍎',
    led: 'green',
    bin: '🟩',
    binLabel: 'Thùng Hữu Cơ (Xanh lá)',
    color: '#2dff6e',
    ecoMsg: '🌱 Thực phẩm thừa có thể ủ thành phân compost! 1kg rác thực phẩm ủ đúng cách tạo ra 300g phân bón tự nhiên, giúp cây trồng phát triển mà không cần hóa chất.',
    keywords: ['thực phẩm', 'trái cây', 'rau củ', 'food', 'fruit', 'vegetable', 'thuc pham', 'organic food', 'trai cay', 'rau'],
    threshold: 15,
    warningMsg: '⚠ Lượng thực phẩm thừa hôm nay rất nhiều! Hãy cân nhắc lắp thùng ủ compost mini hoặc liên hệ dịch vụ thu gom rác hữu cơ tại khu vực.'
  },
  'giay-carton': {
    name: 'Giấy & Bìa carton',
    icon: '🟡',
    emoji: '📦',
    led: 'yellow',
    bin: '🟨',
    binLabel: 'Thùng Tái Chế Giấy (Vàng)',
    color: '#ffd93d',
    ecoMsg: '♻ Tái chế 1 tấn giấy có thể cứu 17 cây xanh trưởng thành và tiết kiệm 26.000 lít nước! Hãy gấp phẳng bìa carton trước khi bỏ vào thùng để tiết kiệm không gian.',
    keywords: ['giấy', 'bìa', 'carton', 'paper', 'cardboard', 'bia carton', 'bao bì giấy', 'hộp giấy', 'giay'],
    threshold: 20,
    warningMsg: '⚠ Thùng tái chế giấy sắp đầy! Hãy liên hệ đơn vị thu mua phế liệu hoặc điểm thu gom giấy tái chế gần nhất.'
  },
  'chai-nhua-thuy-tinh': {
    name: 'Chai nhựa & Thủy tinh',
    icon: '🔵',
    emoji: '🍾',
    led: 'blue',
    bin: '🟦',
    binLabel: 'Thùng Tái Chế Cứng (Xanh dương)',
    color: '#3da8ff',
    ecoMsg: '♻ Một chai nhựa PET tái chế có thể trở thành sợi vải áo phao! Thủy tinh có thể tái chế 100% mà không mất chất lượng – hãy rửa sạch trước khi bỏ vào thùng.',
    keywords: ['chai', 'nhựa', 'thủy tinh', 'bottle', 'plastic', 'glass', 'chai nhua', 'chai thuy tinh', 'lon', 'pet'],
    threshold: 20,
    warningMsg: '⚠ Quá nhiều chai nhựa và thủy tinh! Hãy xem xét dùng bình nước cá nhân thay chai nhựa dùng một lần và liên hệ điểm thu gom tái chế gần nhất.'
  },
  'tui-nilon-ong-hut': {
    name: 'Túi nilon & Ống hút',
    icon: '🔴',
    emoji: '🛍',
    led: 'red',
    bin: '🟥',
    binLabel: 'Thùng Rác Khó Tái Chế (Đỏ)',
    color: '#ff4d6a',
    ecoMsg: '⚠ Túi nilon và ống hút nhựa mất 200–500 năm để phân hủy! Hãy chuyển sang túi vải, hộp cơm, và ống hút inox/tre để bảo vệ đại dương và sức khỏe.',
    keywords: ['túi nilon', 'ống hút', 'nilon', 'straw', 'plastic bag', 'tui nilon', 'ong hut', 'nylon', 'bao nilon'],
    threshold: 10,
    warningMsg: '🚨 Lượng túi nilon & ống hút vượt ngưỡng cảnh báo! Đây là loại rác khó phân hủy nhất. Hãy cân nhắc đặt thùng riêng và vận động mọi người giảm sử dụng ngay hôm nay.'
  }
};

// ─── LABEL MAP ───────────────────────────────────────────
// Ánh xạ nhãn Teachable Machine → key WASTE_TYPES
// Nhãn chính xác từ mô hình https://teachablemachine.withgoogle.com/models/0brwdJ-9M/
// Mở mô hình và kiểm tra tên class thực tế, thêm vào đây nếu cần
const LABEL_MAP = {
  // ── Thực phẩm thừa ──
  'thực phẩm thừa':        'thuc-pham',
  'thuc pham thua':        'thuc-pham',
  'food':                  'thuc-pham',
  'organic':               'thuc-pham',
  'fruit':                 'thuc-pham',
  'vegetable':             'thuc-pham',
  'trai cay rau cu':       'thuc-pham',
  'trái cây rau củ':       'thuc-pham',
  'thuc pham':             'thuc-pham',

  // ── Giấy & Bìa carton ──
  'giấy bìa carton':       'giay-carton',
  'giay bia carton':       'giay-carton',
  'paper':                 'giay-carton',
  'cardboard':             'giay-carton',
  'giay':                  'giay-carton',
  'giấy':                  'giay-carton',
  'carton':                'giay-carton',

  // ── Chai nhựa & Thủy tinh ──
  'chai nhựa thủy tinh rỗng': 'chai-nhua-thuy-tinh',
  'chai nhua thuy tinh':   'chai-nhua-thuy-tinh',
  'plastic bottle':        'chai-nhua-thuy-tinh',
  'glass bottle':          'chai-nhua-thuy-tinh',
  'bottle':                'chai-nhua-thuy-tinh',
  'plastic':               'chai-nhua-thuy-tinh',
  'chai':                  'chai-nhua-thuy-tinh',

  // ── Túi nilon & Ống hút ──
  'túi nilon ống hút nhựa':   'tui-nilon-ong-hut',
  'tui nilon ong hut':     'tui-nilon-ong-hut',
  'plastic bag':           'tui-nilon-ong-hut',
  'straw':                 'tui-nilon-ong-hut',
  'nilon':                 'tui-nilon-ong-hut',
  'nylon':                 'tui-nilon-ong-hut',
  'tui nilon':             'tui-nilon-ong-hut',
};

// ─── STATE ──────────────────────────────────────────────
let model = null;
let webcamStream = null;
let isModelLoaded = false;
let isRunning = false;
let animFrameId = null;
let currentResult = null;
let quizAnswered = false;
let pendingConfirm = false;

// Data storage (in-memory + localStorage)
let wasteLog = [];     // Toàn bộ lịch sử
let todayLog = [];     // Hôm nay
let score = 0;
let correctCount = 0;
let wrongCount = 0;
let warningCount = 0;
let miniPieChart = null;
let dashPieChart = null;
let dashBarChart = null;

// ─── INIT ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadFromStorage();
  setupTabs();
  setupFilters();
  updateUI();
  initDashboard();
  generateReport();
});

// ─── STORAGE ─────────────────────────────────────────────
function loadFromStorage() {
  const today = getDateStr();
  wasteLog = JSON.parse(localStorage.getItem('ecosort_log') || '[]');
  todayLog = wasteLog.filter(e => e.sessionDate === today);

  const scoreData = JSON.parse(localStorage.getItem('ecosort_score') || '{}');
  if (scoreData.date === today) {
    score = scoreData.score || 0;
    correctCount = scoreData.correct || 0;
    wrongCount = scoreData.wrong || 0;
  }

  warningCount = parseInt(localStorage.getItem('ecosort_warnings') || '0');
}

function saveToStorage() {
  localStorage.setItem('ecosort_log', JSON.stringify(wasteLog.slice(-500)));
  localStorage.setItem('ecosort_score', JSON.stringify({
    date: getDateStr(),
    score, correct: correctCount, wrong: wrongCount
  }));
  localStorage.setItem('ecosort_warnings', warningCount.toString());
}

function getDateStr(date) {
  return (date || new Date()).toISOString().split('T')[0];
}

// ─── TABS ─────────────────────────────────────────────────
function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + tab).classList.add('active');
      if (tab === 'dashboard') refreshDashboard('day');
    });
  });
}

// ─── MODEL LOADING ────────────────────────────────────────
async function loadModel() {
  setStatusDot('loading');
  showToast('⏳ Đang tải mô hình AI...', 'warning');
  try {
    const modelURL = MODEL_URL + 'model.json';
    const metaURL  = MODEL_URL + 'metadata.json';
    model = await tmImage.load(modelURL, metaURL);
    isModelLoaded = true;
    setStatusDot('active');
    showToast('✅ Mô hình AI đã sẵn sàng!', 'success');
    return true;
  } catch (e) {
    console.error('Model load error:', e);
    showToast('❌ Không tải được mô hình. Kiểm tra kết nối!', 'error');
    setStatusDot('');
    return false;
  }
}

// ─── CAMERA ───────────────────────────────────────────────
async function startCamera() {
  if (!isModelLoaded) {
    const ok = await loadModel();
    if (!ok) return;
  }
  try {
    webcamStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: 640, height: 480 },
      audio: false
    });
    const video = document.getElementById('webcam');
    video.srcObject = webcamStream;
    document.getElementById('videoOverlay').style.display = 'none';
    document.getElementById('scanLine').classList.add('active');
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;
    document.getElementById('captureBtn').disabled = false;
    document.getElementById('confPanel').style.display = 'block';
    isRunning = true;
    continuousPredict();
  } catch (e) {
    showToast('❌ Không thể truy cập camera: ' + e.message, 'error');
  }
}

function stopCamera() {
  isRunning = false;
  if (animFrameId) cancelAnimationFrame(animFrameId);
  if (webcamStream) webcamStream.getTracks().forEach(t => t.stop());
  document.getElementById('webcam').srcObject = null;
  document.getElementById('videoOverlay').style.display = 'flex';
  document.getElementById('scanLine').classList.remove('active');
  document.getElementById('startBtn').disabled = false;
  document.getElementById('stopBtn').disabled = true;
  document.getElementById('captureBtn').disabled = true;
  setStatusDot('');
}

// ─── CONTINUOUS PREDICT (live confidence bars) ────────────
async function continuousPredict() {
  if (!isRunning || !model) return;
  const video = document.getElementById('webcam');
  if (video.readyState >= 2) {
    try {
      const preds = await model.predict(video);
      renderConfBars(preds);
    } catch (e) {}
  }
  animFrameId = requestAnimationFrame(continuousPredict);
}

function renderConfBars(preds) {
  const container = document.getElementById('confBars');
  const sorted = [...preds].sort((a, b) => b.probability - a.probability);
  container.innerHTML = sorted.map(p => {
    const key = resolveLabel(p.className);
    const wt = WASTE_TYPES[key];
    const pct = (p.probability * 100).toFixed(1);
    const color = wt ? wt.color : '#6b7c6e';
    return `
      <div class="conf-bar-wrap">
        <div class="conf-bar-label">
          <span>${wt ? wt.name : p.className}</span>
          <span>${pct}%</span>
        </div>
        <div class="conf-bar-track">
          <div class="conf-bar-fill" style="width:${pct}%;background:${color}"></div>
        </div>
      </div>`;
  }).join('');
}

// ─── CAPTURE & CLASSIFY ────────────────────────────────────
async function captureAndClassify() {
  if (!model || !isRunning) return;
  const video = document.getElementById('webcam');
  try {
    const preds = await model.predict(video);
    const top = preds.reduce((a, b) => a.probability > b.probability ? a : b);
    const typeKey = resolveLabel(top.className);
    const conf = (top.probability * 100).toFixed(1);

    currentResult = { typeKey, conf, raw: top.className };
    quizAnswered = false;
    pendingConfirm = false;

    // Show quiz first
    showQuiz(typeKey);
    renderConfBars(preds);
  } catch (e) {
    showToast('❌ Lỗi nhận diện: ' + e.message, 'error');
  }
}

function resolveLabel(rawLabel) {
  const lower = rawLabel.toLowerCase().trim();
  if (LABEL_MAP[lower]) return LABEL_MAP[lower];
  // Fuzzy match
  for (const [key, wt] of Object.entries(WASTE_TYPES)) {
    if (wt.keywords.some(kw => lower.includes(kw))) return key;
  }
  return 'tui-nilon-ong-hut'; // default fallback – loại khó tái chế nhất
}

// ─── QUIZ ─────────────────────────────────────────────────
function showQuiz(correctKey) {
  const panel = document.getElementById('quizPanel');
  const opts  = document.getElementById('quizOptions');
  const fb    = document.getElementById('quizFeedback');
  panel.style.display = 'block';
  fb.textContent = '';
  fb.className = 'quiz-feedback';

  const allKeys = Object.keys(WASTE_TYPES);
  opts.innerHTML = allKeys.map(key => {
    const wt = WASTE_TYPES[key];
    return `<button class="quiz-opt" data-key="${key}" onclick="answerQuiz('${key}','${correctKey}')">
      ${wt.icon} ${wt.name}
    </button>`;
  }).join('');
}

function answerQuiz(chosen, correct) {
  if (quizAnswered) return;
  quizAnswered = true;
  const fb = document.getElementById('quizFeedback');
  const btns = document.querySelectorAll('.quiz-opt');
  btns.forEach(b => {
    b.disabled = true;
    if (b.dataset.key === correct) b.classList.add('correct');
    if (b.dataset.key === chosen && chosen !== correct) b.classList.add('wrong');
  });

  const isCorrect = chosen === correct;
  if (isCorrect) {
    score++;
    correctCount++;
    fb.textContent = '🎉 Chính xác! +1 điểm thành tích!';
    fb.className = 'quiz-feedback correct';
    playBeep(true);
  } else {
    score--;
    wrongCount++;
    const wt = WASTE_TYPES[correct];
    fb.textContent = `❌ Sai rồi! Đây là ${wt.name}. -1 điểm.`;
    fb.className = 'quiz-feedback wrong';
    playBeep(false);
  }
  saveToStorage();
  updateScoreboard();

  // Show result after short delay
  setTimeout(() => showResult(correct, currentResult.conf, isCorrect), 800);
}

// ─── RESULT DISPLAY ───────────────────────────────────────
function showResult(typeKey, conf, quizCorrect) {
  const wt = WASTE_TYPES[typeKey] || WASTE_TYPES['vo-co'];
  const panel = document.getElementById('resultPanel');
  panel.style.display = 'block';

  document.getElementById('resultIcon').textContent = wt.emoji;
  document.getElementById('resultTitle').textContent = wt.name;
  document.getElementById('resultConf').textContent = `Độ tin cậy: ${conf}%`;

  // LED lights
  document.querySelectorAll('.led').forEach(l => l.classList.remove('active'));
  const activeLed = document.querySelector(`.led.${wt.led}`);
  if (activeLed) activeLed.classList.add('active');

  // Arrow & bin
  document.getElementById('binIcon').textContent  = wt.bin;
  document.getElementById('binLabel').textContent  = wt.binLabel;
  document.getElementById('arrowLabel').textContent = '↓';

  // Eco message
  document.getElementById('ecoMessage').textContent = wt.ecoMsg;

  // Capacity warning
  const typeCount = todayLog.filter(e => e.type === typeKey).length;
  const capWarn = document.getElementById('capacityWarning');
  if (typeCount >= wt.threshold) {
    capWarn.style.display = 'block';
    capWarn.textContent = wt.warningMsg;
    warningCount++;
    saveToStorage();
  } else {
    capWarn.style.display = 'none';
  }

  // Confirm button
  document.getElementById('confirmBtn').style.display = 'flex';
  pendingConfirm = true;
}

// ─── CONFIRM: LOG THE ENTRY ───────────────────────────────
function confirmClassification() {
  if (!currentResult || !pendingConfirm) return;
  const { typeKey, conf } = currentResult;
  const now = new Date();
  const entry = {
    timestamp: now.toISOString(),
    sessionDate: getDateStr(now),
    hour: now.getHours(),
    type: typeKey,
    typeName: WASTE_TYPES[typeKey]?.name || typeKey,
    confidence: parseFloat(conf),
    scoreChange: quizAnswered ? (score > 0 ? 1 : -1) : 0
  };

  wasteLog.push(entry);
  todayLog = wasteLog.filter(e => e.sessionDate === getDateStr());
  saveToStorage();
  saveToSheets(entry);

  pendingConfirm = false;
  document.getElementById('confirmBtn').style.display = 'none';
  document.getElementById('quizPanel').style.display = 'none';

  updateUI();
  updateMiniPie();
  addLogItem(entry);
  showToast(`✅ Đã ghi nhận: ${entry.typeName}`, 'success');
}

// ─── GOOGLE SHEETS INTEGRATION ────────────────────────────
async function saveToSheets(entry) {
  if (!SHEETS_URL) return;
  try {
    await fetch(SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
  } catch (e) {
    console.warn('Google Sheets save failed:', e);
  }
}

// ─── UI UPDATES ───────────────────────────────────────────
function updateUI() {
  const counts = getCounts(todayLog);
  Object.keys(WASTE_TYPES).forEach(key => {
    const el = document.getElementById('cnt-' + key);
    if (el) el.textContent = counts[key] || 0;
  });
  document.getElementById('cnt-total').textContent = todayLog.length;
  document.getElementById('scoreDisplay').textContent = score;
  updateScoreboard();
  updateMiniPie();
  renderLogList();
}

function updateScoreboard() {
  document.getElementById('correctCount').textContent = correctCount;
  document.getElementById('wrongCount').textContent   = wrongCount;
  document.getElementById('totalScore').textContent   = score;
  document.getElementById('scoreDisplay').textContent = score;
}

function getCounts(log) {
  return log.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {});
}

// ─── MINI PIE CHART ───────────────────────────────────────
function updateMiniPie() {
  const counts = getCounts(todayLog);
  const labels = [], data = [], colors = [];
  Object.entries(WASTE_TYPES).forEach(([key, wt]) => {
    if (counts[key]) {
      labels.push(wt.name);
      data.push(counts[key]);
      colors.push(wt.color);
    }
  });

  if (miniPieChart) miniPieChart.destroy();
  const ctx = document.getElementById('miniPieChart').getContext('2d');
  if (data.length === 0) return;
  miniPieChart = new Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true, position: 'bottom',
          labels: { color: '#7a9c7d', font: { size: 10 }, boxWidth: 10, padding: 8 }
        }
      },
      cutout: '60%'
    }
  });
}

// ─── LOG LIST ─────────────────────────────────────────────
function renderLogList() {
  const container = document.getElementById('logList');
  const recent = [...todayLog].reverse().slice(0, 8);
  container.innerHTML = recent.map(e => {
    const wt = WASTE_TYPES[e.type];
    const time = new Date(e.timestamp).toLocaleTimeString('vi-VN', { hour:'2-digit', minute:'2-digit' });
    const sc = e.scoreChange;
    return `<div class="log-item">
      <span class="log-time">${time}</span>
      <span class="log-type">${wt ? wt.icon : '?'} ${e.typeName}</span>
      ${sc !== 0 ? `<span class="log-score ${sc > 0 ? 'pos' : 'neg'}">${sc > 0 ? '+1' : '-1'}</span>` : ''}
    </div>`;
  }).join('');
}

function addLogItem(entry) {
  renderLogList();
}

// ─── DASHBOARD ────────────────────────────────────────────
function initDashboard() {
  setupFilters();
}

function setupFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      refreshDashboard(btn.dataset.filter);
    });
  });
}

function getFilteredLog(filter) {
  const today = new Date();
  return wasteLog.filter(e => {
    const d = new Date(e.timestamp);
    if (filter === 'day') {
      return getDateStr(d) === getDateStr(today);
    } else if (filter === 'week') {
      const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 7);
      return d >= weekAgo;
    } else { // month
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    }
  });
}

function refreshDashboard(filter) {
  const log = getFilteredLog(filter);
  const counts = getCounts(log);
  const total = log.length;

  // KPIs
  document.getElementById('kpiTotal').textContent  = total;
  document.getElementById('kpiScore').textContent  = score;
  document.getElementById('kpiWarnings').textContent = warningCount;
  const acc = correctCount + wrongCount > 0
    ? Math.round((correctCount / (correctCount + wrongCount)) * 100) + '%'
    : '—';
  document.getElementById('kpiAcc').textContent = acc;

  // Pie Chart
  renderDashPie(counts);

  // Bar Chart
  renderDashBar(log, filter);

  // Report
  generateReport(log, filter);
}

function renderDashPie(counts) {
  const labels = [], data = [], colors = [];
  Object.entries(WASTE_TYPES).forEach(([key, wt]) => {
    labels.push(wt.name);
    data.push(counts[key] || 0);
    colors.push(wt.color);
  });

  if (dashPieChart) dashPieChart.destroy();
  const ctx = document.getElementById('pieChart').getContext('2d');
  dashPieChart = new Chart(ctx, {
    type: 'pie',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 2, borderColor: '#0a0f0d' }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#d8eed9', font: { size: 11 }, padding: 12 } }
      }
    }
  });
}

function renderDashBar(log, filter) {
  let labels = [], datasets = [];

  if (filter === 'day') {
    labels = Array.from({ length: 24 }, (_, i) => `${i}h`);
    datasets = Object.entries(WASTE_TYPES).map(([key, wt]) => ({
      label: wt.name,
      data: labels.map((_, h) => log.filter(e => new Date(e.timestamp).getHours() === h && e.type === key).length),
      backgroundColor: wt.color + '99',
      borderColor: wt.color,
      borderWidth: 1
    }));
  } else if (filter === 'week') {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      days.push(getDateStr(d));
    }
    labels = days.map(d => d.slice(5));
    datasets = Object.entries(WASTE_TYPES).map(([key, wt]) => ({
      label: wt.name,
      data: days.map(day => log.filter(e => e.sessionDate === day && e.type === key).length),
      backgroundColor: wt.color + '99',
      borderColor: wt.color,
      borderWidth: 1
    }));
  } else {
    const weeks = ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'];
    labels = weeks;
    datasets = Object.entries(WASTE_TYPES).map(([key, wt]) => ({
      label: wt.name,
      data: [0, 1, 2, 3].map(w => log.filter(e => {
        const day = new Date(e.timestamp).getDate();
        return Math.floor((day - 1) / 7) === w && e.type === key;
      }).length),
      backgroundColor: wt.color + '99',
      borderColor: wt.color,
      borderWidth: 1
    }));
  }

  if (dashBarChart) dashBarChart.destroy();
  const ctx = document.getElementById('barChart').getContext('2d');
  dashBarChart = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { color: '#d8eed9', font: { size: 11 } } }
      },
      scales: {
        x: { stacked: true, ticks: { color: '#7a9c7d' }, grid: { color: '#1e3524' } },
        y: { stacked: true, ticks: { color: '#7a9c7d' }, grid: { color: '#1e3524' } }
      }
    }
  });
}

// ─── AUTO REPORT ─────────────────────────────────────────
function generateReport(log, filter) {
  if (!log) { log = getFilteredLog('day'); filter = 'day'; }
  const counts = getCounts(log);
  const total = log.length;
  const filterName = { day: 'hôm nay', week: 'tuần này', month: 'tháng này' }[filter] || 'hôm nay';
  const container = document.getElementById('autoReport');
  if (!container) return;

  if (total === 0) {
    container.innerHTML = `<p>📭 Chưa có dữ liệu phân loại rác ${filterName}. Hãy bắt đầu bằng cách bật camera!</p>`;
    return;
  }

  // Find dominant type
  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  const dominantWT = dominant ? WASTE_TYPES[dominant[0]] : null;

  // Recycling rate
  const recycled = (counts['tai-che'] || 0) + (counts['huu-co'] || 0);
  const recycleRate = total > 0 ? Math.round((recycled / total) * 100) : 0;

  // Score status
  const scoreStatus = score >= 10 ? '🌟 Xuất sắc!' : score >= 5 ? '👍 Tốt!' : score >= 0 ? '🙂 Ổn định' : '⚠ Cần cải thiện';

  // Hazardous alert
  const hazardousAlert = (counts['nguy-hai'] || 0) >= WASTE_TYPES['nguy-hai'].threshold
    ? `<br>🚨 <strong>CẢNH BÁO:</strong> Lượng rác nguy hại vượt ngưỡng an toàn!` : '';

  container.innerHTML = `
    <p>📅 Báo cáo <strong>${filterName}</strong> – cập nhật lúc ${new Date().toLocaleTimeString('vi-VN')}</p>
    <br>
    <p>🗑 Tổng số rác được phân loại: <strong>${total} mục</strong></p>
    <p>🔄 Tỷ lệ rác có thể tái sử dụng/hữu cơ: <strong>${recycleRate}%</strong></p>
    ${dominantWT ? `<p>📊 Loại rác nhiều nhất: <strong>${dominantWT.icon} ${dominantWT.name} (${dominant[1]} mục)</strong></p>` : ''}
    <p>🏆 Điểm thành tích: <strong>${score} điểm</strong> – ${scoreStatus}</p>
    <p>✅ Đoán đúng: <strong>${correctCount}</strong> | ❌ Đoán sai: <strong>${wrongCount}</strong></p>
    ${warningCount > 0 ? `<p>⚠ Đã phát sinh <strong>${warningCount} cảnh báo</strong> sức chứa thùng rác</p>` : ''}
    ${hazardousAlert}
    <br>
    <p>💡 <em>Khuyến nghị: ${getAutoRecommendation(counts, total)}</em></p>
  `;
}

function getAutoRecommendation(counts, total) {
  if (total === 0) return 'Hãy bắt đầu phân loại rác để nhận khuyến nghị!';
  const nilon    = counts['tui-nilon-ong-hut'] || 0;
  const food     = counts['thuc-pham'] || 0;
  const paper    = counts['giay-carton'] || 0;
  const bottle   = counts['chai-nhua-thuy-tinh'] || 0;

  if (nilon >= WASTE_TYPES['tui-nilon-ong-hut'].threshold)
    return '🚨 Túi nilon & ống hút đang chiếm tỷ lệ cao nhất! Hãy vận động mọi người mang túi vải và bình nước cá nhân.';
  if (food > total * 0.4)
    return '🌱 Rất nhiều thực phẩm thừa hôm nay! Hãy xem xét khẩu phần ăn hợp lý hơn hoặc lắp thùng ủ compost tại chỗ.';
  if (paper >= WASTE_TYPES['giay-carton'].threshold)
    return '📦 Giấy và bìa carton nhiều – hãy gấp phẳng và liên hệ cơ sở thu mua phế liệu để tái chế.';
  if (bottle >= WASTE_TYPES['chai-nhua-thuy-tinh'].threshold)
    return '🍾 Nhiều chai nhựa & thủy tinh! Hãy rửa sạch trước khi bỏ vào thùng tái chế và cân nhắc dùng bình nước tái sử dụng.';
  return '👍 Bạn đang phân loại rác tốt! Hãy duy trì thói quen và chia sẻ kiến thức này với mọi người xung quanh.';
}

// ─── EXPORT CSV ───────────────────────────────────────────
function exportCSV() {
  if (wasteLog.length === 0) { showToast('Chưa có dữ liệu để xuất!', 'warning'); return; }
  const header = ['Thời gian', 'Ngày', 'Giờ', 'Loại rác', 'Tên loại', 'Độ tin cậy (%)', 'Điểm'];
  const rows = wasteLog.map(e => [
    e.timestamp, e.sessionDate, e.hour,
    e.type, e.typeName, e.confidence, e.scoreChange
  ]);
  const csv = [header, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `ecosort_${getDateStr()}.csv`;
  a.click();
  showToast('✅ Đã xuất file CSV!', 'success');
}

// ─── HELPERS ──────────────────────────────────────────────
function setStatusDot(state) {
  const dot = document.getElementById('statusDot');
  dot.className = 'status-dot ' + (state || '');
}

function showToast(msg, type = '') {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; }, 3000);
  setTimeout(() => t.remove(), 3400);
}

function playBeep(correct) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = correct ? 'sine' : 'sawtooth';
    osc.frequency.setValueAtTime(correct ? 880 : 220, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (correct ? 0.3 : 0.5));
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + (correct ? 0.3 : 0.5));
  } catch (e) {}
}
