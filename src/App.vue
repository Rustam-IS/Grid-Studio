<template>
    <div id="code">
        <div id="bar">
            <div id="title"> Grid Studio (548-I) </div>
            <div id="stop"> <svg xmlns="http://www.w3.org/2000/svg" fill="#000000" width="800px" height="800px" viewBox="0 0 24 24"><path fill="#ffffff" d="M22,2H4A1,1,0,0,0,3,3V21a1,1,0,0,0,1,1H22a1,1,0,0,0,1-1V3A1,1,0,0,0,22,2ZM21,20H5V4H21Z"/></svg> </div>
            <div id="exec"> <svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 16 16" fill="none"><path fill="#ffffff" d="M8 1.25a2.101 2.101 0 00-1.785.996l.64.392-.642-.388-5.675 9.373-.006.01a2.065 2.065 0 00.751 2.832c.314.183.67.281 1.034.285h11.366a2.101 2.101 0 001.791-1.045 2.064 2.064 0 00-.006-2.072L9.788 2.25l-.003-.004A2.084 2.084 0 008 1.25z"/></svg> </div>
        </div>
        <div id="editor"></div>
    </div>
    <div id="field"></div>
</template>

<script>
import * as monaco from 'monaco-editor'
import * as JXG from 'jsxgraph'

import { lex } from '@/lang/lexer'
import { parse } from '@/lang/parser'
import { execute } from '@/lang/core'

monaco.languages.register({
    id: 'custom'
})

monaco.languages.setMonarchTokensProvider('custom', {
    keywords: [
        'IFBLOCK', 'ENDIF',
        'REPEAT', 'ENDREPEAT',
        'PROCEDURE', 'ENDPROC',
        'SET', 'CALL',
        'RIGHT', 'LEFT', 'UP', 'DOWN'
    ],
    tokenizer: {
        root: [
            [/[A-Z_$][\w$]*/, {
                cases: {
                    '@keywords': 'keyword',
                    '@default': 'identifier'
                }
            }],
            [/\d+/, 'number']
        ]
    }
})

monaco.languages.registerCompletionItemProvider('custom', {
    provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position)
        const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
        }
        return {
            suggestions: [
                {
                    label: { label: 'IF', description: 'Проверить на наличие препятствия в направлении DIR' },
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: [
                    // eslint-disable-next-line no-template-curly-in-string
                        'IFBLOCK ${1:DIR}',
                        '\t$0',
                        'ENDIF'
                    ].join('\n'),
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range: range
                },

                {
                    label: { label: 'REPEAT', description: 'Повторить N раз последующий блок кода' },
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: [
                    // eslint-disable-next-line no-template-curly-in-string
                        'REPEAT ${1:N}',
                        '\t$0',
                        'ENDREPEAT'
                    ].join('\n'),
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range: range
                },

                {
                    label: { label: 'PROCEDURE', description: 'Создать подпрограмму с именем NAME' },
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: [
                    // eslint-disable-next-line no-template-curly-in-string
                        'PROCEDURE ${1:NAME}',
                        '\t$0',
                        'ENDPROC'
                    ].join('\n'),
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range: range
                },

                {
                    label: {
                        label: 'SET',
                        description: 'Создать переменную с именем NAME и значением VAL'
                    },
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: [
                        // eslint-disable-next-line no-template-curly-in-string
                        'SET ${1:NAME} = ${2:VALUE}'
                    ].join('\n'),
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range: range
                },

                {
                    label: {
                        label: 'DOWN',
                        description: 'Опуститься вниз на N клеток'
                    },
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: [
                        // eslint-disable-next-line no-template-curly-in-string
                        'DOWN ${1:N}'
                    ].join('\n'),
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range: range
                },

                {
                    label: {
                        label: 'UP',
                        description: 'Подняться вверх на N клеток'
                    },
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: [
                        // eslint-disable-next-line no-template-curly-in-string
                        'UP ${1:N}'
                    ].join('\n'),
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range: range
                },

                {
                    label: {
                        label: 'LEFT',
                        description: 'Сдвинуться влево на N клеток'
                    },
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: [
                        // eslint-disable-next-line no-template-curly-in-string
                        'LEFT ${1:N}'
                    ].join('\n'),
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range: range
                },

                {
                    label: {
                        label: 'RIGHT',
                        description: 'Сдвинуться вправо на N клеток'
                    },
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: [
                        // eslint-disable-next-line no-template-curly-in-string
                        'RIGHT ${1:N}'
                    ].join('\n'),
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range: range
                }
            ]
        }
    }
})

let board

