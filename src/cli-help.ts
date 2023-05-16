import { TCliEntry, TCliHelpOptions } from './types'
import { escapeRegex, evalEntryMatch, normalizePath, wrapLine } from './utils'

const MAX_WIDTH = 140
const MAX_LEFT = 35

export class CliHelpRenderer {
    constructor(protected opts?: TCliHelpOptions) {}

    protected mappedEntries: Record<string, TCliEntry[]> = {}

    /**
     * Adds CLI Entry
     * 
     * ```js
     * chr.addEntry({
     *   command: 'command',
     *   description: 'Description of command',
     *   options: [{ keys: ['p', 'project'], description: 'project path' }],
     *   args: ['name'],
     *   aliases: ['cmd'],
     * }, { ... }, ...)
     * ```
     * 
     * @param entry1 - object of TCliEntry
     * @param {*} entry2 - object of TCliEntry
     * @param {*} entryN - object of TCliEntry
     */
    public addEntry(...entries: TCliEntry[]) {
        entries.forEach((entry) => {
            const match = evalEntryMatch(entry)
            for (const m of match) {
                this.mappedEntries[m] = this.mappedEntries[m] || []
                this.mappedEntries[m].push(entry)
            }
        })
    }

    /**
     * Renders cli help as array of strings
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
        const path = normalizePath(_path)
        const entries = this.mappedEntries[path]
        if (!entries) {
            return wrapLine('no help found for the given command...', width)
        }
        const lw = Math.min(
            this.opts?.maxLeft || MAX_LEFT,
            Math.floor(width * 0.4)
        )
        const rw = width - lw - 2
        const globalLeft = []
        const globalRight = []
        const dummyL = ' '.repeat(lw)
        const dummyR = ' '.repeat(rw)
        const result = []
        if (this.opts?.title) {
            result.push('┍' + '━'.repeat(width - 2) + '┑')
            if (this.opts.title.length >= width - 4) {
                // wrapped
                result.push(
                    ...wrapLine(this.opts.title, width - 4).map(
                        (l) => '│ ' + l + ' │'
                    )
                )
            } else {
                // centered
                const l = this.opts.title.length
                const l1 = Math.floor(width / 2 - l / 2) - 4
                const l2 = width - l - 4 - l1
                result.push(
                    '│ ' +
                        ' '.repeat(l1) +
                        this.opts.title +
                        ' '.repeat(l2) +
                        ' │'
                )
            }
            result.push('┕' + '━'.repeat(width - 2) + '┙')
            result.push(' '.repeat(width))
        }
        for (const entry of entries) {
            const left: string[] = []
            const right: string[] = []
            function space() {
                left.push(dummyL)
                right.push(dummyR)
            }
            function evenLines() {
                if (left.length !== right.length) {
                    const big = left.length > right.length ? left : right
                    const small = left.length < right.length ? left : right
                    const dummySmall =
                        left.length < right.length ? dummyL : dummyR
                    while (big.length > small.length) {
                        small.push(dummySmall)
                    }
                }
            }
            const aliases = [entry.command, ...(entry.aliases || [])].map((c) =>
                `${this.opts?.name || ''} ${c}`.replace(/\s+/g, ' ')
            )
            left.push(
                ...wrapLine(
                    `Usage: ${aliases.join(', ')} ${
                        entry.args?.map((a) => `<${a}>`).join(' ') || ''
                    }`,
                    lw
                ).map((l) =>
                    withColors ? colorize(this.opts?.name || '', l, entry) : l
                )
            )
            right.push(
                ...wrapLine(entry.description || '', rw).map((l) =>
                    withColors ? colorize(this.opts?.name || '', l, entry) : l
                )
            )
            evenLines()
            if (entry.options) {
                left.push(...wrapLine('Options:', lw))
                evenLines()
                for (const opt of entry.options) {
                    left.push(
                        ...wrapLine(
                            opt.keys
                                .map((k) => `${k.length > 1 ? '--' : '-'}${k}`)
                                .join(', '),
                            lw - 4
                        )
                            .map((l) => '  ' + l + ' •')
                            .map((l) =>
                                withColors
                                    ? colorize(this.opts?.name || '', l, entry)
                                    : l
                            )
                    )
                    right.push(
                        ...wrapLine(opt.description || '', rw).map((l) =>
                            withColors
                                ? colorize(this.opts?.name || '', l, entry)
                                : l
                        )
                    )
                    evenLines()
                }
            }
            space()
            globalLeft.push(...left)
            globalRight.push(...right)
        }
        for (let i = 0; i < globalLeft.length; i++) {
            result.push(globalLeft[i] + '  ' + globalRight[i])
        }
        return result
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
        for (const line of lines) {
            process.stdout.write('\n' + line)
        }
        process.stdout.write('\n')
    }
}

function colorize(command: string, l: string, entry: TCliEntry): string {
    if (entry.args) {
        entry.args.forEach(
            (a) =>
                (l = l.replace(
                    new RegExp(`(<${escapeRegex(a)}>)`, 'g'),
                    __DYE_GREEN__ + '$1' + __DYE_COLOR_OFF__
                ))
        )
    }
    if (entry.options) {
        entry.options.forEach(({ keys }) => {
            keys.forEach((key) => {
                if (key.length > 1) {
                    l = l.replace(
                        new RegExp(
                            `\\s(--${escapeRegex(key)})([^a-zA-Z0-9])`,
                            'g'
                        ),
                        ' ' + __DYE_BLUE__ + '$1' + __DYE_COLOR_OFF__ + '$2'
                    )
                } else {
                    l = l.replace(
                        new RegExp(
                            `\\s(-${escapeRegex(key)})([^a-zA-Z0-9])`,
                            'g'
                        ),
                        ' ' + __DYE_BLUE__ + '$1' + __DYE_COLOR_OFF__ + '$2'
                    )
                }
            })
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
