import { create, all } from 'mathjs'

const math = create(all)
const DEG = Math.PI / 180

const scope = {
  sin: x => Math.sin(x * DEG),
  cos: x => Math.cos(x * DEG),
  tan: x => Math.tan(x * DEG),
}

export function prepareForEval(displayString) {
  return displayString
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/√\(/g, 'sqrt(')
    .replace(/ln\(/g, 'log(')
    .replace(/−/g, '-')
}

export function formatResult(value) {
  if (!isFinite(value) || isNaN(value)) return null
  return math.format(value, { notation: 'auto', precision: 10 })
}

export function evaluate(displayString) {
  if (!displayString || displayString.trim() === '') {
    return { result: '', error: null }
  }

  try {
    const evalString = prepareForEval(displayString)
    const value = math.evaluate(evalString, { ...scope })

    if (value === Infinity || value === -Infinity) {
      return { result: '', error: 'Cannot divide by zero' }
    }
    if (typeof value === 'number' && isNaN(value)) {
      return { result: '', error: 'Invalid input' }
    }
    if (typeof value === 'object' && value.re !== undefined) {
      // Complex number result
      return { result: '', error: 'Invalid input' }
    }

    const formatted = formatResult(value)
    if (formatted === null) {
      return { result: '', error: 'Invalid input' }
    }
    return { result: formatted, error: null }
  } catch (e) {
    const msg = e.message || ''
    if (msg.includes('divide') || msg.includes('zero')) {
      return { result: '', error: 'Cannot divide by zero' }
    }
    return { result: '', error: 'Invalid input' }
  }
}
