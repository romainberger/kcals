#!/usr/bin/env node
const readline = require('readline')
const importJsx = require('import-jsx')
const { render } = require('ink')
const { createElement } = require('react')

const helper = require('./src/helper')

if (process.argv.includes('__get_completion_users')) {
    // for autocompletion
    require('./src/getUsers')()
}
else {
    const main = (config) => {
        const ui = importJsx('./src/Kcals')

        const receiver = process.argv.find(arg => arg[0] === '@') || ''
        let message

        if (receiver) {
            const index = process.argv.indexOf(receiver)
            message = process.argv.slice([index + 1])
            message = message.join(' ') || null
        }

        render(createElement(ui, {
            config,
            message,
            receiver: receiver.replace('@', ''),
        }))
    }

    if (helper.getConfig()) {
        main(helper.getConfig())
    }
    else {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        })

        rl.question('Please provide a token for slack:\n', res => {
            const content = {
                token: res,
            }

            helper.writeConfigFile(content, err => {
                if (err) {
                    console.log('Something wrong happened, sorry.')
                }
                else {
                    console.log('Thank you!\n')
                    main(helper.getConfig())
                }
            })
        })
    }

}
