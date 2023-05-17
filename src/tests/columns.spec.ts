import { Columns } from '../columns'

describe('Columns', () => {
    it('must align text in columns', () => {
        const c = new Columns({
            count: 3,
            widths: [7, 10, 10],
            space: '   ',
            spaceFirst: ' - ',
        })
        c.write(0, ['Line 1'])
        c.write(1, ['The first line of the second column'])
        c.write(2, ['The first line of the third column'])
        c.space()
        c.write(0, ['- sub item 1'], 2)
        c.write(1, ['The second line of the second column'])
        c.write(2, [
            'The second line of the third column',
            'A new line for a column',
        ])
        expect(c.merge()).toMatchInlineSnapshot(`
Array [
  "Line 1  - The first  - The first ",
  "          line of      line of   ",
  "          the second   the third ",
  "          column       column    ",
  "                                 ",
  "  - sub   The second   The second",
  "  item    line of      line of   ",
  "  1       the second   the third ",
  "          column       column    ",
  "                       A new line",
  "                       for a     ",
  "                       column    ",
]
`)
    })
})
