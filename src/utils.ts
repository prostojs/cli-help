import { TCliEntry } from './types'

export function evalEntryMatch(entry: Omit<TCliEntry<string>, 'custom'>): {
    match: string[]
    parent?: string
    last: string[]
} {
    const parts = entry.command.split(/\s+|:+/g).filter((p) => !!p)
    const length = parts.length
    const match = [entry.command, ...(entry.aliases || [])]
    let parent
    const last = []
    if (length > 0) {
        parent = length > 1 ? entry.command.replace(/(\s+|:+)[^\s:]+$/, '') : ''
    }
    if (length > 1) {
        for (const alias of match) {
            const v = (/([\s:]+[^\s:]+)$/.exec(alias) || [''])[1]
            if (v) {
                last.push(v)
            }
        }
    }
    return { match, parent, last }
}

export function normalizePath(path?: string): string {
    return path ? path.replace(/\s+/g, ' ').trim() : ''
}

const dividers = ['-', '.', ',', ';', '^', '*', '=', '+']

export function wrapLine(line: string, width: number): string[] {
    const result = []
    let cur = ''
    for (const sourceWord of line.replace(/\s+/g, ' ').split(/\r\n|\n|\s/g)) {
        const dividedWords = []
        let lastDivider = 0
        if (sourceWord.length > width) {
            for (let i = 1; i < sourceWord.length - 1; i++) {
                if (dividers.includes(sourceWord[i])) {
                    dividedWords.push(sourceWord.slice(lastDivider, i + 1))
                    lastDivider = i + 1
                }
            }
        }
        dividedWords.push(sourceWord.slice(lastDivider))
        for (const word of dividedWords) {
            if (cur.length + word.length <= width) {
                cur += word + ' '
            } else {
                cur += ' '.repeat(width)
                result.push(cur.slice(0, width))
                if (word.length <= width) {
                    cur = word + ' '
                } else {
                    cur = word
                    let newWord = word.slice(width)
                    while (cur.length > width) {
                        result.push(cur.slice(0, width))
                        cur = newWord
                        newWord = newWord.slice(width)
                    }
                    cur += ' '
                }
            }
            if (cur.length >= width) {
                result.push(cur.slice(0, width))
                cur = ''
            }
        }
    }
    if (cur) {
        cur += ' '.repeat(width)
        result.push(cur.slice(0, width))
        cur = ''
    }
    return result
}

export function escapeRegex(s: string): string {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
}

export function entriesSorter(a: Omit<TCliEntry<string>, 'custom'>, b: Omit<TCliEntry<string>, 'custom'>): number {
    const l1 = a.command.split(/\s+|:+/g).length
    const l2 = b.command.split(/\s+|:+/g).length
    return l1 === l2 ? (a.command > b.command ? 1 : -1) : l1 - l2
}
