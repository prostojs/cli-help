import { wrapLine } from './utils'

export class Writer {
    constructor(
        private opts?: {
            onMerge?: (
                opts: Omit<TColumns<number>, 'onMerge'>,
                lines: string[]
            ) => string[]
        }
    ) {}

    protected lines: string[] = []

    write(...lines: string[]) {
        this.lines.push(...lines)
    }

    toColumns<N extends number>(opts: Omit<TColumns<N>, 'onMerge'>) {
        return new Columns<N>({
            ...opts,
            onMerge: (lines, instance) => {
                this.lines.push(
                    ...(this.opts?.onMerge
                        ? this.opts?.onMerge(opts, lines)
                        : lines)
                )
                instance.clear()
            },
        })
    }

    getLines() {
        return this.lines
    }

    print() {
        for (const line of this.lines) {
            process.stdout.write(line + '\n')
        }
    }
}

export class Columns<N extends number> {
    constructor(private opts: TColumns<N>) {
        this.cols = [] as Tuple<string[], N>
        for (let i = 0; i < opts.count; i++) {
            this.cols.push([])
            this.dummies.push(' '.repeat(opts.widths[i]))
        }
    }

    protected dummies: string[] = []

    protected cols: Tuple<string[], N>

    clear() {
        for (let i = 0; i < this.cols.length; i++) {
            this.cols[i] = []
        }
    }

    write(
        index: number,
        lines: string[],
        shift = 0,
        postProcessing?: (lines: string[], opts: TColumns<N>) => string[]
    ) {
        const { widths, count } = this.opts
        if (index > count - 1)
            throw new Error(
                '[Columns] index can not be greater than columns count'
            )
        const w = widths[index]
        for (const line of lines) {
            const newLines = wrapLine(line, w - shift).map(
                (l) => ' '.repeat(shift) + l
            )
            this.cols[index].push(
                ...(postProcessing
                    ? postProcessing(newLines, this.opts)
                    : newLines)
            )
        }
    }

    space() {
        this.even()
        this.cols[0].push(this.dummies[0])
        this.even()
    }

    even() {
        const max = Math.max(...this.cols.map((c) => c.length))
        for (let i = 0; i < this.cols.length; i++) {
            const col = this.cols[i]
            while (col.length < max) {
                col.push(this.dummies[i])
            }
        }
    }

    merge(andClear = false): string[] {
        this.even()
        const { space, spaceFirst } = this.opts
        const result = []
        for (let i = 0; i < this.cols[0].length; i++) {
            const lines = []
            for (let j = 0; j < this.cols.length; j++) {
                lines.push(this.cols[j][i])
            }
            result.push(
                lines.join(i === 0 ? spaceFirst || space || '' : space || '')
            )
        }
        if (andClear) {
            this.clear()
        }
        if (this.opts.onMerge) {
            this.opts.onMerge(result, this)
        }
        return result
    }

    print(andClear = false) {
        const lines = this.merge(andClear)
        for (const line of lines) {
            process.stdout.write(line + '\n')
        }
    }
}

type Tuple<T, N extends number> = N extends N
    ? number extends N
        ? T[]
        : _TupleOf<T, N, []>
    : never
type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N
    ? R
    : _TupleOf<T, N, [T, ...R]>

interface TColumns<N extends number> {
    count: N
    space?: string
    spaceFirst?: string
    widths: Tuple<number, N>
    onMerge?: (merged: string[], instance: Columns<N>) => void
}
