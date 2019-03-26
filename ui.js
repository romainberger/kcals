const { h, Component, Text } = require('ink')

class Tlack extends Component {
    onKeyPress(e, data) {
        switch (data.name) {
            case "return":
                if (this.state.input === "person") {
                    this.setState({ input: "message" })
                    return
                }

                this.sendMessage()
                break

            case "tab":
                break

            case "backspace":
                if (this.state.input === "person") {
                    this.setState({ person: this.state.person.substr(0, this.state.person.length - 1) })
                }
                else {
                    this.setState({ message: this.state.message.substr(0, this.state.message.length - 1) })
                }
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

    sendMessage() {
        console.log(`Send message ${this.state.message} to ${this.state.person}`)
        process.exit()
    }

    constructor(props) {
        super(props)

        this.onKeyPress = this.onKeyPress.bind(this)

        this.state = {
            person: '',
            message: '',
            input: 'person',
        }
    }

    componentDidMount() {
        process.stdin.on('keypress', this.onKeyPress)

        console.log('config', this.props.config)
    }

    render() {
        return (
            <div>
                <div><Text cyan>Tlack</Text></div>
                <div><Text bold red>@{ this.state.person }</Text></div>
                <div><Text>{ this.state.message }</Text></div>
            </div>
        )
    }
}

module.exports = Tlack
