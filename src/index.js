import p5 from 'p5'
import './index.css'
import {createUI, getSetting, setSetting} from './ui.js'

let state = {
  strokeColor: {
    value: '#ff0000',
    type: 'color'
  },
  strokeAlpha: {
    value: 10,
    type: 'range',
    min: 0,
    max: 255,
    step: 1
  },
  backgroundColor: {
    value: '#202020',
    type: 'color'
  },
  diameter: {
    value: 50,
    type: 'range',
    min: 0,
    max: 500,
    step: 1
  }
}

new p5(p => {
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    createUI(state)
    p.background(getSetting(state, 'backgroundColor'))
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
    p.background(getSetting(state, 'backgroundColor'))
  }

  p.draw = () => {
    p.noFill()
    const str = p.color(getSetting(state, 'strokeColor'))
    str.setAlpha(getSetting(state, 'strokeAlpha'))
    p.stroke(str)
    p.ellipse(p.windowWidth/2, p.windowHeight/2, getSetting(state, 'diameter'))
  }

  p.doubleClicked = () => {
    p.background(getSetting(state, 'backgroundColor'))
    setSetting(state, 'diameter', 50)
  }
})
