const { h, Component, Text } = require('ink')
const Slack = require('slack')
const importJsx = require('import-jsx')

const Cursor = importJsx('./Cursor')

const currentVersion = require('./../package').version
const helper = require('./helper')

class Kcals extends Component {
    onKeyPress(e, data) {
        switch (data.name) {
            case "return":
                const matchingUsers = this.getMatchingUsers()
                if (this.state.input === "person") {
                    if (matchingUsers.length) {
                        this.setState({
                            input: "message",
                            user: matchingUsers[this.state.selectionIndex],
                        })
                    }
                    return
                }

                this.sendMessage()
                break

            case "backspace":
                if (this.state.input === "person") {
                    this.setState({ person: this.state.person.substr(0, this.state.person.length - 1) })
                }
                else {
                    this.setState({ message: this.state.message.substr(0, this.state.message.length - 1) })
                }
                break

            case "up":
                this.setState({ selectionIndex: Math.max(0, this.state.selectionIndex - 1)})
                break

            case "tab":
            case "down":
                const newIndex = this.state.selectionIndex + 1 > this.getMatchingUsers().length - 1 ? 0 : this.state.selectionIndex + 1
                this.setState({ selectionIndex: newIndex })
                break

            default:
                if (this.state.input === "person") {
                    this.setState({ person: `${this.state.person}${e}` })
                }
                else {
                    this.setState({ message: `${this.state.message}${e}` })
                }
        }
    }

    async sendMessage() {
        if (!this.state.user || !this.state.message.replace(/\s/g, '').length) {
            return
        }

        await this.slack.chat.postMessage({
            channel: this.state.user.id,
            as_user: true,
            text: this.state.message,
        })

        this.setState({
            sent: true,
        }, process.exit)
    }

    fetchUsers() {
        return new Promise(async resolve => {
            const users = await this.slack.users.list()
            this.setState({ users: users.members.filter(user => !user.deleted) }, resolve)
        })
    }

    getMatchingUsers() {
        const value = this.state.person.toLowerCase()

        if (!value.replace(/\s/g, '').length) {
            return []
        }

        return this.state.users.filter(u => {
            return (u.name.length || u.real_name.length) && (u.name.toLowerCase().includes(value) || (u.real_name && u.real_name.toLowerCase().includes(value)))
        }).slice(0, 5)
    }

    renderAutocomplete() {
        if (!this.state.person.length) {
            return null
        }

        const matchingUsers = this.getMatchingUsers()
        const { selectionIndex } = this.state

        return (
            <div>
                {
                    matchingUsers.map((user, index) => {
                        const displayName = this.getUserDisplayName(user)

                        return (
                            <div>
                                {
                                    selectionIndex === index ? (
                                        <Text green key={ user.id }>   { displayName }</Text>
                                    ) : (
                                        <Text grey key={ user.id }>   { displayName }</Text>
                                    )
                                }
                            </div>
                        )
                    })
                }
            </div>
        )
    }

    getUserDisplayName(user) {
        return user.profile.display_name || user.real_name || user.name
    }

    // if we have valid receiver and message, and there is only one user match
    // send the message immediately
    checkArgumentInput(cb) {
        if (!this.state.person.length || !this.state.message.length) {
            cb()
            return
        }

        const matchingUsers = this.getMatchingUsers(this.state.person)

        if (matchingUsers.length === 1) {
            this.setState({
                user: matchingUsers[0],
            }, this.sendMessage)
        }
        else {
            cb()
        }
    }

    async checkUpdate() {
        // check new versions about once a month because it can be annoying
        // also if the user let us do it
        if (this.props.config["check-updates"] === false) {
            return
        }

        const lastUpdateCheck = this.props.config.lastUpdateCheck || false
        const delay = 1000 * 60 * 60 * 24 * 30
        let saveLastCheckTime = !lastUpdateCheck

        if (!lastUpdateCheck || Date.now() - lastUpdateCheck > delay) {
            const newVersion = await helper.hasUpdate(currentVersion)

            this.setState({ newVersion })
            saveLastCheckTime = true
        }

        if (saveLastCheckTime) {
            const newConfig = {
                ...this.props.config,
                lastUpdateCheck: Date.now(),
            }

            helper.writeConfigFile(newConfig)
        }
    }

    async start() {
        await this.fetchUsers()

        this.checkArgumentInput(() => {
            this.setState({ started: true })
            process.stdin.on('keypress', this.onKeyPress)
            this.checkUpdate()
        })
    }

    constructor(props) {
        super(props)

        this.onKeyPress = this.onKeyPress.bind(this)
        this.sendMessage = this.sendMessage.bind(this)

        this.state = {
            input: 'person',
            message: this.props.message || '',
            newVersion: false,
            person: this.props.receiver || '',
            selectionIndex: 0,
            sent: false,
            started: false,
            users: [],
            user: null,
        }

        this.slack = new Slack({ token: this.props.config.token })
        this.start()
    }

    render() {
        if (this.state.sent) {
            const successMessage = <Text green>✔︎ Message sent to { this.getUserDisplayName(this.state.user) }</Text>

            if (this.state.newVersion) {
                return (
                    <div>
                        <div>{ successMessage }</div>
                        <div><Text grey>An update for Kcals is available! ({ this.state.newVersion })</Text></div>
                    </div>
                )
            }

            return successMessage
        }

        if (!this.state.started) {
            return null
        }

        return (
            <div>
                <div>
                    { this.state.input === "message" ? <Text green>✔︎ </Text> : "  " }
                    <Text bold cyan>@{ this.state.input === "person" ? <span>{ this.state.person }<Cursor /></span> : this.getUserDisplayName(this.state.user) }</Text>
                </div>
                {
                    this.state.input === "person" && this.renderAutocomplete()
                }
                {
                    this.state.input === "message" && <div><Text>  { this.state.message }<Cursor /></Text></div>
                }
            </div>
        )
    }
}

module.exports = Kcals
