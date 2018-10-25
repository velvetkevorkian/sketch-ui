import p5 from 'p5'
import './index.css'
import UI from './ui.js'

let state = {
  strokeColor: {
    value: '#ff0000',
    type: 'color'
  },
  strokeAlpha: {
    value: 10
  },
  backgroundColor: {
    value: '#202020',
    type: 'color'
  },
  diameter: {
    value: 50,
    max: 500
  }
}

new p5(p => {
  let ui

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    ui = new UI(state)
    p.background(ui.var('backgroundColor'))
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
    p.background(ui.var('backgroundColor'))
  }

  p.draw = () => {
    p.noFill()
    const str = p.color(ui.getSetting('strokeColor'))
    str.setAlpha(ui.var('strokeAlpha'))
    p.stroke(str)
    p.ellipse(p.windowWidth/2, p.windowHeight/2, ui.var('diameter'))
  }

  p.doubleClicked = () => {
    p.background(ui.getSetting('backgroundColor'))
    ui.var('diameter', 50)
  }
})
