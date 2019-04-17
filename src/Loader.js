const React = require('react')
const { Component } = require('react')
const { Box, Color } = require('ink')

const NAME = [
    'K',
    'C',
    'A',
    'L',
    'S',
]

class Loader extends Component {
    cycle() {
        if (!this.mounted) {
            return
        }

        this.setState({
            index: Math.max(0, Math.min(this.maxIndex, this.state.way ? this.state.index + 1 : this.state.index - 1)),
            way: this.state.index === this.maxIndex ? 0 : (this.state.index === 0 ? 1 : this.state.way),
        })

        setTimeout(this.cycle, 50)
    }

    constructor(props) {
        super(props)

        this.state = {
            index: 0,
            way: 1,
        }

        this.mounted = true
        this.maxIndex = NAME.length - 1

        this.interval = null
        this.cycle = this.cycle.bind(this)
    }

    componentDidMount() {
        this.cycle()
    }

    componentWillUnmount() {
        this.mounted = false
        clearTimeout(this.interval)
    }

    render() {
        const { index } = this.state

        return (
            <Box width="100%">
                {
                    NAME.map((letter, i) => <Color cyan={ i === index } grey={ i !== index } key={ letter }>{ letter }</Color>)
                }
            </Box>
        )
    }
}

module.exports = Loader
