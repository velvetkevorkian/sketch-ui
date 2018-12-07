import UI from '@/ui.js'

context('ui.js', () => {
  let ui, ui2
  // let destroyed = false

  beforeEach(() => {
    ui = new UI(
      {testVar: {value: 127}},
      {uid: 'id'}
    )
  })

  afterEach(() => {
    if(ui) ui = ui.destroy()
    // destroyed = false
  })

  describe('parses options', () => {
    it('sets the selector to body', () => {
      expect(ui.options.selector).to.equal('body')
    })

    it('sets the uid to id', () => {
      expect(ui.options.uid).to.equal('id')
    })
  })

  describe('creates basic UI elements', () => {
    it('creates the panel', () => {
      expect(document.querySelector('.sketch-ui-panel')).to.be.ok
    })

    it('creates the input', () => {
      const input = document.getElementById('testVar-id')
      expect(input.value).to.eq('127')
    })

    describe('creates a label', () => {
      it("for attribute matches the input's ID", () => {
        const label = document.querySelector('[for="testVar-id"]')
        expect(label).to.be.ok
      })

      it("label's text matches variable name", () => {
        const label = document.querySelector('[for="testVar-id"]')
        expect(label).to.contain.text('testVar')
      })

      describe('label', () => {
        beforeEach(() => {
          ui.destroy()
          ui = new UI(
            {testVar: {value: 127, label: 'My test variable'}},
            {uid: 'id'})
        })

        it('can be custom', () => {
          const label = document.querySelector('[for="testVar-id"]')
          expect(label).to.contain.text('My test variable')
        })
      })

      it('adds a span with the variable value', () => {
        const span = document.querySelector('[for="testVar-id"] span')
        expect(span).to.have.text('127')
      })
    })

    it('can be hidden', () => {
      const toggle = document.querySelector('.ui-toggle')
      const event = new Event('click')
      toggle.dispatchEvent(event)
      const panel = document.querySelector('.sketch-ui-panel')
      expect(panel).to.have.class('hidden')
    })

    it('cleans up after itself', () => {
      // destroyed = true
      if(ui) ui = ui.destroy()
      const result = document.body.innerHTML.replace(/\s+/g, '')
      expect(result).to.equal('')
    })
  })

  describe('creates selects', () => {
    beforeEach(() => {
      ui = new UI(
        {testArray: {value: ['one', 'two']}},
        {uid: 'id'}
      )
    })

    it('creates the select', () => {
      expect(document.querySelector('select#testArray-id')).to.be.ok
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
      const input = document.querySelector('#testVar-id')
      expect(input.value).to.equal('200')
    })

    it('updates the span', () => {
      proxy.testVar = 200
      const span = document.querySelector('[for="testVar-id"] span')
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

  describe('passing a callback works', () => {
    let context

    beforeEach(() => {
      context = {called: false}

      ui = new UI({testVar: {
        value: 127,
        callback: function(val, context) {
          context.called = true
        }
      }}, {context: context})
    })

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
      }}, {context: context, uid: 'id'})
    })

    it('calls the callback when clicked', () => {
      const evt = new Event('click')
      const button = document.getElementById('button-id')
      button.dispatchEvent(evt)
      expect(context.called).to.be.true
    })
  })

  describe.skip('can create multiple UIs', () => {
    beforeEach(() => {
      ui2 = new UI(
        {testVar: {value: 127}},
        {uid: 'id2'}
      )
    })

    afterEach(() => {
      if(ui2) ui2 = ui2.destroy()
    })

    it('creates two panels', () => {
      expect(document.querySelectorAll('.sketch-ui-panel').length).to.eq(2)
    })

    describe('they have separate values', () => {
      it('internally', () => {
        ui2.proxy.testVar = 12
        expect(ui.proxy.testVar).to.eq(127)
      })

      it('in the dom', () => {
        ui2.proxy.testVar = 12
        const result1 = document.querySelector('#testVar-id').value == '127'
        const result2 = document.querySelector('#testVar-id2').value == '12'
        expect(result1).to.be.true
        expect(result2).to.be.true
      })
    })
  })


})
