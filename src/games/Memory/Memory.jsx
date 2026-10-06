import { useEffect, useState } from 'react'
import './Memory.css'

const SYMBOLS = [
    '♠',
    '♥',
    '♦',
    '♣',
    '★',
    '◆',
    '●',
    '▲'
]

const createCards = () => {
    const cards = [...SYMBOLS, ...SYMBOLS]

    return cards
        .sort(() => Math.random() - 0.5)
        .map((symbol, index) => ({
            id: index,
            symbol,
            matched: false
        }))
}

function Memory({ onExit }) {
    const [cards, setCards] = useState(createCards)
    const [flipped, setFlipped] = useState([])
    const [moves, setMoves] = useState(0)
    const [matches, setMatches] = useState(0)
    const [gameOver, setGameOver] = useState(false)

    const handleCardClick = (card) => {
        if (
            card.matched ||
            flipped.includes(card.id) ||
            flipped.length === 2 ||
            gameOver
        ) {
            return
        }

        const newFlipped = [...flipped, card.id]

        setFlipped(newFlipped)

        if (newFlipped.length === 2) {
            setMoves((currentMoves) => currentMoves + 1)

            const firstCard = cards.find(
                (item) => item.id === newFlipped[0]
            )

            const secondCard = cards.find(
                (item) => item.id === newFlipped[1]
            )

            if (firstCard.symbol === secondCard.symbol) {
                setTimeout(() => {
                    setCards((currentCards) =>
                        currentCards.map((item) =>
                            newFlipped.includes(item.id)
                                ? {
                                      ...item,
                                      matched: true
                                  }
                                : item
                        )
                    )

                    setFlipped([])
                    setMatches(
                        (currentMatches) =>
                            currentMatches + 1
                    )
                }, 400)
            } else {
                setTimeout(() => {
                    setFlipped([])
                }, 800)
            }
        }
    }

    useEffect(() => {
        if (matches === SYMBOLS.length) {
            setGameOver(true)
        }
    }, [matches])

    const restartGame = () => {
        setCards(createCards())
        setFlipped([])
        setMoves(0)
        setMatches(0)
        setGameOver(false)
    }

    return (
        <div className="memory-game">
            <header className="memory-header">
                <button
                    type="button"
                    onClick={onExit}
                >
                    ← BACK
                </button>

                <div className="memory-title">
                    <span>GAMEHUB</span>
                    <h1>MEMORY</h1>
                </div>

                <div className="memory-stats">
                    <div>
                        <span>MOVES</span>
                        <strong>{moves}</strong>
                    </div>

                    <div>
                        <span>MATCHES</span>
                        <strong>
                            {matches}/{SYMBOLS.length}
                        </strong>
                    </div>
                </div>
            </header>

            <main className="memory-main">
                <div className="memory-board">
                    {cards.map((card) => {
                        const isFlipped =
                            flipped.includes(card.id) ||
                            card.matched

                        return (
                            <button
                                type="button"
                                key={card.id}
                                className={`memory-card ${
                                    isFlipped
                                        ? 'flipped'
                                        : ''
                                } ${
                                    card.matched
                                        ? 'matched'
                                        : ''
                                }`}
                                onClick={() =>
                                    handleCardClick(card)
                                }
                            >
                                <span className="card-front">
                                    ?
                                </span>

                                <span className="card-back">
                                    {card.symbol}
                                </span>
                            </button>
                        )
                    })}

                    {gameOver && (
                        <div className="memory-game-over">
                            <h2>YOU WIN!</h2>

                            <p>
                                COMPLETED IN {moves} MOVES
                            </p>

                            <button
                                type="button"
                                onClick={restartGame}
                            >
                                PLAY AGAIN
                            </button>
                        </div>
                    )}
                </div>

                <div className="memory-controls">
                    <p>
                        FIND ALL MATCHING PAIRS
                    </p>

                    <button
                        type="button"
                        onClick={restartGame}
                    >
                        RESTART GAME
                    </button>
                </div>
            </main>
        </div>
    )
}

export default Memory