import { TCliEntry } from './types'

export function evalEntryMatch(entry: TCliEntry): string[] {
    const parts = entry.command.split(' ').filter((p) => !!p)
    const length = parts.length
    const result = [entry.command, ...(entry.aliases || [])]
    if (/*(!entry.args || entry.args.length < 1) && */ length > 0) {
        result.push(parts.slice(0, length - 1).join(' '))
    }
    return result
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
