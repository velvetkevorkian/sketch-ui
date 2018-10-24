import p5 from 'p5'
import './index.css'
import {createUI, getSetting} from './ui.js'

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

const sketch = p => {
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    createUI(state)
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
  }

  p.draw = () => {
    p.background(getSetting(state, 'backgroundColor'))
    p.fill(getSetting(state, 'fillColor'))
    p.ellipse(p.windowWidth/2, p.windowHeight/2, getSetting(state, 'width'))
  }
}

new p5(sketch)
