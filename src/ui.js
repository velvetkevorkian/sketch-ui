import { validate, inferType, defaultSettings } from './utils.js'

export default class UI {
  constructor(variables, options) {
    this.variables = variables
    const defaults = {
      uid: 'ui-' + Math.floor(Math.random() * Date.now()),
      selector: 'body'
    }
    if(!options) options = {}
    this.options = Object.assign(defaults, options)

    if(localStorage.getItem(this.options.uid)) {
      // merge defaults with stored
      console.log(JSON.parse(localStorage.getItem(this.options.uid)))
    }

    this.createUI(this.variables)
    this.revocable = this.createProxy()
    this.proxy = this.revocable.proxy
    window.sketchUI = (window.ui || [])
    window.sketchUI.push(this)
    document.dispatchEvent(new Event('proxy-ready'))
  }

  destroy() {
    this.panel.remove()
    this.revocable.revoke()
    return null
  }

  getState() {
    return {
      width: this.width,
      height: this.height,
      values: this.getValues()
    }
  }

  saveState() {
    window.localStorage.setItem(this.options.uid, JSON.stringify(this.getState()))
  }

  getValues() {
    let values = []
    for(let v in this.variables) {
      values.push({[v]: this.variables[v].value})
    }
    return values
  }

  createProxy() {
    return Proxy.revocable(this.variables, {
      get: (obj, prop) => obj[prop].value,
      set: (obj, prop, value) => {
        value = validate(obj, prop, value)
        obj[prop].value = value
        this.updateField(prop, value)
        if(obj[prop].callback) obj[prop].callback(value, this.options.context)
        this.saveState()
        return true
      }
    })
  }

  updateSize() {
    this.width = this.panel.offsetWidth
    this.height = this.panel.offsetHeight
    this.saveState()
  }

  updateField(prop, value) {
    const type = this.variables[prop].type
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

      if(!attrs.type) attrs.type = inferType(attrs.value)

      const defaults = defaultSettings(attrs.type)
      // Spread with object literals not supported in Edge
      // object [item] = {...defaults, ...attrs}
      object[item] = Object.assign(defaults, attrs)

      if(attrs.type != 'button') {
        panel.appendChild(this.buildLabel(item, object[item].label))
      }
      panel.appendChild(this.buildInput(item, object[item]))
    }

    this.panel = panel
    this.updateSize()
    return panel
  }

  buildPanel(selector = this.options.selector) {
    const el = document.querySelector(selector)
    el.innerHTML = `
    <div class='sketch-ui-panel' id='${this.options.uid}'>
      <button class='ui-toggle'>Toggle UI</button>
    </div>
  `
    const panel = el.querySelector(`#${this.options.uid}`)
    panel.querySelector('.ui-toggle')
      .addEventListener('click', () => { panel.classList.toggle('hidden') })

    panel.addEventListener('mouseup', () => this.updateSize())

    return panel
  }

  buildLabel(name, text = name) {
    const label = document.createElement('label')
    label.setAttribute('for', this.attrWithUid(name))
    label.innerHTML = `${text}<span></span>`
    return label
  }

  buildInput(name, variables) {
    if(variables.type === 'button') return this.buildButton(name, variables)
    if(variables.type === 'select') return this.buildSelect(name, variables)

    let input = document.createElement('input')
    input.setAttribute('id', this.attrWithUid(name))

    document.querySelector(`[for=${this.attrWithUid(name)}] span`).innerHTML = variables.value

    const exclusions = ['callback', 'label', 'value']

    for(let attr in variables) {
      if(!exclusions.includes(attr)) {
        input.setAttribute(attr, variables[attr])
      }
    }

    input.value = variables['value']

    if(variables.type == 'checkbox') {
      input.removeAttribute('value')
      if(variables.value == true) {
        input.setAttribute('checked', variables.value)
      }
    }

    if(variables.type == 'checkbox') {
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

  buildButton(name, variables) {
    const div = document.createElement('div')
    div.classList.add('sketch-ui-button-wrapper')
    div.innerHTML = `
      <button id=${this.attrWithUid(name)}>
        ${variables.label ? variables.label : name}
      </button>
    `

    if(variables.callback) {
      const button = div.querySelector('button')
      button.addEventListener('click', event => {
        event.preventDefault()
        variables.callback(this.options.context)
      })
    }

    return div
  }

  buildSelect(name, variables) {
    let select = document.createElement('select')
    select.setAttribute('id', this.attrWithUid(name))
    select.innerHTML = variables.value.map(option => {
      return `<option value='${option}'>${option}</option>`
    }).join('')

    document.querySelector(`[for=${this.attrWithUid(name)}] span`).innerHTML = variables.value[0]

    document.addEventListener('proxy-ready', () => {
      this.proxy[name] = variables.value[0]
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
