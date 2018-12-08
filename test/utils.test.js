import { inferType, panelStyle } from '@/utils.js'

context('utils.js', () => {
  describe('inferType', () => {
    it('color if hex code', () => {
      expect(inferType('#ff0000')).to.equal('color')
    })

    it('range if number', () => {
      expect(inferType(100)).to.equal('range')
    })

    it('checkbox if boolean', () => {
      expect(inferType(true)).to.equal('checkbox')
    })

    it('select if array', () => {
      expect(inferType(['one', 'two'])).to.equal('select')
    })

    it('falls back to text', () => {
      expect(inferType('blah')).to.equal('text')
    })
  })

  describe('panelStyle', () => {
    it('returns a style string', () => {
      expect(panelStyle(100, 200)).to.equal('width: 100px; height: 200px;')
    })
  })
})
