class UI {
  constructor(config) {
    this.config = config
    this.createUI(this.config)
    this.proxy = this.proxy()
  }

  proxy() {
    return new Proxy(this.config, {
      get: (obj, prop) => {
        return obj[prop].value
      },
      set: (obj, prop, value) => {
        value = this.validate(obj, prop, value)
        obj[prop].value = value
        this.updateField(prop, value)
        return true
      }
    })
  }

  validate(obj, prop, value) {
    if(obj[prop].min !== undefined) value = Math.max(value, obj[prop].min)
    if(obj[prop].max !== undefined) value = Math.min(value, obj[prop].max)
    return value
  }

  updateField(prop, value) {
    const type = this.config[prop].type
    if(type === 'checkbox') {
      const el = document.getElementById(prop)
      value === true ? el.checked = true : el.removeAttribute('checked')
    } else {
      document.getElementById(prop).value = value
    }

    document.querySelector(`[for=${prop}] span`).innerHTML = value
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

  buildPanel(id = 'ui') {
    const panel = document.createElement('div')
    panel.setAttribute('id', id)
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
      this.proxy[name] = newValue
    })

    return input
  }
}

export default UI
