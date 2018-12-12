import { validate, inferType, defaultSettings, panelStyle } from './utils.js'

export default class UI {
  constructor(variables, options) {
    this.variables = variables
    const defaults = {
      uid: 'ui-' + Math.floor(Math.random() * Date.now()),
      selector: 'body',
      save: true,
      width: 320,
      height: 450,
      xpos: 0,
      ypos: 0
    }
    if(!options) options = {}
    this.options = Object.assign(defaults, options)
    this.width = this.options.width
    this.height = this.options.height
    this.xpos = this.options.xpos
    this.ypos = this.options.ypos

    // jsdom throws an error if you access localStorage on about:blank
    // but it seems to be impossible to navigate to a url with jsdom-global.
    // Swallow that particular error and hope for the best.
    try {
      const savedState = window.localStorage.getItem(this.options.uid)
      if(savedState && this.options.save) {
        const parsedState = JSON.parse(savedState)
        this.width = parsedState.width
        this.height = parsedState.height
        this.xpos = parsedState.xpos
        this.ypos = parsedState.ypos

        parsedState.values.forEach(val => {
          const name = Object.keys(val)[0]
          const value = Object.values(val)[0]
          this.variables[name].value = value
        })
      }
    } catch(err) { if(err.name != 'SecurityError') throw err }

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

  getState() {
    return {
      width: this.width,
      height: this.height,
      xpos: this.xpos,
      ypos: this.ypos,
      values: this.getValues()
    }
  }

  saveState() {
    if(this.options.save) {
      const newState = JSON.stringify(this.getState())
      try {
        window.localStorage.setItem(this.options.uid, newState)
      } catch(err) { if(err.name != 'SecurityError') throw err }
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
    this.width = this.panel.offsetWidth
    this.height = this.panel.offsetHeight
    const newStyle = panelStyle(this.width, this.height, {x: this.xpos, y: this.ypos})
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
    <div class='sketch-ui-panel' id='${this.options.uid}' style='${panelStyle(this.width, this.height)}'>
      <div class='sketch-ui-handle'>Move</div>
      <button class='ui-toggle'>Toggle UI</button>
      <button class='ui-clear'>Clear saved</button>
    </div>
  `
    const panel = el.querySelector(`#${this.options.uid}`)
    panel.querySelector('.ui-toggle')
      .addEventListener('click', () => { panel.classList.toggle('hidden') })

    panel.querySelector('.ui-clear')
      .addEventListener('click', () => window.localStorage.clear())

    const handle = panel.querySelector('.sketch-ui-handle')
    handle.addEventListener('mousedown', event => {
      event.preventDefault()
      const rect = panel.getBoundingClientRect()
      this.xpos = rect.left
      this.ypos = rect.top
      this.xOffset = event.clientX - this.xpos
      this.yOffset = event.clientY - this.ypos

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
    this.xpos = event.clientX - this.xOffset
    this.ypos = event.clientY - this.yOffset
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
    select.innerHTML = variables.options.map(option => {
      const selected = option == variables.value ? 'selected' : ''
      return `
        <option ${selected} value='${option}'>
          ${option}
        </option>
      `
    }).join('')

    const initialValue = variables.value ? variables.value : variables.options[0]

    document.querySelector(`[for=${this.attrWithUid(name)}] span`).innerHTML = initialValue

    select.addEventListener('change', event => {
      this.proxy[name] = event.target.value
    })

    return select
  }

  attrWithUid(attr) {
    return `${attr}-${this.options.uid}`
  }
}
