const STORAGE_KEY = 'calculator-theme'

function resolveInitialTheme() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'light'
}

let _current = resolveInitialTheme()
document.documentElement.dataset.theme = _current

export function current() {
  return _current
}

export function set(theme) {
  _current = theme
  document.documentElement.dataset.theme = theme
  localStorage.setItem(STORAGE_KEY, theme)
}

export function toggle() {
  const next = _current === 'light' ? 'dark' : 'light'
  set(next)
  return next
}
