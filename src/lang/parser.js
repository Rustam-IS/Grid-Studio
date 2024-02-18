export function parse (tokens, scope = {}, guard = true) {
    let cmds = ''

    const token = function () {
        return tokens.splice(0, 1)[0]
    }

    while (tokens.length) {
        const temp = token()
        if (temp === 'IFBLOCK') {
            cmds += `
                if (scope.blocked('${token()}')) {
                    ${parse(tokens, scope, false)}
                }
            `
        } else if (temp === 'REPEAT') {
            cmds += `
                for (let pos = 0; pos < ${token()}; pos++) {
                    ${parse(tokens, scope, false)}
                }
            `
        } else if (temp === 'PROCEDURE') {
            // eslint-disable-next-line no-eval
            scope[token()] = eval(`(
                async function(scope) {
                    ${parse(tokens, scope, false)}
                }
            )`)
        } else if (temp === 'CALL') {
            cmds += `
                await scope.${token()}(scope)
            `
        } else if (temp === 'SET') {
            cmds += `
                scope.${token()} = ${token()}
            `
        } else if (['RIGHT', 'UP', 'LEFT', 'DOWN'].includes(temp)) {
            let arg = token()
            arg = isNaN(parseInt(arg)) ? `scope.${arg}` : arg
            cmds += `
                await scope.${temp}(${arg})
            `
        } else if (['ENDIF', 'ENDREPEAT', 'ENDPROC'].includes(temp)) {
            return cmds
        }
    }

    return guard
        ? {
            // eslint-disable-next-line no-eval
            func: eval(
                `(
                async function(scope) {
                    ${cmds}
                }
            )`),
            scope
        }
        : cmds
}
