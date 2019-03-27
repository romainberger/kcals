#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const os = require('os')
const readline = require('readline')
const importJsx = require('import-jsx')
const { h, render } = require('ink')

const configPath = path.join(os.homedir(), '.kcals.config.json')

const main = () => {
    const config = require(configPath)
    const ui = importJsx('./src/Kcals')

    render(h(ui, { config }))
}

if (fs.existsSync(configPath)) {
    main()
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
        fs.writeFile(configPath, JSON.stringify(content), { flag: 'w' }, err => {
            if (err) {
                console.log('Something wrong happened, sorry.')
            }
            else {
                console.log('Thank you!\n')
                main()
            }
        })
    })
}
