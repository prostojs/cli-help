import {
    entriesSorter,
    evalEntryMatch,
    normalizePath,
    wrapLine,
} from '../utils'
describe('evalEntryMatch', () => {
    it('must match empty string when command is empty string', () => {
        expect(
            evalEntryMatch({
                command: '',
            })
        ).toEqual({
            match: [''],
            last: [],
        })
    })
    it('must match command itself and a level above when no args provided', () => {
        expect(
            evalEntryMatch({
                command: 'root',
            })
        ).toEqual({
            match: ['root'],
            parent: '',
            last: [],
        })
        expect(
            evalEntryMatch({
                command: 'root level2',
            })
        ).toEqual({
            match: ['root level2'],
            parent: 'root',
            last: [' level2'],
        })
    })
    it('must match command itself and a level above when args provided', () => {
        expect(
            evalEntryMatch({
                command: 'root',
                args: { arg1: '' },
            })
        ).toEqual({
            match: ['root'],
            parent: '',
            last: [],
        })
        expect(
            evalEntryMatch({
                command: 'root level2',
                args: { arg1: '' },
            })
        ).toEqual({
            match: ['root level2'],
            parent: 'root',
            last: [' level2'],
        })
    })
    it('must add aliases to match', () => {
        expect(
            evalEntryMatch({
                command: 'root',
                aliases: ['rt', 'r'],
                args: { arg1: '' },
            })
        ).toEqual({
            match: ['root', 'rt', 'r'],
            parent: '',
            last: [],
        })
    })
    it('must support colon separated commands', () => {
        expect(
            evalEntryMatch({
                command: 'root:context',
                aliases: ['root:ctx', 'root:c'],
                args: { arg1: '' },
            })
        ).toEqual({
            match: ['root:context', 'root:ctx', 'root:c'],
            parent: 'root',
            last: [':context', ':ctx', ':c'],
        })
        expect(
            evalEntryMatch({
                command: 'root:context:use',
                aliases: ['root:context:u'],
                args: { arg1: '' },
            })
        ).toEqual({
            match: ['root:context:use', 'root:context:u'],
            parent: 'root:context',
            last: [':use', ':u'],
        })
    })
})

describe('entriesSorter', () => {
    it('must sort by length of command and abc', () => {
        const result = [
            { command: 'abc cde' },
            { command: 'zxc zxc' },
            { command: 'abc cde zxc' },
            { command: 'zxc' },
            { command: 'abc' },
            { command: 'bbb cde zxc' },
            { command: 'abc efg' },
            { command: 'aaa:bbb' },
            { command: 'aaa:def:feg' },
            { command: 'aaa:def' },
        ].sort(entriesSorter)
        expect(result).toEqual([
            { command: 'abc' },
            { command: 'zxc' },
            { command: 'aaa:bbb' },
            { command: 'aaa:def' },
            { command: 'abc cde' },
            { command: 'abc efg' },
            { command: 'zxc zxc' },
            { command: 'aaa:def:feg' },
            { command: 'abc cde zxc' },
            { command: 'bbb cde zxc' },
        ])
    })
})

describe('normalizePath', () => {
    it('must remove extra spaces from string', () => {
        expect(normalizePath(' abc   cde   1   ')).toEqual('abc cde 1')
    })
    it('must return an empty string when path is not supplied', () => {
        expect(normalizePath()).toEqual('')
    })
})

describe('wrapLine', () => {
    it('must wrap simple line', () => {
        expect(wrapLine('my simple short text line', 12)).toEqual([
            'my simple   ',
            'short text  ',
            'line        ',
        ])
    })
    it('must wrap line and break long words', () => {
        expect(
            wrapLine('my simple shorttextlongwordevenlonger line', 12)
        ).toEqual([
            'my simple   ',
            'shorttextlon',
            'gwordevenlon',
            'ger line    ',
        ])
    })
    it('must wrap line and break long at dash', () => {
        expect(
            wrapLine('some words and now dash-separated long word', 12)
        ).toEqual([
            'some words  ',
            'and now     ',
            'dash-       ',
            'separated   ',
            'long word   ',
        ])
    })
    it('must wrap line and break long at dot but keep together shorter words with dots', () => {
        expect(
            wrapLine('some words and now dot.separated long word.short', 12)
        ).toEqual([
            'some words  ',
            'and now dot.',
            'separated   ',
            'long        ',
            'word.short  ',
        ])
    })
})
