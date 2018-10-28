class UI {
  constructor(config) {
    this.config = config
    this.createUI(this.config)
  }

  createUI(object) {
    const panel = this.buildPanel()

    Object.entries(object).forEach(item => {
      const name = item[0]
      const config = item[1]

      panel.appendChild(this.buildLabel(name))
      panel.appendChild(this.buildInput(name, config))
    })
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

    if(config.type === undefined) config.type = 'range'
    const attrs = Object.assign(this.defaultSettings(config.type), config)
    document.querySelector(`[for=${name}] span`).innerHTML = config.value

    Object.entries(attrs).forEach(attr => {
      const attrName = attr[0]
      const value = attr[1]
      input.setAttribute(attrName, value)
    })

    input.addEventListener('input', event => {
      const newValue = event.target.value
      config.value = newValue
      document.querySelector(`[for=${name}] span`).innerHTML = newValue
    })

    return input
  }

  getSetting(key) {
    const type = this.config[key].type
    if(type == 'number' || type == 'range') return parseFloat(this.config[key].value)
    else return this.config[key].value
  }

  setSetting(key, value) {
    this.config[key].value = value
    document.getElementById(key).value = value
  }

  var(key, value = null) {
    if(!value) return this.getSetting(key)
    else this.setSetting(key, value)
  }
}

export default UI
