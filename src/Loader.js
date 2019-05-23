const React = require('react')
const { useEffect, useState } = React
const { Box, Color } = require('ink')

const NAME = [
    'K',
    'C',
    'A',
    'L',
    'S',
]

const maxIndex = NAME.length - 1

const Loader = () => {
    const [ index, setIndex ] = useState(0)
    const [ way, setWay ] = useState(1)

    useEffect(() => {
        const timeout = setTimeout(() => {
            setIndex(currentIndex => {
                return Math.max(0, Math.min(maxIndex, way ? currentIndex + 1 : currentIndex - 1))
            })

            setWay(currentWay => {
                return index === maxIndex ? 0 : (index === 0 ? 1 : currentWay)
            })
        }, 50)

        return () => {
            clearTimeout(timeout)
        }
    })

    return (
        <Box width="100%">
            {
                NAME.map((letter, i) => <Color cyan={ i === index } grey={ i !== index } key={ letter }>{ letter }</Color>)
            }
        </Box>
    )
}

module.exports = Loader
