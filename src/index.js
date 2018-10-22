import p5 from 'p5'
import './index.css'

const sketch = p => {
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
  }

  p.draw = () => {
    p.background(20, 20, 20)
    p.fill(255, 0, 0)
    p.ellipse(p.windowWidth/2, p.windowHeight/2, 50, 50)
  }
}

const p5js = new p5(sketch)
