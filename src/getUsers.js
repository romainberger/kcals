#!/usr/bin/env node

/**
 * Write the user list for completion
 *
 * Request the user from the api and write it to a temp
 * file for next use. Cache is valid for 24 hours
 */

const os = require('os')
const path = require('path')

const tempFilePath = path.join(os.tmpdir(), '__kcals_completion_users.json')

const getUsersList = () => {
    const fs = require('fs')
    const helper = require('./helper')
    const Slack = require('slack')

    return new Promise(async resolve => {
        if (helper.getConfig()) {
            const config = helper.getConfig()
            const slack = new Slack({ token: config.token })

            // todo cache for like one day to avoid too many requests
            const rawUsers = await slack.users.list()

            const users = rawUsers.members.reduce((acc, user) => {
                if (!user.deleted && user.profile.display_name.length) {
                    acc = `${acc} '@${user.profile.display_name}' '@${user.real_name}' '@${user.name}'`
                }

                return acc
            }, '')

            const cache = {
                date: Date.now(),
                users,
            }
            fs.writeFile(tempFilePath, JSON.stringify(cache), { flag: 'w' }, () => {})

            resolve(users)
        }
    })
}

module.exports = async () => {
    try {
        const cachedUsers = require(tempFilePath)
        const now = Date.now()
        const cacheDuration = 1000 * 60 * 60 * 24 // 1 day

        if (now - cachedUsers.date <= cacheDuration) {
            process.stdout.write(cachedUsers.users)
        }
        else {
            const users = await getUsersList()
            process.stdout.write(users)
        }
    }
    catch(e) {
        const users = await getUsersList()
        process.stdout.write(users)
    }
}
