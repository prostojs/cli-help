import { Writer } from './columns'
import { TCliEntry, TCliHelpOptions } from './types'
import {
    entriesSorter,
    escapeRegex,
    evalEntryMatch,
    normalizePath,
    wrapLine,
} from './utils'

const MAX_WIDTH = 100
const MAX_LEFT = 35

/**
 * ## CliHelpRenderer
 * ### Class that can render CLI instructions
 * 
 * ```js
 *    const { CliHelpRenderer } = require('@prostojs/cli-help')
 *
 *    const chr = new CliHelpRenderer({
 *        name: 'my-cli',
 *    })
 *    chr.addEntry({
 *         command: 'my-command',
 *         aliases: ['my-cmd'],
 *         description: 'command description',
 *         options: [
 *             {
 *                 keys: ['output'],
 *                 description: 'Output format',
 *                 value: 'json|yaml',
 *             },
 *         ],
 *         args: { argName: 'arg description' },
 *     })
 * ```
 */
export class CliHelpRenderer {
    constructor(protected opts?: TCliHelpOptions) {}

    protected mappedEntries: Record<
        string,
        { main: TCliEntry; children: TCliEntry[] }
    > = {}

    protected entries: TCliEntry[] = []

    protected isPrepared: boolean = false

    /**
     * Adds CLI Entry
     *
     * ```js
     * chr.addEntry({
     *   command: 'command',
     *   description: 'Description of the command',
     *   options: [{ keys: ['project', 'p'], description: 'Description of the option' }],
     *   args: { argName: 'Description of the arg' },
     *   aliases: ['cmd'],
     * }, { ... }, ...)
     * ```
     *
     * @param entry1 - object of TCliEntry
     * @param {*} entry2 - object of TCliEntry
     * @param {*} entryN - object of TCliEntry
     */
    public addEntry(...entries: TCliEntry[]) {
        this.isPrepared = false
        this.entries.push(...entries)
    }

    protected prepareMappedEntries() {
        if (!this.isPrepared) {
            this.mappedEntries = {}
            const processEntryMatch = (entry: TCliEntry) => {
                const { match, parent, last } = evalEntryMatch(entry)
                const main = match.shift() as string
                this.mappedEntries[main] = { main: entry, children: [] }
                for (const alias of match) {
                    this.mappedEntries[alias] = this.mappedEntries[main]
                }
                if (typeof parent === 'string') {
                    if (!this.mappedEntries[parent]) {
                        const newEntry = { command: parent }
                        processEntryMatch(newEntry)
                    }
                    this.mappedEntries[parent].children.push(entry)
                    const { aliases } = this.mappedEntries[parent].main
                    if (aliases) {
                        for (const alias of aliases) {
                            for (const l of last) {
                                const aliasedCommand = alias + l
                                if (!this.mappedEntries[aliasedCommand]) {
                                    if (!entry.aliases) {
                                        entry.aliases = []
                                    }
                                    entry.aliases.push(aliasedCommand)
                                    this.mappedEntries[aliasedCommand] =
                                        this.mappedEntries[main]
                                }
                            }
                        }
                    }
                }
            }
            this.entries = this.entries.sort(entriesSorter)
            this.entries.forEach((entry) => {
                processEntryMatch(entry)
            })
            this.isPrepared = true
        }
    }

    /**
     * ### Match path with CLI command
     * Throws an error if no match found
     * 
     * @param _path string
     * @returns 
     */
    public match(_path?: string) {
        this.prepareMappedEntries()
        const path = normalizePath(_path)
        const match = this.mappedEntries[path]
        if (match) return match
        throw new Error(`Unknown command "${path}"`)
    }

    /**
     * ### Resolve the name of the called file (cli)
     * It's possible to pass cli name as a const
     * into options object
     * ```js
     * new CliHelpRenderer({ name: 'mycli' })
     * ```
     * @returns string
     */
    public getCliName(): string {
        return this.opts?.name || process.argv[1].split('/').pop() as string
    }

