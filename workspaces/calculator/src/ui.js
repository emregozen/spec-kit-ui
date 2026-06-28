let _els = {}
let _historyOpen = false

function relativeTime(date) {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000)
  if (secs < 60) return 'just now'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  return `${hrs} hr ago`
}

export function init(deps) {
  _els = {
    expressionLine: document.getElementById('expression-line'),
    resultLine: document.getElementById('result-line'),
    display: document.getElementById('display'),
    themeToggle: document.getElementById('theme-toggle'),
    themeIcon: document.getElementById('theme-icon'),
    historyToggle: document.querySelector('.btn-history-toggle'),
    historyPanel: document.getElementById('history-panel'),
    historyList: document.getElementById('history-list'),
    historyBadge: document.getElementById('history-badge'),
    historyClear: document.getElementById('history-clear'),
  }

  // Bind number/token buttons
  document.querySelectorAll('[data-token]').forEach(btn => {
    btn.addEventListener('click', () => deps.onInput(btn.dataset.token))
  })

  // Bind action buttons
  document.querySelectorAll('[data-action]').forEach(btn => {
    const action = btn.dataset.action
    btn.addEventListener('click', () => {
      if (action === 'clear') deps.onClear()
      else if (action === 'evaluate') deps.onEvaluate()
      else if (action === 'backspace') deps.onBackspace()
    })
  })

  // History panel toggle
  if (_els.historyToggle) {
    _els.historyToggle.addEventListener('click', () => deps.onThemeToggle ? toggleHistoryPanel() : toggleHistoryPanel())
  }

  // History clear
  if (_els.historyClear) {
    _els.historyClear.addEventListener('click', () => deps.onHistoryClear())
  }

  // History list item clicks (delegated)
  if (_els.historyList) {
    _els.historyList.addEventListener('click', (e) => {
      const item = e.target.closest('.history-item')
      if (item && item.dataset.result) {
        deps.onHistoryItemClick(item.dataset.result)
      }
    })
  }

  // Theme toggle button
  if (_els.themeToggle) {
    _els.themeToggle.addEventListener('click', () => deps.onThemeToggle())
  }

  // Subscribe to keyboard custom events
  document.addEventListener('calculator:input', (e) => deps.onInput(e.detail.token))
  document.addEventListener('calculator:evaluate', () => deps.onEvaluate())
  document.addEventListener('calculator:clear', () => deps.onClear())
  document.addEventListener('calculator:backspace', () => deps.onBackspace())
  document.addEventListener('calculator:key-highlight', (e) => highlightKey(e.detail.key))

  // History toggle button (the H button specifically)
  const historyBtn = document.querySelector('.btn-history-toggle')
  if (historyBtn) {
    historyBtn.onclick = () => toggleHistoryPanel()
  }
}

export function renderExpression(state) {
  if (!_els.expressionLine) return
  _els.expressionLine.textContent = state.displayString || ''

  const rl = _els.resultLine
  if (!rl) return

  if (state.errorMessage) {
    rl.textContent = state.errorMessage
    rl.className = 'result-line result-line--error'
  } else if (state.result !== null && state.result !== '') {
    rl.textContent = state.result
    rl.className = 'result-line result-line--visible'
  } else {
    rl.textContent = ''
    rl.className = 'result-line'
  }
}

export function renderHistory(records) {
  if (!_els.historyList) return
  _els.historyList.innerHTML = ''
  records.forEach(record => {
    const li = document.createElement('li')
    li.className = 'history-item'
    li.dataset.result = record.result
    li.setAttribute('aria-label', `expression: ${record.expression}, result: ${record.result}`)
    li.innerHTML = `
      <div class="history-item__expression">${escapeHtml(record.expression)}</div>
      <div class="history-item__result">${escapeHtml(record.result)}</div>
      <div class="history-item__time">${relativeTime(record.timestamp)}</div>
    `
    _els.historyList.appendChild(li)
  })
}

export function renderHistoryCount(count) {
  if (!_els.historyBadge) return
  if (count === 0) {
    _els.historyBadge.style.display = 'none'
  } else {
    _els.historyBadge.style.display = 'flex'
    _els.historyBadge.textContent = count > 99 ? '99+' : String(count)
  }
}

export function shakeDisplay() {
  if (!_els.display) return
  _els.display.classList.remove('display--shake')
  void _els.display.offsetWidth // force reflow
  _els.display.classList.add('display--shake')
  _els.display.addEventListener('animationend', () => {
    _els.display.classList.remove('display--shake')
  }, { once: true })
}

export function highlightKey(key) {
  const btn = document.querySelector(`[data-key="${CSS.escape(key)}"]`)
  if (!btn) return
  btn.classList.add('btn--pressed')
  setTimeout(() => btn.classList.remove('btn--pressed'), 150)
}

export function toggleHistoryPanel(forceOpen) {
  if (forceOpen !== undefined) {
    _historyOpen = Boolean(forceOpen)
  } else {
    _historyOpen = !_historyOpen
  }
  if (_els.historyPanel) {
    _els.historyPanel.classList.toggle('history-panel--open', _historyOpen)
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
