import { CliHelpRenderer } from './cli-help'
import { evalEntryMatch, normalizePath, wrapLine } from './utils'

describe('evalEntryMatch', () => {
    it('must match empty string when command is empty string', () => {
        expect(
            evalEntryMatch({
                command: '',
            })
        ).toEqual([''])
    })
    it('must match command itself and a level above when no args provided', () => {
        expect(
            evalEntryMatch({
                command: 'root',
            })
        ).toEqual(['root', ''])
        expect(
            evalEntryMatch({
                command: 'root level2',
            })
        ).toEqual(['root level2', 'root'])
    })
    it('must match command itself and a level above when args provided', () => {
        expect(
            evalEntryMatch({
                command: 'root',
                args: ['arg1'],
            })
        ).toEqual(['root', ''])
        expect(
            evalEntryMatch({
                command: 'root level2',
                args: ['arg1'],
            })
        ).toEqual(['root level2', 'root'])
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

describe('CliHelpRenderer', () => {
    it('', () => {
        const chr = new CliHelpRenderer({
            name: 'my-cli',
            title: 'My Awesome CLI: HELP (bla bla bla long text here)',
        })
        const options = [
            {
                keys: ['t', 'target'],
                description: 'Pass target. Example: --target=file.js',
            },
            {
                keys: ['p', 'project'],
                description:
                    'Pass project name. Example: --project=myProject. Short version -p=myProject.',
            },
        ]
        chr.addEntry({
            command: '',
            description:
                'Root command description. This command does this and that. Use it with care.'.repeat(
                    3
                ),
            options,
        })
        chr.addEntry({
            command: '',
            args: ['path'],
            description:
                'Root command with <path> description. This command thas this and that. Use it with care.'.repeat(
                    3
                ),
            options,
        })
        chr.addEntry({
            command: 'fix',
            description:
                'This is a subcommand called "fix". Use carefully.'.repeat(5),
            aliases: ['f', 'xxx'],
        })
        expect(chr.render()).toMatchInlineSnapshot(`
Array [
  "┍━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┑",
  "│                                          My Awesome CLI: HELP (bla bla bla long text here)                                              │",
  "┕━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┙",
  "                                                                                                                                           ",
  "Usage: my-cli                        Root command description. This command does this and that. Use it with care.Root command description. ",
  "                                     This command does this and that. Use it with care.Root command description. This command does this and",
  "                                     that. Use it with care.                                                                               ",
  "Options:                                                                                                                                   ",
  "  -t, --target                    •  Pass target. Example: --target=file.js                                                                ",
  "  -p, --project                   •  Pass project name. Example: --project=myProject. Short version -p=myProject.                          ",
  "                                                                                                                                           ",
  "Usage: my-cli <path>                 Root command with <path> description. This command thas this and that. Use it with care.Root command  ",
  "                                     with <path> description. This command thas this and that. Use it with care.Root command with <path>   ",
  "                                     description. This command thas this and that. Use it with care.                                       ",
  "Options:                                                                                                                                   ",
  "  -t, --target                    •  Pass target. Example: --target=file.js                                                                ",
  "  -p, --project                   •  Pass project name. Example: --project=myProject. Short version -p=myProject.                          ",
  "                                                                                                                                           ",
  "Usage: my-cli fix, my-cli f, my-cli  This is a subcommand called \\"fix\\". Use carefully.This is a subcommand called \\"fix\\". Use carefully.This",
  "xxx                                  is a subcommand called \\"fix\\". Use carefully.This is a subcommand called \\"fix\\". Use carefully.This is a",
  "                                     subcommand called \\"fix\\". Use carefully.                                                               ",
  "                                                                                                                                           ",
]
`)
    })
})
