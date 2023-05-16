export interface TCliHelpOptions {
    title?: string
    name?: string
    maxWidth?: number
    maxLeft?: number
}

export interface TCliEntry {
    command: string
    description?: string
    options?: { keys: string[]; description?: string }[]
    args?: string[]
    aliases?: string[]
}
