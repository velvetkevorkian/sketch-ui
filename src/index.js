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
  let ui, v

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    ui = new UI(state)
    v = ui.proxy()
    p.background(v.backgroundColor)
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
    p.background(v.backgroundColor)
  }

  p.draw = () => {
    p.noFill()
    const str = p.color(v.strokeColor)
    str.setAlpha(v.strokeAlpha)
    p.stroke(str)
    p.ellipse(p.windowWidth/2, p.windowHeight/2, v.diameter)

    if(v.animate) {
      const newDiameter = v.diameter + p.map(p.noise(Date.now()), 0, 1, v.step * -0.5, v.step * 0.5)
      ui.var('diameter', newDiameter)
    }
  }

  p.doubleClicked = () => {
    p.background(v.backgroundColor)
    ui.var('diameter', 250)
  }
})
