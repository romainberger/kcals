const fs = require('fs')
const path = require('path')
const os = require('os')
const https = require('https')
const semver = require('semver')

const hasUpdate = (currentVersion) => {
    return new Promise(resolve => {
        https.get('https://registry.npmjs.org/-/package/kcals/dist-tags', resp => {
            let data = ''

            resp.on('data', (chunk) => {
                data += chunk
            })

            resp.on('end', () => {
                const latestVersion = JSON.parse(data).latest

                resolve(semver.gt(latestVersion, currentVersion) ? latestVersion : false)
            })
        })
    })
}

const writeConfigFile = (content, cb) => {
    fs.writeFile(getConfigPath(), JSON.stringify(content), { flag: 'w' }, err => {
        typeof cb === "function" && cb(err)
    })
}

const getConfigPath = () => {
    return path.join(os.homedir(), '.kcals.config.json')
}

const getConfig = () => {
    const configPath = getConfigPath()

    if (!fs.existsSync(configPath)) {
        return false
    }

    return require(configPath)
}

module.exports = {
    getConfig,
    getConfigPath,
    hasUpdate,
    writeConfigFile,
}
