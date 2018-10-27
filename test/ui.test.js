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

    it('creates a matching label', () => {
      const label = document.querySelector('[for="testVar"]')
      expect(label).to.be.ok
    })
  })

  describe('getting and setting works using var()', () => {
    it('can get a value', () => {
      expect(ui.var('testVar')).to.equal(127)
    })

    it('can set a value', () => {
      ui.var('testVar', 1000)
      expect(ui.var('testVar')).to.equal(1000)
    })
  })


})
