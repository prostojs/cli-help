export interface TCliHelpOptions {
    title?: string
    name?: string
    maxWidth?: number
    maxLeft?: number
    mark?: string
}

export interface TCliEntry {
    command: string
    description?: string
    options?: { keys: string[]; description?: string; value?: string }[]
    args?: Record<string, string>
    aliases?: string[]
    examples?: { description?: string; cmd: string }[]
}
