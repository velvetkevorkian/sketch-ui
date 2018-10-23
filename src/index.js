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
  }
}

function settings(key) {
  return state[key].value
}

function createUI() {
  const ui = document.getElementById('ui')

  Object.entries(state).forEach(item => {
    const name = item[0]
    const config = item[1]

    let label = document.createElement('label')
    label.setAttribute('for', name)
    label.appendChild(document.createTextNode(name))
    ui.appendChild(label)

    let input = document.createElement('input')
    input.setAttribute('id', name)
    input.setAttribute('type', config.type)
    input.setAttribute('value', config.value)
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
    p.ellipse(p.windowWidth/2, p.windowHeight/2, 50, 50)
  }
}

const p5js = new p5(sketch)
