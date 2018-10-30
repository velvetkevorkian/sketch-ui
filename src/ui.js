class UI {
  constructor(config) {
    this.config = config
    this.createUI(this.config)
  }

  proxy() {
    return new Proxy(this.config, {
      get: (obj, prop) => {
        return obj[prop].value
      }
    })
  }

  createUI(object) {
    const panel = this.buildPanel()

    Object.entries(object).forEach(item => {
      const name = item[0]
      let attrs = item[1]

      if(attrs.type === undefined) {
        attrs.type = this.inferType(attrs.value)
      }

      const defaults = this.defaultSettings(attrs.type)
      if(defaults) {
        Object.entries(defaults).forEach(def => {
          if(attrs[def[0]] === undefined) {
            attrs[def[0]] = def[1]
          }
        })
      }

      panel.appendChild(this.buildLabel(name))
      panel.appendChild(this.buildInput(name, attrs))
    })
  }

  inferType(value) {
    if(value[0] == '#' && value.length == 7) return 'color'
    if(typeof value == 'number') return 'range'
    if(typeof value == 'boolean') return 'checkbox'

    else return 'text'
  }

  buildPanel() {
    const panel = document.createElement('div')
    panel.setAttribute('id', 'ui')
    document.body.appendChild(panel)
    return panel
  }

  buildLabel(name) {
    const label = document.createElement('label')
    label.setAttribute('for', name)
    label.appendChild(document.createTextNode(name))
    label.appendChild(document.createElement('span'))
    return label
  }

  defaultSettings(type) {
    const defaults = {
      range: {
        step: 1,
        min: 0,
        max: 255
      }
    }

    if(defaults[type] === undefined) return {}
    else return defaults[type]
  }

  buildInput(name, config) {
    let input = document.createElement('input')
    input.setAttribute('id', name)

    document.querySelector(`[for=${name}] span`).innerHTML = config.value

    Object.entries(config).forEach(attr => {
      const attrName = attr[0]
      const value = attr[1]
      input.setAttribute(attrName, value)
    })

    if(config.type == 'checkbox') {
      input.removeAttribute('value')
      if(config.value == true) {
        input.setAttribute('checked', config.value)
      }
    }

    input.addEventListener('input', event => {
      let newValue
      if(config.type == 'checkbox') {
        newValue = event.target.checked
      } else newValue = event.target.value
      this.setSetting(name, newValue)
    })

    return input
  }

  getSetting(key) {
    const type = this.config[key].type
    if(type == 'number' || type == 'range') return parseFloat(this.config[key].value)
    else return this.config[key].value
  }

  // TODO: naming is confusing here
  setSetting(key, value) {
    const obj = this.config[key]
    const min = obj.min
    const max = obj.max
    let newValue = value

    if(obj.type == 'number' || obj.type == 'range') {
      newValue = parseFloat(newValue)
      if((min !== undefined) && newValue < min) newValue = min
      if((max !== undefined) && newValue > max) newValue = max
    }

    if(obj.type == 'checkbox') {
      if(value == true) {
        document.getElementById(key).checked = true
      } else document.getElementById(key).removeAttribute('checked')
    } else {
      document.getElementById(key).value = newValue
    }

    this.config[key].value = newValue
    document.querySelector(`[for=${key}] span`).innerHTML = newValue
  }

  var(key, value = null) {
    if(!value) return this.getSetting(key)
    else this.setSetting(key, value)
  }
}

export default UI
