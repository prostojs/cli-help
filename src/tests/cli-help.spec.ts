import { CliHelpRenderer } from '../cli-help'

describe('CliHelpRenderer', () => {
    it('', () => {
        const chr = new CliHelpRenderer({
            name: 'my-cli',
            title: 'My Awesome CLI: HELP (bla bla bla long text here)',
        })
        const commonOptions = [
            {
                keys: ['output'],
                description: 'Output format',
                value: 'json|yaml',
            },
        ]
        chr.addEntry(
            {
                command: '',
                description: 'Prints package.json file',
                options: [...commonOptions],
            },
            {
                command: 'version',
                description: 'Prints version property from package.json file',
                aliases: ['v'],
            },
            {
                command: 'version set',
                description: 'Sets <new-version> as version for package.json file',
                aliases: ['vs'],
                args: {
                    'new-version': 'Version value (e.g. "1.0.2")',
                },
                examples: [{ cmd: '1.0.2', description: 'Sets version to 1.0.2' }],
            },
            {
                command: 'dependencies',
                description:
                    'Prints dependencies property from package.json file. ' +
                    'Long long detailed description for the command will be wrapped into several lines.',
                aliases: ['deps'],
                options: [
                    ...commonOptions,
                    {
                        keys: ['peer', 'P'],
                        description: 'Include peerDependencies',
                    },
                    {
                        keys: ['dev', 'D'],
                        description: 'Include devDependencies',
                    },
                    {
                        keys: ['d'],
                        description: 'Include dependencies',
                    },
                    {
                        keys: ['all', 'a'],
                        description:
                            'Include devDependencies, peerDependencies and dependencies. ' +
                            'Long long detailed description for the option will be wrapped into several lines.',
                    },
                ],
                examples: [
                    {
                        cmd: '-PD',
                        description:
                            'Prints peer and dev dependencies. ' +
                            'Long long comment for the example with the detailed explanation of its effect. '.repeat(
                                2
                            ),
                    },
                    { cmd: '-d', description: 'Prints dependencies' },
                ],
            },
            {
                command: 'dependencies:add',
                aliases: ['dependencies:i', 'dependencies:install'],
                description: 'Adds a new dependency',
                options: [
                    {
                        keys: ['dev', 'D'],
                        description: 'Add dependency as a dev depenency',
                    },
                    {
                        keys: ['peer', 'P'],
                        description: 'Add dependency as a peer depenency.',
                    },
                ],
                args: {
                    'npm-pkg': 'npm-package name (e.g. "vue")',
                    version: 'package version (e.g. "^3.0.0")',
                },
                examples: [
                    {
                        description: 'Installs vue version ^3.0.0',
                        cmd: 'vue ^3.0.0 -D',
                    },
                ],
            },
            {
                command: 'dependencies:delete',
                aliases: ['dependencies:del'],
                description: 'Deletes a dependency',
                args: {
                    'npm-pkg': 'npm-package name (e.g. "vue")',
                },
                examples: [
                    {
                        description: 'Deletes vue dependency',
                        cmd: 'vue',
                    },
                ],
            }
        )

        expect(chr.render()).toMatchInlineSnapshot(`
Array [
  "┍━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┑",
  "│                      My Awesome CLI: HELP (bla bla bla long text here)                          │",
  "┕━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┙",
  "                                                                                                   ",
  "DESCRIPTION                                                                                        ",
  "  Prints package.json file                                                                         ",
  "                                                                                                   ",
  "USAGE                                                                                              ",
  "  $ my-cli                                                                                         ",
  "                                                                                                   ",
  "OPTIONS                                                                                            ",
  "  --output=json|yaml                • Output format                                                ",
  "                                                                                                   ",
  "COMMANDS                                                                                           ",
  "  $ my-cli dependencies             • Prints dependencies property from package.json file. Long    ",
  "                                      long detailed description for the command will be wrapped    ",
  "                                      into several lines.                                          ",
  "  $ my-cli version                  • Prints version property from package.json file               ",
]
`)
        expect(chr.render('deps')).toMatchInlineSnapshot(`
Array [
  "┍━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┑",
  "│                      My Awesome CLI: HELP (bla bla bla long text here)                          │",
  "┕━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┙",
  "                                                                                                   ",
  "DESCRIPTION                                                                                        ",
  "  Prints dependencies property from package.json file. Long long detailed description for the      ",
  "  command will be wrapped into several lines.                                                      ",
  "                                                                                                   ",
  "USAGE                                                                                              ",
  "  $ my-cli dependencies                                                                            ",
  "                                                                                                   ",
  "OPTIONS                                                                                            ",
  "  --all, -a                         • Include devDependencies, peerDependencies and dependencies.  ",
  "                                      Long long detailed description for the option will be wrapped",
  "                                      into several lines.                                          ",
  "  -d                                • Include dependencies                                         ",
  "  --dev, -D                         • Include devDependencies                                      ",
  "  --output=json|yaml                • Output format                                                ",
  "  --peer, -P                        • Include peerDependencies                                     ",
  "                                                                                                   ",
  "EXAMPLES                                                                                           ",
  "  # Prints peer and dev dependencies. Long long comment for the example with the detailed          ",
  "  # explanation of its effect. Long long comment for the example with the detailed explanation of  ",
  "  # its effect.                                                                                    ",
  "  $ my-cli dependencies -PD                                                                        ",
  "                                                                                                   ",
  "  # Prints dependencies                                                                            ",
  "  $ my-cli dependencies -d                                                                         ",
  "                                                                                                   ",
  "ALIASES                                                                                            ",
  "  $ my-cli deps                                                                                    ",
  "                                                                                                   ",
  "COMMANDS                                                                                           ",
  "  $ my-cli dependencies:add         • Adds a new dependency                                        ",
  "  $ my-cli dependencies:delete      • Deletes a dependency                                         ",
]
`)
    })
})
