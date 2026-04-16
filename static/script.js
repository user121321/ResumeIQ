/* ──────────────────────────────────────────────────────────────────
   script.js  –  Resume Analyzer frontend logic
────────────────────────────────────────────────────────────────── */

window.addEventListener('DOMContentLoaded', function () {

  var form           = document.getElementById('analyzeForm');
  var dropZone       = document.getElementById('dropZone');
  var resumeInput    = document.getElementById('resumeInput');
  var fileNameEl     = document.getElementById('fileName');
  var analyzeBtn     = document.getElementById('analyzeBtn');
  var loadingState   = document.getElementById('loadingState');
  var errorBanner    = document.getElementById('errorBanner');
  var errorMessage   = document.getElementById('errorMessage');
  var resultsSection = document.getElementById('resultsSection');

  // ── Hide everything on page load ────────────────────────────────
  loadingState.style.display   = 'none';
  errorBanner.style.display    = 'none';
  resultsSection.style.display = 'none';

  // ── Drop Zone ───────────────────────────────────────────────────
  dropZone.addEventListener('click', function () {
    resumeInput.click();
  });

  dropZone.addEventListener('dragover', function (e) {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', function () {
    dropZone.classList.remove('drag-over');
  });

  dropZone.addEventListener('drop', function (e) {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    var file = e.dataTransfer.files[0];
    if (file) setFile(file);
  });

  resumeInput.addEventListener('change', function () {
    if (resumeInput.files[0]) setFile(resumeInput.files[0]);
  });

  function setFile(file) {
    if (!file.name.endsWith('.pdf')) {
      showError('Only PDF files are supported.');
      return;
    }
    var dt = new DataTransfer();
    dt.items.add(file);
    resumeInput.files = dt.files;
    fileNameEl.textContent = '✓ ' + file.name;
  }

  // ── Form Submit ─────────────────────────────────────────────────
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Clear previous state
    errorBanner.style.display    = 'none';
    resultsSection.style.display = 'none';
    errorMessage.textContent     = '';

    // Validate
    if (!resumeInput.files || !resumeInput.files[0]) {
      showError('Please select a PDF resume.');
      return;
    }

    var jd = document.getElementById('jobDesc').value.trim();
    if (!jd) {
      showError('Please enter a job description.');
      return;
    }

    // Show loading
    loadingState.style.display = 'flex';
    analyzeBtn.disabled = true;

    var formData = new FormData(form);

    try {
      var resp = await fetch('/analyze', {
        method: 'POST',
        body: formData
      });

      var data = await resp.json();

      if (!resp.ok || data.error) {
        showError(data.error || 'An error occurred. Please try again.');
        return;
      }

      renderResults(data);

    } catch (err) {
      showError('Network error – please check your connection and try again.');
      console.error(err);
    } finally {
      loadingState.style.display = 'none';
      analyzeBtn.disabled = false;
    }
  });

  // ── Show Error ──────────────────────────────────────────────────
  function showError(msg) {
    errorMessage.textContent  = msg;
    errorBanner.style.display = 'flex';
    loadingState.style.display = 'none';
  }

  // ── Render Results ──────────────────────────────────────────────
  function renderResults(data) {
    var score = Math.min(100, Math.max(0, Number(data.match_score) || 0));
    animateScore(score);

    var verdictBadge = document.getElementById('verdictBadge');
    verdictBadge.textContent = data.overall_verdict || '—';
    verdictBadge.className   = 'verdict-badge ' + verdictClass(data.overall_verdict);

    document.getElementById('verdictSummary').textContent = data.summary || '';

    populateList('strengthsList', data.strengths);
    populateList('gapsList',      data.gaps);

    populateTags('skillsMatched', data.skills_matched, 'tag-green');
    populateTags('skillsMissing', data.skills_missing, 'tag-red');

    document.getElementById('experienceText').textContent = data.experience_assessment || '—';
    document.getElementById('educationText').textContent  = data.education_assessment  || '—';

    populateTags('atsFound',   data.ats_keywords_found,   'tag-green');
    populateTags('atsMissing', data.ats_keywords_missing, 'tag-red');

    populateOrderedList('recList', data.recommendations);

    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── Score Ring ──────────────────────────────────────────────────
  function animateScore(score) {
    var circumference = 2 * Math.PI * 52;
    var offset = circumference * (1 - score / 100);

    var ringFill = document.getElementById('ringFill');
    var scoreNum = document.getElementById('scoreNumber');

    ringFill.style.strokeDashoffset = circumference;
    scoreNum.textContent = '0';

    setTimeout(function () {
      ringFill.style.strokeDashoffset = offset;
    }, 50);

    var duration = 1200;
    var start    = performance.now();
    function tick(now) {
      var elapsed  = now - start;
      var progress = Math.min(elapsed / duration, 1);
      var eased    = 1 - Math.pow(1 - progress, 3);
      scoreNum.textContent = Math.round(eased * score);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ── List Builder ────────────────────────────────────────────────
  function populateList(id, items) {
    var el = document.getElementById(id);
    el.innerHTML = '';
    if (!items || items.length === 0) {
      var li = document.createElement('li');
      li.textContent = 'None identified.';
      el.appendChild(li);
      return;
    }
    items.forEach(function (item) {
      var li = document.createElement('li');
      li.textContent = item;
      el.appendChild(li);
    });
  }

  // ── Tags Builder ────────────────────────────────────────────────
  function populateTags(id, items, cls) {
    var el = document.getElementById(id);
    el.innerHTML = '';
    if (!items || items.length === 0) {
      var span = document.createElement('span');
      span.className   = 'tag';
      span.textContent = 'None';
      span.style.color = 'var(--text-mute)';
      el.appendChild(span);
      return;
    }
    items.forEach(function (item) {
      var span = document.createElement('span');
      span.className   = 'tag ' + cls;
      span.textContent = item;
      el.appendChild(span);
    });
  }

  // ── Ordered List Builder ────────────────────────────────────────
  function populateOrderedList(id, items) {
    var el = document.getElementById(id);
    el.innerHTML = '';
    (items || []).forEach(function (item) {
      var li = document.createElement('li');
      li.textContent = item;
      el.appendChild(li);
    });
  }

  // ── Verdict Class ───────────────────────────────────────────────
  function verdictClass(verdict) {
    if (!verdict) return '';
    var v = verdict.toLowerCase();
    if (v.includes('strong'))  return 'strong';
    if (v.includes('good'))    return 'good';
    if (v.includes('partial')) return 'partial';
    if (v.includes('weak'))    return 'weak';
    if (v.includes('not'))     return 'no-match';
    return '';
  }

});
