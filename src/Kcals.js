const React = require('react')
const { Component, PureComponent } = require('react')
const { Box, Color, StdinContext } = require('ink')
const Slack = require('slack')
const importJsx = require('import-jsx')

const Cursor = importJsx('./Cursor')

const currentVersion = require('./../package').version
const helper = require('./helper')

class Kcals extends Component {
    onKeyPress(e, data) {
        if (!this.mounted) {
            return
        }

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
            <Box width="100%" flexDirection="column">
                {
                    matchingUsers.map((user, index) => {
                        const displayName = this.getUserDisplayName(user)

                        return (
                            <Box width="100%" key={ user.id }>
                                <Color green={ selectionIndex === index } grey={ selectionIndex !== index }>   { displayName }</Color>
                            </Box>
                        )
                    })
                }
            </Box>
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

        this.mounted = true

        this.slack = new Slack({ token: this.props.config.token })
    }

    componentDidMount() {
        const { stdin, setRawMode } = this.props

        setRawMode(true)
        stdin.on('keypress', this.onKeyPress)

        this.start()
    }

    componentWillUnmount() {
        const { stdin, setRawMode } = this.props

        stdin.removeListener('data', this.onKeyPress)
        setRawMode(false)
        this.mounted = false
    }

    render() {
        if (this.state.sent) {
            const successMessage = <Color green>✔︎ Message sent to { this.getUserDisplayName(this.state.user) }</Color>

            if (this.state.newVersion) {
                return (
                    <Box width="100%" flexDirection="column">
                        <Box>{ successMessage }</Box>
                        <Box><Color grey>An update for Kcals is available! ({ this.state.newVersion })</Color></Box>
                    </Box>
                )
            }

            return successMessage
        }

        if (!this.state.started) {
            return null
        }

        return (
            <Box width="100%" flexDirection="column">
                <Box width="100%">
                    { this.state.input === "message" ? <Color green>✔︎ </Color> : "  " }
                    <Color bold cyan>@{ this.state.input === "person" ? <Box>{ this.state.person }<Cursor /></Box> : this.getUserDisplayName(this.state.user) }</Color>
                </Box>
                {
                    this.state.input === "person" && this.renderAutocomplete()
                }
                {
                    this.state.input === "message" && <Box width="100%"><Color>  { this.state.message }<Cursor /></Color></Box>
                }
            </Box>
        )
    }
}

class App extends PureComponent {
    render() {
        return (
            <StdinContext.Consumer>
                {
                    ({ stdin, setRawMode }) => (
                        <Kcals {...this.props} stdin={ stdin } setRawMode={ setRawMode } />
                    )
                }
            </StdinContext.Consumer>
        );
    }
}

module.exports = App
