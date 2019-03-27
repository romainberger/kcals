const { h, Component, Text } = require('ink')
const Slack = require('slack')

class Kcals extends Component {
    onKeyPress(e, data) {
        switch (data.name) {
            case "return":
                if (this.state.input === "person") {
                    this.setState({
                        input: "message",
                        user: this.getMatchingUsers()[this.state.selectionIndex],
                    })
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
        await this.slack.chat.postMessage({
            channel: this.state.user.id,
            as_user: true,
            text: this.state.message,
        })
        this.setState({ sent: true }, process.exit)
    }

    async fetchUsers() {
        const users = await this.slack.users.list()
        this.setState({ users: users.members.filter(user => !user.deleted) })
    }

    getMatchingUsers() {
        return this.state.users.filter(u => {
            return (u.name.length || u.real_name.length) && (u.name.includes(this.state.person) || (u.real_name && u.real_name.includes(this.state.person)))
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
                                        <Text green key={ user.id }>{ displayName }</Text>
                                    ) : (
                                        <Text grey key={ user.id }>{ displayName }</Text>
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

    constructor(props) {
        super(props)

        this.onKeyPress = this.onKeyPress.bind(this)

        this.state = {
            input: 'person',
            message: '',
            person: '',
            selectionIndex: 0,
            sent: false,
            users: [],
            user: null,
        }

        this.slack = new Slack({ token: this.props.config.token })
        this.fetchUsers()
    }

    componentDidMount() {
        process.stdin.on('keypress', this.onKeyPress)
    }

    render() {
        if (this.state.sent) {
            return <Text green>✔︎ Message sent to { this.getUserDisplayName(this.state.user) }</Text>
        }

        return (
            <div>
                <div>
                    { this.state.input === "message" && <Text green>✔︎ </Text> }
                    <Text bold cyan>@{ this.state.input === "person" ? this.state.person : this.getUserDisplayName(this.state.user) }</Text>
                </div>
                {
                    this.state.input === "person" && this.renderAutocomplete()
                }
                <div><Text>{ this.state.message }</Text></div>

            </div>
        )
    }
}

module.exports = Kcals
