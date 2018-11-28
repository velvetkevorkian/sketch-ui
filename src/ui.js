export default class UI {
  constructor(config, options) {
    this.config = config
    const defaults = {
      uid: Math.floor(Math.random() * Date.now()),
      selector: 'body'
    }
    if(!options) options = {}
    this.options = Object.assign(defaults, options)

    this.createUI(this.config)
    this.revocable = this.createProxy()
    this.proxy = this.revocable.proxy
    document.dispatchEvent(new Event('proxy-ready'))
  }

  destroy() {
    document.querySelector(`${this.options.selector} .sketch-ui-panel`).remove()
    this.revocable.revoke()
  }

  createProxy() {
    return Proxy.revocable(this.config, {
      get: (obj, prop) =>  obj[prop].value,
      set: (obj, prop, value) => {
        value = this.validate(obj, prop, value)
        obj[prop].value = value
        this.updateField(prop, value)
        if(obj[prop].callback) obj[prop].callback(value, this.options.context)
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
    const el = document.getElementById(this.attrWithUid(prop))
    if(type === 'checkbox') {
      value === true ? el.checked = true : el.removeAttribute('checked')
    } else el.value = value

    document.querySelector(`[for=${this.attrWithUid(prop)}] span`).innerHTML = value
  }

  createUI(object) {
    const panel = this.buildPanel()

    for(let item in object) {
      let attrs = object[item]

      if(!attrs.type) attrs.type = this.inferType(attrs.value)

      const defaults = this.defaultSettings(attrs.type)
      // Spread with object literals not supported in Edge
      // object [item] = {...defaults, ...attrs}
      object[item] = Object.assign(defaults, attrs)

      if(attrs.type != 'button') {
        panel.appendChild(this.buildLabel(item, object[item].label))
      }
      panel.appendChild(this.buildInput(item, object[item]))
    }
  }

  inferType(value) {
    if(typeof value == 'string' && value[0] == '#' && value.length == 7) return 'color'
    if(typeof value == 'number') return 'range'
    if(typeof value == 'boolean') return 'checkbox'
    if(Array.isArray(value)) return 'select'
    else return 'text'
  }

  buildPanel(selector = this.options.selector) {
    const panel = document.createElement('div')
    panel.setAttribute('class', 'sketch-ui-panel')
    const toggle = document.createElement('button')
    toggle.innerHTML = 'Toggle UI'
    toggle.setAttribute('class', 'ui-toggle')
    toggle.addEventListener('click', () => { panel.classList.toggle('hidden') })
    panel.appendChild(toggle)
    document.querySelector(selector).appendChild(panel)
    return panel
  }

  buildLabel(name, text = name) {
    const label = document.createElement('label')
    label.setAttribute('for', this.attrWithUid(name))
    label.appendChild(document.createTextNode(text))
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
    if(config.type === 'button') return this.buildButton(name, config)
    if(config.type === 'select') return this.buildSelect(name, config)

    let input = document.createElement('input')
    input.setAttribute('id', this.attrWithUid(name))

    document.querySelector(`[for=${this.attrWithUid(name)}] span`).innerHTML = config.value

    const exclusions = ['callback', 'label', 'value']

    for(let attr in config) {
      if(!exclusions.includes(attr)) {
        input.setAttribute(attr, config[attr])
      }
    }

    input.value = config['value']

    if(config.type == 'checkbox') {
      input.removeAttribute('value')
      if(config.value == true) {
        input.setAttribute('checked', config.value)
      }
    }

    if(config.type == 'checkbox') {
      input.addEventListener('change', event => {
        this.proxy[name] = event.target.checked
      })
    } else {
      input.addEventListener('input', event => {
        this.proxy[name] = event.target.value
      })
    }

    return input
  }

  buildButton(name, config) {
    const button = document.createElement('button')
    button.setAttribute('id', this.attrWithUid(name))
    button.innerHTML = config.label ? config.label : name
    if(config.callback) {
      button.addEventListener('click', event => {
        event.preventDefault()
        config.callback(this.options.context)
      })
    }

    const div = document.createElement('div')
    div.appendChild(button)

    return div
  }

  buildSelect(name, config) {
    let select = document.createElement('select')
    select.setAttribute('id', this.attrWithUid(name))
    config.value.forEach(val => {
      let option = document.createElement('option')
      option.setAttribute('value', val)
      option.appendChild(document.createTextNode(val))
      select.appendChild(option)
    })

    document.querySelector(`[for=${this.attrWithUid(name)}] span`).innerHTML = config.value[0]

    document.addEventListener('proxy-ready', () => {
      this.proxy[name] = config.value[0]
    }, {once: true})

    select.addEventListener('change', event => {
      this.proxy[name] = event.target.value
    })

    return select
  }

  attrWithUid(attr) {
    return `${attr}-${this.options.uid}`
  }
}