    /**
     * ### Renders cli help as array of strings
     *
     * ```js
     * chr.render('', 80, false)
     * ```
     *
     * @param {*} _path (string) cmd path for help tree
     * @param {*} _width (number) width of console
     * @param {*} withColors (boolean) enable colors
     * @returns Array<string>
     */
    public render(
        _path?: string,
        _width?: number,
        withColors = false
    ): string[] {
        const width =
            _width ||
            Math.min(process.stdout.columns, this.opts?.maxWidth || MAX_WIDTH) -
                1
        const match = this.match(_path)
        const { main, children } = match
        const lw = Math.min(
            this.opts?.maxLeft || MAX_LEFT,
            Math.floor(width * 0.4)
        )
        const rw = width - lw - 3
        const mark = this.opts?.mark || '•'
        const space = '   '
        const spaceFirst = ` ${mark} `
        const writer = new Writer()
        if (this.opts?.title) {
            writer.write('┍' + '━'.repeat(width - 2) + '┑')
            if (this.opts.title.length >= width - 4) {
                // wrapped
                writer.write(
                    ...wrapLine(this.opts.title, width - 4).map(
                        (l) => '│ ' + l + ' │'
                    )
                )
            } else {
                // centered
                const l = this.opts.title.length
                const l1 = Math.floor(width / 2 - l / 2) - 4
                const l2 = width - l - 4 - l1
                writer.write(
                    '│ ' +
                        ' '.repeat(l1) +
                        this.opts.title +
                        ' '.repeat(l2) +
                        ' │'
                )
            }
            writer.write('┕' + '━'.repeat(width - 2) + '┙')
            writer.write(' '.repeat(width))
        }

        const singleCol = writer.toColumns({ count: 1, widths: [width] })
        const doubleCol = writer.toColumns({
            count: 2,
            widths: [lw, rw],
            space,
            spaceFirst,
        })

        const cmd = `$ ${ this.getCliName() }`
        function printCmd(command: string, args?: Record<string, string>) {
            const renderedArgs = Object.keys(args || {})
                .map((a) => `<${a}>`)
                .join(' ')
            return [`${cmd} ${command}`, renderedArgs].join(' ')
        }

        const addColors = withColors
            ? colorizeArray(cmd.slice(2), main)
            : (l: string[]) => l
        const boldify = withColors
            ? (l: string[]) =>
                l.map(
                    (l) => `${__DYE_WHITE_BRIGHT__}${l}${__DYE_COLOR_OFF__}`
                )
            : (l: string[]) => l
        const dimify = withColors
            ? (l: string[]) =>
                l.map((l) => `${__DYE_DIM__}${l}${__DYE_DIM_OFF__}`)
            : (l: string[]) => l

        if (main.description) {
            singleCol.write(0, ['DESCRIPTION'], 0, boldify)
            singleCol.write(
                0,
                (main.description || '').split(/\n/g),
                2,
                boldify
            )
            singleCol.space()
        }
        singleCol.write(0, ['USAGE'], 0, boldify)
        singleCol.write(0, [printCmd(main.command, main.args)], 2, addColors)
        singleCol.merge(true)

        if (main.args && Object.keys(main.args).length > 0) {
            singleCol.space()
            singleCol.write(0, ['ARGUMENTS'], 0, boldify)
            singleCol.merge(true)

            for (const [arg, description] of Object.entries(main.args)) {
                doubleCol.write(0, [`<${arg}>`], 2, addColors)
                doubleCol.write(
                    1,
                    (description || '').split(/\n/g),
                    0,
                    addColors
                )
                doubleCol.merge(true)
            }
        }

        if (main.options && main.options.length) {
            singleCol.space()
            singleCol.write(0, ['OPTIONS'], 0, boldify)
            singleCol.merge(true)

            main.options.sort((a, b) => (a.keys[0] > b.keys[0] ? 1 : -1))
            for (const opt of main.options) {
                const keys = opt.keys.map(
                    (k) => `${k.length > 1 ? '--' : '-'}${k}`
                )
                keys[0] += `${opt.value ? `=${opt.value}` : ''}`
                for (let i = 1; i < keys.length; i++) {
                    keys[i] += `${opt.value ? '=…' : ''}`
                }
                doubleCol.write(0, [keys.join(', ')], 2, addColors)
                doubleCol.write(
                    1,
                    (opt.description || '').split(/\n/g),
                    0,
                    addColors
                )
                doubleCol.merge(true)
            }
        }

        if (main.examples) {
            singleCol.space()
            singleCol.write(0, ['EXAMPLES'], 0, boldify)
            let needSpace = false
            for (const { description, cmd } of main.examples) {
                if (needSpace) {
                    singleCol.space()
                }
                needSpace = true
                if (description) {
                    singleCol.write(0, [description], 4, (l) =>
                        dimify(l.map((l) => '  # ' + l.slice(4)))
                    )
                }
                singleCol.write(0, [[printCmd(main.command), cmd].join(' ')], 2)
                singleCol.merge(true)
            }
        }

        if (main.aliases && main.aliases.length) {
            singleCol.space()
            singleCol.write(0, ['ALIASES'], 0, boldify)

            main.aliases.sort((a, b) => (a > b ? 1 : -1))
            for (const a of main.aliases) {
                singleCol.write(0, [printCmd(a)], 2, addColors)
            }
            singleCol.merge(true)
        }

        if (children && children.length) {
            singleCol.space()
            singleCol.write(0, ['COMMANDS'], 0, boldify)
            singleCol.merge(true)

            children.sort((a, b) => (a.command > b.command ? 1 : -1))
            for (const entry of children) {
                if (main.command !== entry.command) {
                    const addColors = withColors
                        ? colorizeArray(cmd.slice(2), entry)
                        : (l: string[]) => l
                    doubleCol.write(0, [printCmd(entry.command)], 2, addColors)
                    doubleCol.write(
                        1,
                        (entry.description || '').split(/\n/g),
                        0,
                        addColors
                    )
                    doubleCol.merge(true)
                }
            }
        }
        return writer.getLines()
    }

