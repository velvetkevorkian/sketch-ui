class UI {
  constructor(config) {
    this.config = config
    this.createUI(this.config)
  }

  createUI(object) {
    const ui = document.createElement('div')
    ui.setAttribute('id', 'ui')
    document.body.appendChild(ui)

    Object.entries(object).forEach(item => {
      const name = item[0]
      const config = item[1]

      ui.appendChild(this.buildLabel(name))
      ui.appendChild(this.buildInput(name, config))
    })
  }

  buildLabel(name) {
    const label = document.createElement('label')
    label.setAttribute('for', name)
    label.appendChild(document.createTextNode(name))
    return label
  }

  buildInput(name, config) {
    let input = document.createElement('input')
    input.setAttribute('id', name)

    Object.entries(config).forEach(attr => {
      input.setAttribute(attr[0], attr[1])
    })

    input.addEventListener('input', event => {
      config.value = event.target.value
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
