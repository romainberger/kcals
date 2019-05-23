const React = require('react')
const { useEffect, useState } = React
const { Color } = require('ink')

const Cursor = ({ typing }) => {
    const [ visible, setVisible ] = useState(true)

    useEffect(() => {
        const timeout = setTimeout(() => {
            setVisible(!visible)
        }, 500)

        return () => {
            clearTimeout(timeout)
        }
    })

    return <Color white>{ visible || typing ? '▎' : ' ' }</Color>
}

module.exports = Cursor
