const MAX_HISTORY = 50

let records = []
let nextId = 1

export function addRecord(expression, result) {
  const record = {
    id: nextId++,
    expression,
    result,
    timestamp: new Date(),
  }
  records.unshift(record)
  if (records.length > MAX_HISTORY) {
    records.pop()
  }
  return record
}

export function getRecords() {
  return records.slice()
}

export function clearRecords() {
  records = []
}

export function count() {
  return records.length
}
