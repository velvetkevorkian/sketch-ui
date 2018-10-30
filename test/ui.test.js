import UI from '@/ui.js'

context('ui.js', () => {
  let ui

  beforeEach(() => {
    ui = new UI({testVar: {value: 127}})
  })

  describe('creates UI elements', () => {
    it('creates the panel', () => {
      expect(document.getElementById('ui')).to.be.ok
    })

    it('creates the input', () => {
      const input = document.getElementById('testVar')
      expect(input).to.have.attr('value', '127')
    })

    describe('creates a label', () => {
      it("for attribute matches the input's ID", () => {
        const label = document.querySelector('[for="testVar"]')
        expect(label).to.be.ok
      })

      it("label's text matches variable name", () => {
        const label = document.querySelector('[for="testVar"]')
        expect(label).to.contain.text('testVar')
      })

      it('adds a span with the variable value', () => {
        const span = document.querySelector('[for="testVar"] span')
        expect(span).to.have.text('127')
      })
    })
  })

  describe('getting and setting works', () => {
    beforeEach(() => {
      ui = new UI({testVar: {value: 127}}).proxy
    })

    it('can get a value', () => {
      expect(ui.testVar).to.equal(127)
    })

    it('can set a value', () => {
      ui.testVar = 200
      expect(ui.testVar).to.equal(200)
    })

    describe('respects limits', () => {
      it("won't set < min", () => {
        ui.testVar = -1000
        expect(ui.testVar).to.equal(0)
      })

      it("won't set > max", () => {
        ui.testVar = 1000
        expect(ui.testVar).to.equal(255)
      })
    })
  })

  describe('we can guess the input type from the value', () => {
    it('color if hex code', () => {
      expect(ui.inferType('#ff0000')).to.equal('color')
    })

    it('range if number', () => {
      expect(ui.inferType(100)).to.equal('range')
    })

    it('checkbox if boolean', () => {
      expect(ui.inferType(true)).to.equal('checkbox')
    })

    it('falls back to text', () => {
      expect(ui.inferType('blah')).to.equal('text')
    })
  })


})
