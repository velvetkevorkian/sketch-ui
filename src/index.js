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
    value: false,
    callback: function(val, p) {
      val == true ? p.loop() : p.noLoop()
    }
  },
  option: {
    value: ['one', 'two', 'three']
  }
}

new p5(p => {
  const v = new UI(state, p).proxy

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    p.background(v.backgroundColor)
    p.noLoop()
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

    const newDiameter = v.diameter + p.map(p.noise(Date.now()), 0, 1, v.step * -0.5, v.step * 0.5)
    v.diameter = newDiameter
  }

  p.doubleClicked = () => {
    p.background(v.backgroundColor)
    v.diameter, 250
  }
})
