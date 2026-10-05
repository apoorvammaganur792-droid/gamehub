import { useEffect, useState } from 'react'
import './Tetris.css'

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20

const SHAPES = [
    [[1, 1, 1, 1]],
    [
        [1, 1],
        [1, 1]
    ],
    [
        [0, 1, 0],
        [1, 1, 1]
    ],
    [
        [1, 0, 0],
        [1, 1, 1]
    ],
    [
        [0, 0, 1],
        [1, 1, 1]
    ],
    [
        [0, 1, 1],
        [1, 1, 0]
    ],
    [
        [1, 1, 0],
        [0, 1, 1]
    ]
]

const createEmptyBoard = () =>
    Array.from(
        { length: BOARD_HEIGHT },
        () => Array(BOARD_WIDTH).fill(0)
    )

const randomPiece = () => {
    const shape =
        SHAPES[Math.floor(Math.random() * SHAPES.length)]

    return {
        shape,
        x: Math.floor(
            (BOARD_WIDTH - shape[0].length) / 2
        ),
        y: 0
    }
}

function Tetris({ onExit }) {
    const [board, setBoard] = useState(createEmptyBoard)
    const [piece, setPiece] = useState(randomPiece)
    const [score, setScore] = useState(0)
    const [lines, setLines] = useState(0)
    const [gameOver, setGameOver] = useState(false)

    const isValidMove = (currentPiece, boardState) => {
        return currentPiece.shape.every((row, rowIndex) =>
            row.every((cell, columnIndex) => {
                if (!cell) {
                    return true
                }

                const newX =
                    currentPiece.x + columnIndex

                const newY =
                    currentPiece.y + rowIndex

                if (
                    newX < 0 ||
                    newX >= BOARD_WIDTH ||
                    newY >= BOARD_HEIGHT
                ) {
                    return false
                }

                if (
                    newY >= 0 &&
                    boardState[newY][newX]
                ) {
                    return false
                }

                return true
            })
        )
    }

    const mergePiece = () => {
        const newBoard = board.map((row) => [...row])

        piece.shape.forEach((row, rowIndex) => {
            row.forEach((cell, columnIndex) => {
                if (!cell) {
                    return
                }

                const y = piece.y + rowIndex
                const x = piece.x + columnIndex

                if (
                    y >= 0 &&
                    y < BOARD_HEIGHT &&
                    x >= 0 &&
                    x < BOARD_WIDTH
                ) {
                    newBoard[y][x] = 1
                }
            })
        })

        const remainingRows = newBoard.filter(
            (row) => row.some((cell) => cell === 0)
        )

        const clearedRows =
            BOARD_HEIGHT - remainingRows.length

        while (remainingRows.length < BOARD_HEIGHT) {
            remainingRows.unshift(
                Array(BOARD_WIDTH).fill(0)
            )
        }

        setBoard(remainingRows)

        if (clearedRows > 0) {
            setLines((currentLines) =>
                currentLines + clearedRows
            )

            setScore((currentScore) =>
                currentScore + clearedRows * 100
            )
        }

        const nextPiece = randomPiece()

        if (!isValidMove(nextPiece, remainingRows)) {
            setGameOver(true)
            return
        }

        setPiece(nextPiece)
    }

    const movePiece = (xChange, yChange) => {
        if (gameOver) {
            return
        }

        const movedPiece = {
            ...piece,
            x: piece.x + xChange,
            y: piece.y + yChange
        }

        if (isValidMove(movedPiece, board)) {
            setPiece(movedPiece)
            return true
        }

        if (yChange > 0) {
            mergePiece()
        }

        return false
    }

    const rotatePiece = () => {
        if (gameOver) {
            return
        }

        const rotatedShape =
            piece.shape[0].map(
                (_, columnIndex) =>
                    piece.shape
                        .map((row) => row[columnIndex])
                        .reverse()
            )

        const rotatedPiece = {
            ...piece,
            shape: rotatedShape
        }

        if (isValidMove(rotatedPiece, board)) {
            setPiece(rotatedPiece)
        }
    }

    useEffect(() => {
        if (gameOver) {
            return
        }

        const gameLoop = setInterval(() => {
            movePiece(0, 1)
        }, 700)

        return () => {
            clearInterval(gameLoop)
        }
    })

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (gameOver) {
                return
            }

            if (event.key === 'ArrowLeft') {
                movePiece(-1, 0)
            }

            if (event.key === 'ArrowRight') {
                movePiece(1, 0)
            }

            if (event.key === 'ArrowDown') {
                movePiece(0, 1)
            }

            if (event.key === 'ArrowUp') {
                rotatePiece()
            }

            if (event.key === ' ') {
                event.preventDefault()

                let droppedPiece = {
                    ...piece
                }

                while (
                    isValidMove(
                        {
                            ...droppedPiece,
                            y: droppedPiece.y + 1
                        },
                        board
                    )
                ) {
                    droppedPiece = {
                        ...droppedPiece,
                        y: droppedPiece.y + 1
                    }
                }

                setPiece(droppedPiece)
                setTimeout(() => {
                    movePiece(0, 1)
                }, 0)
            }
        }

        window.addEventListener(
            'keydown',
            handleKeyDown
        )

        return () => {
            window.removeEventListener(
                'keydown',
                handleKeyDown
            )
        }
    }, [piece, board, gameOver])

    const restartGame = () => {
        setBoard(createEmptyBoard())
        setPiece(randomPiece())
        setScore(0)
        setLines(0)
        setGameOver(false)
    }

    const getCell = (row, column) => {
        if (
            row >= piece.y &&
            row < piece.y + piece.shape.length &&
            column >= piece.x &&
            column < piece.x + piece.shape[0].length
        ) {
            const pieceRow = row - piece.y
            const pieceColumn = column - piece.x

            if (
                piece.shape[pieceRow] &&
                piece.shape[pieceRow][pieceColumn]
            ) {
                return 2
            }
        }

        return board[row][column]
    }

    return (
        <div className="tetris-game">
            <header className="tetris-header">
                <button
                    type="button"
                    onClick={onExit}
                >
                    ← BACK
                </button>

                <div className="tetris-title">
                    <span>GAMEHUB</span>
                    <h1>TETRIS</h1>
                </div>

                <div className="tetris-stats">
                    <div>
                        <span>SCORE</span>
                        <strong>{score}</strong>
                    </div>

                    <div>
                        <span>LINES</span>
                        <strong>{lines}</strong>
                    </div>
                </div>
            </header>

            <main className="tetris-main">
                <div className="tetris-board">
                    {board.map((row, rowIndex) =>
                        row.map((_, columnIndex) => {
                            const cell = getCell(
                                rowIndex,
                                columnIndex
                            )

                            return (
                                <div
                                    key={`${rowIndex}-${columnIndex}`}
                                    className={`tetris-cell ${
                                        cell === 1
                                            ? 'filled'
                                            : cell === 2
                                              ? 'active'
                                              : ''
                                    }`}
                                />
                            )
                        })
                    )}

                    {gameOver && (
                        <div className="tetris-game-over">
                            <h2>GAME OVER</h2>

                            <p>
                                SCORE: {score}
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

                <div className="tetris-controls">
                    <p>
                        ARROWS TO MOVE · ↑ TO ROTATE
                    </p>

                    <div className="tetris-buttons">
                        <button
                            type="button"
                            onClick={() =>
                                movePiece(-1, 0)
                            }
                        >
                            ←
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                movePiece(0, 1)
                            }
                        >
                            ↓
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                movePiece(1, 0)
                            }
                        >
                            →
                        </button>

                        <button
                            type="button"
                            onClick={rotatePiece}
                        >
                            ↻
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Tetris