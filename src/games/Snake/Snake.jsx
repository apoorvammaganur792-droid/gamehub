import { useEffect, useState } from 'react'
import './Snake.css'

const GRID_SIZE = 20

function Snake({ onExit }) {
  const [snake, setSnake] = useState([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ])

  const [food, setFood] = useState({ x: 15, y: 10 })
  const [direction, setDirection] = useState({ x: 1, y: 0 })
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowUp' && direction.y !== 1) {
        setDirection({ x: 0, y: -1 })
      }

      if (event.key === 'ArrowDown' && direction.y !== -1) {
        setDirection({ x: 0, y: 1 })
      }

      if (event.key === 'ArrowLeft' && direction.x !== 1) {
        setDirection({ x: -1, y: 0 })
      }

      if (event.key === 'ArrowRight' && direction.x !== -1) {
        setDirection({ x: 1, y: 0 })
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [direction])

  useEffect(() => {
    if (gameOver) {
      return
    }

    const gameLoop = setInterval(() => {
      setSnake((currentSnake) => {
        const head = currentSnake[0]

        const newHead = {
          x: head.x + direction.x,
          y: head.y + direction.y
        }
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setGameOver(true)
          return currentSnake
        }
        const hitSelf = currentSnake.some(
          (segment) =>
            segment.x === newHead.x &&
            segment.y === newHead.y
        )

        if (hitSelf) {
          setGameOver(true)
          return currentSnake
        }
        const newSnake = [newHead, ...currentSnake]
        if (
          newHead.x === food.x &&
          newHead.y === food.y
        ) {
          setScore((currentScore) => currentScore + 10)

          setFood({
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
          })

          return newSnake
        }
        newSnake.pop()

        return newSnake
      })
    }, 350)

    return () => {
      clearInterval(gameLoop)
    }
  }, [direction, food, gameOver])

  const restartGame = () => {
    setSnake([
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ])

    setFood({ x: 15, y: 10 })
    setDirection({ x: 1, y: 0 })
    setScore(0)
    setGameOver(false)
  }
  const changeDirection = (newDirection) => {
    if (newDirection.x !== 0 && direction.x === -newDirection.x) {
      return
    }

    if (newDirection.y !== 0 && direction.y === -newDirection.y) {
      return
    }

    setDirection(newDirection)
  }

  return (
    <div className="snake-game">
      <header className="snake-header">
        <button type="button" onClick={onExit}>
          ← BACK
        </button>

        <div className="snake-title">
          <span>GAMEHUB</span>
          <h1>SNAKE</h1>
        </div>

        <div className="snake-score">
          <span>SCORE</span>
          <strong>{score}</strong>
        </div>
      </header>

      <main className="snake-main">
        <div className="snake-board">
          <div className="snake-grid">
            {snake.map((segment, index) => (
              <div
                key={`${segment.x}-${segment.y}-${index}`}
                className={`snake-segment ${
                  index === 0 ? 'snake-head' : ''
                }`}
                style={{
                  left: `${segment.x * 5}%`,
                  top: `${segment.y * 5}%`
                }}
              />
            ))}

            <div
              className="snake-food"
              style={{
                left: `${food.x * 5}%`,
                top: `${food.y * 5}%`
              }}
            />
          </div>

          {gameOver && (
            <div className="game-over">
              <h2>GAME OVER</h2>

              <p>FINAL SCORE: {score}</p>

              <button type="button" onClick={restartGame}>
                PLAY AGAIN
              </button>
            </div>
          )}
        </div>

        <div className="snake-controls">
          <p>USE ARROW KEYS TO MOVE</p>

          <div className="control-buttons">
            <button
              type="button"
              onClick={() => changeDirection({ x: 0, y: -1 })}
            >
              ↑
            </button>

            <div>
              <button
                type="button"
                onClick={() => changeDirection({ x: -1, y: 0 })}
              >
                ←
              </button>

              <button
                type="button"
                onClick={() => changeDirection({ x: 0, y: 1 })}
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => changeDirection({ x: 1, y: 0 })}
              >
                →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
export default Snake