export function lex (code) {
    return code.split(/[ \n\t]+/).filter(function (item) {
        return [
            'RIGHT', 'UP', 'LEFT', 'DOWN',
            'SET', 'CALL',
            'PROCEDURE', 'ENDPROC',
            'REPEAT', 'ENDREPEAT',
            'IFBLOCK', 'ENDIF'
        ].includes(item) ||
            /[a-zA-Z][a-zA-Z0-9]*/.test(item) ||
            /[0-9]+/.test(item)
    })
}
