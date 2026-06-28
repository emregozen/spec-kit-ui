const KEY_MAP = {
  '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
  '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
  '.': '.',
  '+': '+',
  '-': '-',
  '*': '×',
  '/': '÷',
  '(': '(',
  ')': ')',
  '^': '^',
}

function dispatch(type, detail = {}) {
  document.dispatchEvent(new CustomEvent(type, { detail }))
}

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.altKey || e.metaKey) return

  const key = e.key

  if (key === 'Enter' || key === '=') {
    e.preventDefault()
    dispatch('calculator:evaluate')
    dispatch('calculator:key-highlight', { key: 'Enter' })
    return
  }

  if (key === 'Escape' || key === 'Delete') {
    dispatch('calculator:clear')
    dispatch('calculator:key-highlight', { key: 'Escape' })
    return
  }

  if (key === 'Backspace') {
    e.preventDefault()
    dispatch('calculator:backspace')
    dispatch('calculator:key-highlight', { key: 'Backspace' })
    return
  }

  const token = KEY_MAP[key]
  if (token !== undefined) {
    dispatch('calculator:input', { token })
    dispatch('calculator:key-highlight', { key })
    return
  }
})
