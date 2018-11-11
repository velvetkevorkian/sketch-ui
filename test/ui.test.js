import UI from '@/ui.js'

context('ui.js', () => {
  let ui
  let destroyed = false

  beforeEach(() => {
    ui = new UI({testVar: {value: 127}})
  })

  afterEach(() => {
    if(!destroyed) ui.destroy()
    destroyed = false
  })

  describe('creates basic UI elements', () => {
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

      describe('label', () => {
        beforeEach(() => {
          ui.destroy()
          ui = new UI({testVar: {value: 127, label: 'My test variable'}})
        })

        it('can be custom', () => {
          const label = document.querySelector('[for="testVar"]')
          expect(label).to.contain.text('My test variable')
        })
      })

      it('adds a span with the variable value', () => {
        const span = document.querySelector('[for="testVar"] span')
        expect(span).to.have.text('127')
      })
    })

    it('can be hidden', () => {
      const toggle = document.getElementById('ui-toggle')
      const event = new Event('click')
      toggle.dispatchEvent(event)
      const panel = document.getElementById('ui')
      expect(panel).to.have.class('hidden')
    })

    it('cleans up after itself', () => {
      destroyed = true
      ui.destroy()
      expect(document.body.innerHTML).to.equal('')
    })
  })

  describe('creates selects', () => {
    beforeEach(() => {
      ui = new UI({testArray: {value: ['one', 'two']}})
    })

    afterEach(() => ui.destroy())

    it('creates the select', () => {
      expect(document.querySelector('select#testArray')).to.be.ok
    })

    it('creates options with the right value', () => {
      expect(document.querySelector('option').value).to.equal('one')
    })

    it('creates the right number of options', () => {
      expect(document.querySelectorAll('option').length).to.equal(2)
    })
  })

  describe('getting and setting via proxy works', () => {
    let proxy

    beforeEach(() => {proxy = ui.proxy})

    it('can get a value', () => {
      expect(proxy.testVar).to.equal(127)
    })

    it('can set a value', () => {
      proxy.testVar = 200
      expect(proxy.testVar).to.equal(200)
    })

    it('updates the field', () => {
      proxy.testVar = 200
      const input = document.querySelector('#testVar')
      expect(input.value).to.equal('200')
    })

    it('updates the span', () => {
      proxy.testVar = 200
      const span = document.querySelector('[for="testVar"] span')
      expect(span).to.have.text('200')
    })

    describe('respects limits', () => {
      it("won't set < min", () => {
        proxy.testVar = -1000
        expect(proxy.testVar).to.equal(0)
      })

      it("won't set > max", () => {
        proxy.testVar = 1000
        expect(proxy.testVar).to.equal(255)
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

    it('select if array', () => {
      expect(ui.inferType(['one', 'two'])).to.equal('select')
    })

    it('falls back to text', () => {
      expect(ui.inferType('blah')).to.equal('text')
    })
  })

  describe('passing a callback works', () => {
    let context

    beforeEach(() => {
      context = {called: false}

      ui = new UI({testVar: {
        value: 127,
        callback: function(val, context) {
          context.called = true
        }
      }}, context)
    })

    afterEach(() => ui.destroy())

    it('calls the callback', () => {
      ui.proxy.testVar = 200
      expect(context.called).to.be.true
    })
  })

  describe('creates buttons', () => {
    let context

    beforeEach(() => {
      context = {called: false}
      ui = new UI({button: {
        type: 'button',
        callback: function(context) {
          context.called = true
        }
      }}, context)
    })

    afterEach(() => ui.destroy())

    it('calls the callback when clicked', () => {
      const evt = new Event('click')
      const button = document.getElementById('button')
      button.dispatchEvent(evt)
      expect(context.called).to.be.true
    })
  })


})
