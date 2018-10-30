import p5 from 'p5'
import './index.css'
import UI from './ui.js'

let state = {
  strokeColor: {
    value: '#ff0000'
  },
  strokeAlpha: {
    value: 100
  },
  backgroundColor: {
    value: '#202020'
  },
  diameter: {
    value: 50,
    max: 500
  },
  step: {
    value: 5,
  },
  animate: {
    value: false
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
    const str = p.color(ui.var('strokeColor'))
    str.setAlpha(ui.var('strokeAlpha'))
    p.stroke(str)
    p.ellipse(p.windowWidth/2, p.windowHeight/2, ui.var('diameter'))

    if(ui.var('animate') === true) {
      const newDiameter = ui.var('diameter') + p.map(p.noise(Date.now()), 0, 1, ui.var('step') * -0.5, ui.var('step') * 0.5)
      ui.var('diameter', newDiameter)
    }
  }

  p.doubleClicked = () => {
    p.background(ui.var('backgroundColor'))
    ui.var('diameter', 250)
  }
})
