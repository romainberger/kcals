#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const os = require('os')
const importJsx = require('import-jsx')
const { h, render } = require('ink')

const configPath = path.join(os.homedir(), 'kcals.config.json')

const main = () => {
    const config = require(configPath)
    const ui = importJsx('./ui')

    render(h(ui, { config }))
}

try {
    main()
}
catch(e) {
    console.log('Missing ~/kcals.config.json config file.')
    console.log('Please check out the readme to create your config file.')
    process.exit()
}
