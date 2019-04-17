const React = require('react')
const { Component } = require('react')
const { Color } = require('ink')

class Cursor extends Component {
    blink() {
        this.setState({
            visible: !this.state.visible,
        })

        this.interval = setTimeout(this.blink, 500)
    }

    constructor() {
        super()

        this.blink = this.blink.bind(this)

        this.state = {
            visible: true,
        }
    }

    componentDidMount() {
        this.blink()
    }

    componentWillUnmount() {
        clearTimeout(this.interval)
    }

    render() {
        return <Color white>{ this.state.visible ? '▎' : ' ' }</Color>
    }
}

module.exports = Cursor
