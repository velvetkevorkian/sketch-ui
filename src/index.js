import p5 from 'p5'
import './index.css'

let state = {
  fillColor: {
    value: '#ff0000',
    type: 'color'
  },
  backgroundColor: {
    value: '#202020',
    type: 'color'
  },
  width: {
    value: 50,
    type: 'range',
    min: 0,
    max: 500,
    step: 1
  }
}

function settings(key) {
  const type = state[key].type
  if(type == 'number' || type == 'range') return parseFloat(state[key].value)
  else return state[key].value
}

function createUI() {
  const ui = document.createElement('div')
  ui.setAttribute('id', 'ui')
  document.body.appendChild(ui)

  Object.entries(state).forEach(item => {
    const name = item[0]
    const config = item[1]

    let label = document.createElement('label')
    label.setAttribute('for', name)
    label.appendChild(document.createTextNode(name))
    ui.appendChild(label)

    let input = document.createElement('input')
    input.setAttribute('id', name)
    Object.entries(config).forEach(attr => {
      input.setAttribute(attr[0], attr[1])
    })

    input.addEventListener('input', event => {
      state[name].value = event.target.value
    })

    ui.appendChild(input)
  })
}

const sketch = p => {
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    createUI()
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
  }

  p.draw = () => {
    p.background(settings('backgroundColor'))
    p.fill(settings('fillColor'))
    p.ellipse(p.windowWidth/2, p.windowHeight/2, settings('width'))
  }
}

const p5js = new p5(sketch)
