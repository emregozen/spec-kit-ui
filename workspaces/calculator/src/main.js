import * as calculator from './calculator.js'
import * as history from './history.js'
import * as theme from './theme.js'
import './keyboard.js'
import * as ui from './ui.js'

const state = {
  displayString: '',
  result: null,
  errorMessage: null,
  isResult: false,
}

function render() {
  ui.renderExpression(state)
}

function onInput(token) {
  if (state.errorMessage) {
    // After error, any button starts fresh unless it's an operator
    state.displayString = ''
    state.errorMessage = null
    state.result = null
    state.isResult = false
  }

  if (state.isResult) {
    const operators = ['+', '-', '×', '÷', '^', ')']
    if (operators.includes(token)) {
      // Continue from result with operator
      state.displayString = state.result + token
    } else {
      // Start fresh expression
      state.displayString = token
    }
    state.result = null
    state.isResult = false
    state.errorMessage = null
    render()
    return
  }

  state.displayString += token
  state.errorMessage = null
  render()
}

function onEvaluate() {
  if (!state.displayString || state.displayString.trim() === '') return

  const { result, error } = calculator.evaluate(state.displayString)

  if (error) {
    state.errorMessage = error
    state.result = null
    state.isResult = false
    render()
    ui.shakeDisplay()
    return
  }

  history.addRecord(state.displayString, result)
  ui.renderHistory(history.getRecords())
  ui.renderHistoryCount(history.count())

  state.result = result
  state.errorMessage = null
  state.isResult = true
  render()
}

function onClear() {
  state.displayString = ''
  state.result = null
  state.errorMessage = null
  state.isResult = false
  render()
}

function onBackspace() {
  if (state.isResult || state.errorMessage) {
    onClear()
    return
  }
  state.displayString = state.displayString.slice(0, -1)
  render()
}

function onHistoryItemClick(result) {
  state.displayString = result
  state.result = null
  state.errorMessage = null
  state.isResult = false
  render()
}

function onHistoryClear() {
  history.clearRecords()
  ui.renderHistory([])
  ui.renderHistoryCount(0)
}

function onThemeToggle() {
  const next = theme.toggle()
  const icon = document.getElementById('theme-icon')
  if (icon) {
    icon.textContent = next === 'dark' ? '🌙' : '☀️'
  }
}

document.addEventListener('DOMContentLoaded', () => {
  ui.init({
    onInput,
    onEvaluate,
    onClear,
    onBackspace,
    onHistoryItemClick,
    onHistoryClear,
    onThemeToggle,
  })

  // Set initial theme icon
  const icon = document.getElementById('theme-icon')
  if (icon) {
    icon.textContent = theme.current() === 'dark' ? '🌙' : '☀️'
  }

  render()
})
