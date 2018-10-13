import p5 from 'p5'

const sketch = function(p) {
  p.setup = function() {
    p.createCanvas(640, 480)
  }

  p.draw = function() {
    p.fill(255, 0, 0)
    p.ellipse(320, 240, 50, 50)
  }
}

const p5js = new p5(sketch)
