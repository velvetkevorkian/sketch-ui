import { inferType } from '@/utils.js'

context('utils.js', () => {
  describe('we can guess the input type from the value', () => {
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
})