export default {
    name: 'app',
    async mounted () {
        function size (factor) {
            const size = Math.min(
                window.innerHeight,
                window.innerWidth
            )
            return size * factor / 100
        }

        const elem = document.querySelector('#editor')
        const editor = monaco.editor.create(elem, {
            value: '\n',
            language: 'custom',
            theme: 'vs-dark',
            fontSize: `${size(2.5)}px`,

            scrollbar: {
                verticalHasArrows: true,
                horizontalHasArrows: true
            }
        })

        board = JXG.JSXGraph.initBoard('field', {
            boundingbox: [-0.5, 22, 22, -0.5],
            axis: true,
            keepAspectRatio: true,
            showCopyright: false,
            defaultAxes: {
                x: {
                    strokeColor: 'white',
                    highlightStrokeColor: 'white',
                    ticks: {
                        insertTicks: false,
                        ticksDistance: 1,
                        minorHeight: 0,
                        strokeColor: 'white',
                        label: {
                            strokeColor: 'white',
                            highlightStrokeColor: 'white',
                            offset: [0, -6],
                            anchorX: 'middle',
                            anchorY: 'top',
                            fontSize: () => size(2)
                        }
                    }
                },
                y: {
                    strokeColor: 'white',
                    highlightStrokeColor: 'white',
                    ticks: {
                        insertTicks: false,
                        ticksDistance: 1,
                        minorHeight: 0,
                        strokeColor: 'white',
                        label: {
                            strokeColor: 'white',
                            highlightStrokeColor: 'white',
                            offset: [6, 0],
                            anchorX: 'left',
                            anchorY: 'middle',
                            fontSize: () => size(2)
                        }
                    }
                }
            },
            drag: {
                enabled: false
            },
            pan: {
                enabled: true,
                needShift: true
            },
            zoom: {
                min: 1,
                max: 2
            }
        })

        addEventListener('resize', function () {
            editor.updateOptions({
                fontSize: `${size(2.5)}px`
            })
            editor.layout()
        })

        const objs = []
        let id = 0
        const interrupts = [false]
        const walls = {}

        async function run () {
            for (const obj of objs) {
                board.removeObject(obj)
            }

            interrupts[id] = true
            interrupts.push(false)
            id++

            const cid = id
            console.log(interrupts)

            await execute({
                ...parse(lex(editor.getValue())),
                interrupt: function () {
                    return interrupts[cid]
                },
                board,
                objs,
                walls
            })
        }

        document.querySelector('#exec').addEventListener('click', async function (event) {
            await run()
        })

        document.querySelector('#stop').addEventListener('click', async function (event) {
            interrupts[id] = true
        })

        const place = function (coords) {
            if (coords in walls) {
                board.removeObject(walls[coords])
                delete walls[coords]
            } else {
                walls[coords] = board.create('segment', coords, {
                    strokeColor: 'red',
                    highlightStrokeColor: 'red'
                })
            }
        }

        board.on('down', function (event, i) {
            const cPos = board.getCoordsTopLeftCorner(event, i)
            const absPos = JXG.getPosition(event, i)

            const dx = absPos[0] - cPos[0]
            const dy = absPos[1] - cPos[1]

            let coords = new JXG.Coords(JXG.COORDS_BY_SCREEN, [dx, dy], board)
            const [_, x, y] = coords.usrCoords

            const [lx, mx, ux] = [Math.floor(x), Math.round(x), Math.ceil(x)]
            const [ly, my, uy] = [Math.floor(y), Math.round(y), Math.ceil(y)]

            if (Math.abs(mx - x) < 0.1) {
                coords = [[mx, ly], [mx, uy]]
            } else if (Math.abs(my - y) < 0.1) {
                coords = [[lx, my], [ux, my]]
            }

            if (coords instanceof JXG.Coords) {
                return
            }

            place(coords)
        })

        function download (data, filename, type) {
            const file = new Blob([data], { type: type })
            const a = document.createElement('a')
            const url = URL.createObjectURL(file)

            a.href = url
            a.download = filename
            document.body.appendChild(a)

            a.click()

            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)
        }

        document.addEventListener('keydown', function (event) {
            if (event.keyCode === 83 && (navigator.platform.match('Mac') ? event.metaKey : event.ctrlKey)) {
                event.preventDefault()
                download(editor.getValue(), 'source.txt', 'text')
            }
        }, false)

        document.addEventListener('keydown', function (event) {
            if (event.keyCode === 79 && (navigator.platform.match('Mac') ? event.metaKey : event.ctrlKey)) {
                event.preventDefault()
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = '.txt'

                input.onchange = e => {
                    const file = e.target.files[0]
                    const reader = new FileReader()
                    reader.readAsText(file, 'UTF-8')

                    reader.onload = event => {
                        editor.setValue(event.target.result)
                    }
                }

                input.click()
            }
        }, false)

        for (let x = 0; x < 21; x++) {
            place([[x, 0], [x + 1, 0]])
            place([[x, 21], [x + 1, 21]])
        }

        for (let y = 0; y < 21; y++) {
            place([[0, y], [0, y + 1]])
            place([[21, y], [21, y + 1]])
        }

        editor.focus()
    }
}
</script>

<style>
html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

#app {
    height: 100%;
    width: 100%;

    display: flex;
}

#editor {
    height: 96%;
    width: 100%;
}

#bar {
    height: 4%;
    width: 100%;
    background-color: rgb(30, 30, 30);
    position: relative;
}

#exec {
    position: absolute;
    right: 10px;
    top: 5px;

    width: 5%;
    height: 60%;
}

#exec > svg {
    width: 100%;
    height: 100%;
    transform: rotate(90deg);
}

#stop {
    position: absolute;
    right: 60px;
    top: 5px;

    width: 5%;
    height: 60%;
}

#stop > svg {
    width: 100%;
    height: 100%;
}

#title {
    top: 10px;
    left: 10px;
    position: absolute;
    font-family: Consolas;
    font-size: 2vmin;
    color: white;
}

#field {
    background-color: rgb(30, 30, 30);
}

@media (min-height: 100vw) {
    #app {
        flex-direction: column;
    }
    #code, #field {
        height: 50vh;
        width: 100vw;
    }
}

@media (min-width: 100vh) {
    #app {
        flex-direction: row;
    }
    #code, #field {
        height: 100vh;
        width: 50vw;
    }
}

</style>
