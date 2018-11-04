export default class UI {
  constructor(config, context) {
    this.config = config
    this.context = context
    this.createUI(this.config)
    this.revocable = this.createProxy()
    this.proxy = this.revocable.proxy
    document.dispatchEvent(new Event('proxy-ready'))
  }

  destroy() {
    document.getElementById('ui').remove()
    this.revocable.revoke()
  }

  createProxy() {
    return Proxy.revocable(this.config, {
      get: (obj, prop) =>  obj[prop].value,
      set: (obj, prop, value) => {
        value = this.validate(obj, prop, value)
        obj[prop].value = value
        this.updateField(prop, value)
        if(obj[prop].callback) obj[prop].callback(value, this.context)
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
    const el = document.getElementById(prop)
    if(type === 'checkbox') {
      value === true ? el.checked = true : el.removeAttribute('checked')
    } else el.value = value

    document.querySelector(`[for=${prop}] span`).innerHTML = value
  }

  createUI(object) {
    const panel = this.buildPanel()

    for(let item in object) {
      let attrs = object[item]

      if(!attrs.type) attrs.type = this.inferType(attrs.value)

      const defaults = this.defaultSettings(attrs.type)
      object[item] = {...defaults, ...attrs}

      panel.appendChild(this.buildLabel(item))
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
    if(config.type === 'select') return this.buildSelect(name, config)

    let input = document.createElement('input')
    input.setAttribute('id', name)

    document.querySelector(`[for=${name}] span`).innerHTML = config.value

    const exclusions = ['callback']
    for(let attr in config) {
      if(!exclusions.includes(attr)) {
        input.setAttribute(attr, config[attr])
      }
    }

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

  buildSelect(name, config) {
    let select = document.createElement('select')
    select.setAttribute('id', name)
    config.value.forEach(val => {
      let option = document.createElement('option')
      option.setAttribute('value', val)
      option.appendChild(document.createTextNode(val))
      select.appendChild(option)
    })

    document.querySelector(`[for=${name}] span`).innerHTML = config.value[0]

    document.addEventListener('proxy-ready', () => {
      this.proxy[name] = config.value[0]
    }, {once: true})

    select.addEventListener('input', event => {
      this.proxy[name] = event.target.value
    })

    return select
  }
}
