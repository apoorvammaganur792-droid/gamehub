import { useCallback, useEffect, useRef, useState } from 'react'
import './DarkShooter.css'

const HIT_POINTS = 100
const ENEMY_MAX_HEALTH = 100
const DAMAGE_PER_HIT = 25

const ROUND_CONFIG = {
  1: {
    bullets: 12,
    targetScore: 800,
    movementSpeed: 850,
  },
  2: {
    bullets: 8,
    targetScore: 600,
    movementSpeed: 500,
  },
}

function DarkShooter({ onExit }) {
  const gameRef = useRef(null)
  const barrelRef = useRef(null)
  const enemyRef = useRef(null)

  const enemyTimerRef = useRef(null)
  const messageTimerRef = useRef(null)
  const muzzleTimerRef = useRef(null)
  const recoilTimerRef = useRef(null)
  const bulletTimerRef = useRef(null)
  const enemyHitTimerRef = useRef(null)

  const [aim, setAim] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  })

  const [weaponAngle, setWeaponAngle] = useState(0)
  const [round, setRound] = useState(1)
  const [ammo, setAmmo] = useState(ROUND_CONFIG[1].bullets)
  const [score, setScore] = useState(0)
  const [enemyHealth, setEnemyHealth] = useState(ENEMY_MAX_HEALTH)

  const [enemyPosition, setEnemyPosition] = useState({
    x: 50,
    y: 48,
  })

  const [enemySpeed, setEnemySpeed] = useState(1)
  const [muzzleFlash, setMuzzleFlash] = useState(false)
  const [recoil, setRecoil] = useState(false)
  const [bullet, setBullet] = useState(null)
  const [enemyHit, setEnemyHit] = useState(false)

  const [gameMessage, setGameMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  const [missionStatus, setMissionStatus] = useState('ready')

  const currentConfig = ROUND_CONFIG[round]

  // Aim with mouse
  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!gameRef.current) return

      const rect = gameRef.current.getBoundingClientRect()

      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      setAim({ x, y })

      const pivotX = rect.width / 2
      const pivotY = rect.height - 65

      const dx = x - pivotX
      const dy = y - pivotY

      let angle = Math.atan2(dx, -dy) * (180 / Math.PI)

      angle = Math.max(-75, Math.min(75, angle))

      setWeaponAngle(angle)
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  // Show temporary message
  const showMessage = useCallback((message, type) => {
    clearTimeout(messageTimerRef.current)

    setGameMessage(message)
    setMessageType(type)

    messageTimerRef.current = setTimeout(() => {
      setGameMessage('')
      setMessageType('')
    }, 700)
  }, [])

  // Move enemy
  const moveEnemy = useCallback(() => {
    if (!gameRef.current) return

    const minX = 25
    const maxX = 75
    const minY = 32
    const maxY = 65

    setEnemyPosition({
      x: minX + Math.random() * (maxX - minX),
      y: minY + Math.random() * (maxY - minY),
    })
  }, [])

  // Start enemy movement
  useEffect(() => {
    clearInterval(enemyTimerRef.current)

    if (missionStatus !== 'playing') {
      return
    }

    const movementSpeed = Math.max(
      currentConfig.movementSpeed - enemySpeed * 45,
      round === 2 ? 220 : 350
    )

    enemyTimerRef.current = setInterval(() => {
      moveEnemy()
    }, movementSpeed)

    return () => {
      clearInterval(enemyTimerRef.current)
    }
  }, [
    round,
    enemySpeed,
    missionStatus,
    currentConfig.movementSpeed,
    moveEnemy,
  ])

  // Check if crosshair is inside enemy
  const isEnemyHit = () => {
    if (!gameRef.current || !enemyRef.current) {
      return false
    }

    const gameRect = gameRef.current.getBoundingClientRect()
    const enemyRect = enemyRef.current.getBoundingClientRect()

    const enemyLeft = enemyRect.left - gameRect.left
    const enemyRight = enemyRect.right - gameRect.left
    const enemyTop = enemyRect.top - gameRect.top
    const enemyBottom = enemyRect.bottom - gameRect.top

    return (
      aim.x >= enemyLeft &&
      aim.x <= enemyRight &&
      aim.y >= enemyTop &&
      aim.y <= enemyBottom
    )
  }

  // Start a round
  const startRound = useCallback((roundNumber) => {
    const config = ROUND_CONFIG[roundNumber]

    clearInterval(enemyTimerRef.current)
    clearTimeout(messageTimerRef.current)

    setRound(roundNumber)
    setAmmo(config.bullets)
    setScore(0)
    setEnemyHealth(ENEMY_MAX_HEALTH)
    setEnemySpeed(roundNumber === 2 ? 2 : 1)
    setEnemyPosition({ x: 50, y: 48 })
    setEnemyHit(false)
    setBullet(null)
    setMuzzleFlash(false)
    setRecoil(false)
    setGameMessage('')
    setMessageType('')
    setMissionStatus('playing')

    setTimeout(() => {
      moveEnemy()
    }, 150)
  }, [moveEnemy])

  // Fire weapon
  const fire = useCallback(() => {
    if (missionStatus !== 'playing') return

    if (ammo <= 0) {
      showMessage('NO BULLETS LEFT', 'failed')
      return
    }

    if (!gameRef.current || !barrelRef.current) {
      return
    }

    const gameRect = gameRef.current.getBoundingClientRect()
    const barrelRect = barrelRef.current.getBoundingClientRect()

    const startX =
      barrelRect.left +
      barrelRect.width / 2 -
      gameRect.left

    const startY =
      barrelRect.top +
      barrelRect.height / 2 -
      gameRect.top

    const targetX = aim.x
    const targetY = aim.y
    const remainingBullets = ammo - 1

    setAmmo(remainingBullets)

    setMuzzleFlash(true)
    setRecoil(true)

    clearTimeout(muzzleTimerRef.current)
    clearTimeout(recoilTimerRef.current)

    muzzleTimerRef.current = setTimeout(() => {
      setMuzzleFlash(false)
    }, 100)

    recoilTimerRef.current = setTimeout(() => {
      setRecoil(false)
    }, 100)

    setBullet({
      startX,
      startY,
      targetX,
      targetY,
    })

    clearTimeout(bulletTimerRef.current)

    bulletTimerRef.current = setTimeout(() => {
      setBullet(null)
    }, 180)

    const hit = isEnemyHit()

    if (hit) {
      const newScore = score + HIT_POINTS

      const newHealth = Math.max(
        0,
        enemyHealth - DAMAGE_PER_HIT
      )

      setScore(newScore)
      setEnemyHealth(newHealth)
      setEnemyHit(true)

      clearTimeout(enemyHitTimerRef.current)

      enemyHitTimerRef.current = setTimeout(() => {
        setEnemyHit(false)
      }, 180)

      showMessage(`+${HIT_POINTS} HIT!`, 'hit')

      setEnemySpeed((current) =>
        Math.min(current + 1, round === 2 ? 7 : 5)
      )

      if (newScore >= currentConfig.targetScore) {
        clearInterval(enemyTimerRef.current)

        if (round === 1) {
          setMissionStatus('roundComplete')
          showMessage('ROUND 1 COMPLETE', 'success')
        } else {
          setMissionStatus('success')
          showMessage('ROUND 2 COMPLETE', 'success')
        }

        return
      }

      if (newHealth <= 0) {
        setEnemyHealth(ENEMY_MAX_HEALTH)

        setTimeout(() => {
          moveEnemy()
        }, 120)
      }

      if (remainingBullets <= 0) {
        clearInterval(enemyTimerRef.current)
        setMissionStatus('failed')
        showMessage('ROUND FAILED', 'failed')
      }

      return
    }

    showMessage('MISSED!', 'miss')

    if (remainingBullets <= 0) {
      clearInterval(enemyTimerRef.current)
      setMissionStatus('failed')
      showMessage('ROUND FAILED', 'failed')
    }
  }, [
    aim,
    ammo,
    currentConfig.targetScore,
    enemyHealth,
    missionStatus,
    moveEnemy,
    round,
    score,
    showMessage,
  ])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === 'Space') {
        event.preventDefault()
        fire()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [fire])

  // Mouse fire
  useEffect(() => {
    const handleMouseDown = (event) => {
      if (event.button === 0) {
        fire()
      }
    }

    window.addEventListener('mousedown', handleMouseDown)

    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
    }
  }, [fire])

  // Bullet style
  const getBulletStyle = () => {
    if (!bullet) return {}

    const dx = bullet.targetX - bullet.startX
    const dy = bullet.targetY - bullet.startY

    const distance = Math.sqrt(
      dx * dx + dy * dy
    )

    const angle =
      Math.atan2(dy, dx) * (180 / Math.PI)

    return {
      left: `${bullet.startX}px`,
      top: `${bullet.startY}px`,
      width: `${distance}px`,
      transform: `rotate(${angle}deg)`,
    }
  }

  // Restart current round
  const restartGame = () => {
    startRound(round)
  }

  // Go to next round
  const nextRound = () => {
    startRound(2)
  }

  // Continue after final round
  const continueGame = () => {
    startRound(1)
  }

  // Cleanup
  useEffect(() => {
    return () => {
      clearInterval(enemyTimerRef.current)
      clearTimeout(messageTimerRef.current)
      clearTimeout(muzzleTimerRef.current)
      clearTimeout(recoilTimerRef.current)
      clearTimeout(bulletTimerRef.current)
      clearTimeout(enemyHitTimerRef.current)
    }
  }, [])

  return (
    <div
      className={`dark-shooter ${
        missionStatus !== 'playing'
          ? 'mission-ended'
          : ''
      }`}
      ref={gameRef}
    >
      <div className="fog fog-one"></div>
      <div className="fog fog-two"></div>

      {/* HUD */}
      <div className="game-hud">
        <div className="hud-left">
          <div className="game-logo">
            GAME<span>HUB</span>
          </div>

          <div className="mission">
            ROUND {round}
          </div>
        </div>

        <div className="hud-right">
          <div className="score">
            <span>SCORE</span>
            <strong>{score}</strong>
          </div>

          <div className="ammo">
            <span>BULLETS</span>

            <strong>
              {ammo}
              <small>
                / {currentConfig.bullets}
              </small>
            </strong>
          </div>
        </div>
      </div>

      {/* Mission information */}
      <div className="mission-title">
        <span>OBJECTIVE</span>

        <h1>
          ELIMINATE
          <br />
          THE TARGET
        </h1>

        <p>AIM AT THE MOVING TARGET</p>

        <div className="mission-goal">
          GOAL
          <strong>{currentConfig.targetScore}</strong>

          {missionStatus === 'playing' && (
            <button
              className="game-exit-button"
              onClick={onExit}
            >
              EXIT
            </button>
          )}
        </div>
      </div>

      {/* Start game screen */}
      {missionStatus === 'ready' && (
        <div className="defeated-screen start-screen">
          <div className="defeated-text success">
            DARK SHOOTER
          </div>

          <div className="defeated-score">
            ROUND 1
          </div>

          <div className="failed-info">
            ELIMINATE THE TARGET
          </div>

          <button
            className="restart-button"
            onClick={() => startRound(1)}
          >
            START GAME
          </button>
        </div>
      )}

      {/* Enemy health */}
      {missionStatus === 'playing' && (
        <div className="enemy-health-container">
          <div className="enemy-name">
            UNKNOWN ENTITY
          </div>

          <div className="health-bar">
            <div
              className="health-fill"
              style={{
                width: `${enemyHealth}%`,
              }}
            />
          </div>

          <div className="health-text">
            {enemyHealth}%
          </div>
        </div>
      )}

      {/* Anime enemy */}
      {missionStatus === 'playing' && (
        <div
          ref={enemyRef}
          className={`dark-enemy ${
            enemyHit ? 'enemy-hit' : ''
          }`}
          style={{
            left: `${enemyPosition.x}%`,
            top: `${enemyPosition.y}%`,
          }}
        >
          <div className="enemy-pop-shadow"></div>
          <div className="enemy-aura"></div>

          <div className="enemy-character">
            <div className="enemy-back-hair"></div>

            <div className="enemy-head">
              <div className="enemy-hair">
                <span></span>
                <span></span>
                <span></span>
              </div>

              <div className="enemy-face">
                <div className="enemy-brow enemy-brow-left"></div>
                <div className="enemy-brow enemy-brow-right"></div>

                <div className="eye eye-left">
                  <span></span>
                </div>

                <div className="eye eye-right">
                  <span></span>
                </div>

                <div className="enemy-nose"></div>

                <div className="enemy-mask">
                  <span></span>
                </div>
              </div>
            </div>

            <div className="enemy-neck"></div>

            <div className="enemy-body">
              <div className="enemy-shoulder left"></div>
              <div className="enemy-shoulder right"></div>

              <div className="enemy-coat">
                <div className="coat-collar left"></div>
                <div className="coat-collar right"></div>

                <div className="coat-line"></div>

                <div className="coat-symbol">
                  ◆
                </div>
              </div>

              <div className="enemy-arm enemy-arm-left"></div>
              <div className="enemy-arm enemy-arm-right"></div>
            </div>
          </div>

          <div className="enemy-ground-glow"></div>
        </div>
      )}

      {/* Hit / miss message */}
      {gameMessage && (
        <div
          className={`game-message ${messageType}`}
        >
          {gameMessage}
        </div>
      )}

      {/* Round screens */}
      {missionStatus !== 'playing' &&
        missionStatus !== 'ready' && (
          <div className="defeated-screen">
            {missionStatus === 'roundComplete' ? (
              <>
                <div className="defeated-text success">
                  ROUND 1 COMPLETE
                </div>

                <div className="defeated-score">
                  SCORE {score}
                </div>

                <div className="failed-info">
                  TARGET ELIMINATED
                </div>

                <div className="final-buttons">
                  <button
                    className="restart-button"
                    onClick={nextRound}
                  >
                    CONTINUE
                  </button>

                  <button
                    className="exit-button"
                    onClick={onExit}
                  >
                    EXIT
                  </button>
                </div>
              </>
            ) : missionStatus === 'success' ? (
              <>
                <div className="defeated-text success">
                  ROUND 2 COMPLETE
                </div>

                <div className="defeated-score">
                  SCORE {score}
                </div>

                <div className="failed-info">
                  MISSION ACCOMPLISHED
                </div>

                <div className="final-buttons">
                  <button
                    className="restart-button"
                    onClick={continueGame}
                  >
                    CONTINUE
                  </button>

                  <button
                    className="exit-button"
                    onClick={onExit}
                  >
                    EXIT
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="defeated-text failed">
                  ROUND {round} FAILED
                </div>

                <div className="defeated-score">
                  SCORE {score}
                </div>

                <div className="failed-info">
                  NOT ENOUGH HITS
                </div>

                <button
                  className="restart-button"
                  onClick={restartGame}
                >
                  RETRY ROUND
                </button>
              </>
            )}
          </div>
        )}

      {/* Bullet */}
      {bullet && (
        <div
          className="bullet"
          style={getBulletStyle()}
        />
      )}

      {/* Crosshair */}
      <div
        className="crosshair"
        style={{
          left: `${aim.x}px`,
          top: `${aim.y}px`,
        }}
      >
        <div className="crosshair-circle"></div>
        <div className="crosshair-horizontal"></div>
        <div className="crosshair-vertical"></div>
        <div className="crosshair-dot"></div>
      </div>

      {/* Weapon */}
      <div
        className={`weapon ${
          recoil ? 'weapon-recoil' : ''
        }`}
        style={{
          '--weapon-angle': `${weaponAngle}deg`,
        }}
      >
        <div className="gun">
          <div
            className="gun-barrel"
            ref={barrelRef}
          >
            <div className="barrel-inner"></div>
          </div>

          <div className="gun-body">
            <div className="gun-detail"></div>
            <div className="gun-light"></div>
          </div>

          <div className="gun-grip">
            <div className="grip-line"></div>
            <div className="grip-line"></div>
            <div className="grip-line"></div>
          </div>

          <div className="gun-trigger"></div>

          {muzzleFlash && (
            <div className="muzzle-flash">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="controls">
        <span>
          <b>LEFT CLICK</b> FIRE
        </span>

        <span>
          <b>SPACE</b> FIRE
        </span>

        <span>
          <b>{currentConfig.bullets} BULLETS</b> ONLY
        </span>
      </div>

      <div className="vignette"></div>
    </div>
  )
}

export default DarkShooter