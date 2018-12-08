function validate(obj, prop, value) {
  if(obj[prop].min !== undefined) value = Math.max(value, obj[prop].min)
  if(obj[prop].max !== undefined) value = Math.min(value, obj[prop].max)
  return value
}

function inferType(value) {
  if(typeof value == 'string' && value[0] == '#' && value.length == 7) return 'color'
  if(typeof value == 'number') return 'range'
  if(typeof value == 'boolean') return 'checkbox'
  if(Array.isArray(value)) return 'select'
  else return 'text'
}

function defaultSettings(type) {
  const defaults = {
    range: {
      step: 1,
      min: 0,
      max: 255
    }
  }

  return defaults[type]  ? defaults[type] : {}
}

function panelStyle(width, height) {
  return `width: ${width}px; height: ${height}px;`
}

export { validate, inferType, defaultSettings, panelStyle }