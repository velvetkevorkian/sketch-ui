import { validate, inferType, defaultSettings, panelStyle } from './utils.js'

export default class UI {
  constructor(variables, options) {
    this.variables = variables
    const defaultOptions = {
      uid: 'ui-' + Math.floor(Math.random() * Date.now()),
      selector: 'body',
      save: false,
      width: 320,
      height: 450,
      xpos: 0,
      ypos: 0
    }
    if(!options) options = {}
    this.options = Object.assign(defaultOptions, options)

    if(this.options.save) this.readSavedState()

    this.createUI(this.variables)
    this.revocable = this.createProxy()
    this.proxy = this.revocable.proxy
    window.sketchUI = (window.ui || [])
    window.sketchUI.push(this)
  }

  destroy() {
    this.panel.remove()
    this.revocable.revoke()
    return null
  }

  readSavedState() {
    const savedState = window.localStorage.getItem(this.options.uid)
    if(savedState) {
      const parsedState = JSON.parse(savedState)

      parsedState.values.forEach(val => {
        const name = Object.keys(val)[0]
        const value = Object.values(val)[0]
        if(this.variables[name]) this.variables[name].value = value
      })

      delete parsedState.values
      this.options = Object.assign(this.options, parsedState)
    }
  }

  getState() {
    return {
      width: this.options.width,
      height: this.options.height,
      xpos: this.options.xpos,
      ypos: this.options.ypos,
      values: this.getValues()
    }
  }

  saveState() {
    if(this.options.save) {
      const newState = JSON.stringify(this.getState())
      window.localStorage.setItem(this.options.uid, newState)
    }
  }

  getValues() {
    let values = []
    for(let v in this.variables) {
      if(this.variables[v].type != 'button') {
        values.push({[v]: this.variables[v].value})
      }
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
    const opts = this.options
    opts.width = this.panel.offsetWidth
    opts.height = this.panel.offsetHeight
    const newStyle = panelStyle(opts.width, opts.height, {x: opts.xpos, y: opts.ypos})
    this.panel.setAttribute('style', newStyle)
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

      if(!attrs.type) {
        if(attrs.options) {
          attrs.type = 'select'
        } else {
          attrs.type = inferType(attrs.value)
        }
      }

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
    <div class='sketch-ui-panel' id='${this.options.uid}' style='${panelStyle(this.options.width, this.options.height)}'>
      <div class='sketch-ui-handle'>Move</div>
      <button class='ui-clear'>Clear saved</button>
    </div>
  `
    const panel = el.querySelector(`#${this.options.uid}`)
    document.addEventListener('keyup', event => {
      if(event.key == 'h') panel.classList.toggle('hidden')
    })

    panel.querySelector('.ui-clear')
      .addEventListener('click', () => window.localStorage.clear())

    const handle = panel.querySelector('.sketch-ui-handle')
    handle.addEventListener('mousedown', event => {
      event.preventDefault()
      const rect = panel.getBoundingClientRect()
      const scroll = document.querySelector(this.options.selector).getBoundingClientRect().top
      const opts = this.options
      opts.xpos = rect.left
      opts.ypos = rect.top - scroll
      opts.xOffset = event.clientX - opts.xpos
      opts.yOffset = event.clientY - opts.ypos

      const callback = this.handlePanelDrag.bind(this)
      document.addEventListener('mousemove', callback)
      document.addEventListener('mouseup', event => {
        event.preventDefault()
        document.removeEventListener('mousemove', callback)
      })
    })

    panel.addEventListener('mouseup', () => this.updateSize())

    return panel
  }

  handlePanelDrag(event) {
    this.options.xpos = event.clientX - this.options.xOffset
    this.options.ypos = event.clientY - this.options.yOffset
    this.updateSize()
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
      if(variables.value) input.setAttribute('checked', variables.value)

      input.addEventListener('change', event => {
        this.proxy[name] = event.target.checked
      })
    }

    else {
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
    const initialValue = variables.value ? variables.value : variables.options[0]
    variables.value = initialValue
    select.innerHTML = variables.options.map(option => {
      const selected = option == initialValue ? 'selected' : ''
      return `
        <option ${selected} value='${option}'>
          ${option}
        </option>
      `}).join('')

    document.querySelector(`[for=${this.attrWithUid(name)}] span`).innerHTML = initialValue
    select.addEventListener('change', event => this.proxy[name] = event.target.value)
    return select
  }

  attrWithUid(attr) { return `${attr}-${this.options.uid}` }
}