    /**
     * Print the cli help right to the terminal
     *
     * ```js
     * chr.print('', true)
     * ```
     *
     * @param {*} path (string) path to command cli tree
     * @param {*} withColors (boolean) enable colors
     */
    public print(path?: string, withColors = false) {
        const lines = this.render(path, undefined, withColors)
        process.stdout.write(lines.join('\n') + '\n')
    }
}

function colorizeArray(
    command: string,
    entry: TCliEntry
): (lines: string[]) => string[] {
    return (lines: string[]) => lines.map((l) => colorize(command, l, entry))
}

function colorize(command: string, l: string, entry: TCliEntry): string {
    if (entry.args) {
        const args = Object.keys(entry.args)
        args.forEach(
            (a) =>
                (l = l.replace(
                    new RegExp(`(<${escapeRegex(a)}>)`, 'g'),
                    __DYE_GREEN_BRIGHT__ + '$1' + __DYE_COLOR_OFF__
                ))
        )
    }
    if (entry.options) {
        entry.options.forEach(({ keys, value }) => {
            keys.forEach((key) => {
                if (key.length > 1) {
                    l = l.replace(
                        new RegExp(
                            `\\s(--${escapeRegex(key)})([^a-zA-Z0-9])`,
                            'g'
                        ),
                        ' ' +
                            __DYE_YELLOW_BRIGHT__ +
                            '$1' +
                            __DYE_COLOR_OFF__ +
                            '$2'
                    )
                } else {
                    l = l.replace(
                        new RegExp(
                            `\\s(-${escapeRegex(key)})([^a-zA-Z0-9])`,
                            'g'
                        ),
                        ' ' +
                            __DYE_YELLOW_BRIGHT__ +
                            '$1' +
                            __DYE_COLOR_OFF__ +
                            '$2'
                    )
                }
            })
            if (value && value.startsWith('<') && value.endsWith('>')) {
                l = l.replace(
                    new RegExp(`(${escapeRegex(value)})`, 'g'),
                    '<' +
                        __DYE_UNDERSCORE__ +
                        value.slice(1, value.length - 1) +
                        __DYE_UNDERSCORE_OFF__ +
                        '>'
                )
            }
        })
    }
    if (command) {
        l = l.replace(
            new RegExp(`(${escapeRegex(command)})`, 'g'),
            __DYE_UNDERSCORE__ + '$1' + __DYE_UNDERSCORE_OFF__
        )
    }
    return l
}
