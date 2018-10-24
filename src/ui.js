function createUI(object) {
  const ui = document.createElement('div')
  ui.setAttribute('id', 'ui')
  document.body.appendChild(ui)

  Object.entries(object).forEach(item => {
    const name = item[0]
    const config = item[1]

    ui.appendChild(buildLabel(name))
    ui.appendChild(buildInput(name, config))
  })
}

function buildLabel(name) {
  const label = document.createElement('label')
  label.setAttribute('for', name)
  label.appendChild(document.createTextNode(name))
  return label
}

function buildInput(name, config) {
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

function getSetting(state, key) {
  const type = state[key].type
  if(type == 'number' || type == 'range') return parseFloat(state[key].value)
  else return state[key].value
}

function setSetting(state, key, value) {
  state[key].value = value
  document.getElementById(key).value = value
}

export {createUI, getSetting, setSetting}
