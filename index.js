const fs = require('fs')
const path = require('path')
const os = require('os')
const importJsx = require('import-jsx')
const { h, render } = require('ink')

const configPath = path.join(os.homedir(), 'tlack.json')
console.log(configPath)

try {
    const config = require(configPath)
    const ui = importJsx('./ui')

    render(h(ui, { config }))
}
catch(e) {
    console.log('Missing tlack.json config file.')
    console.log('Please check out the readme to create your config file.')
    process.exit()
}
