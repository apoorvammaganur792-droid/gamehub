import { useState } from 'react'
import './App.css'
import DarkShooter from './games/DarkShooter/DarkShooter'
import Snake from './games/Snake/Snake'
import Tetris from './games/Tetris/Tetris'
import Memory from './games/Memory/Memory'
function App() {
  const [activeGame, setActiveGame] = useState(null)

  if (activeGame === 'shooter') {
    return (
      <DarkShooter onExit={() => setActiveGame(null)} />
    )
  }

  if (activeGame === 'snake') {
    return (
      <Snake onExit={() => setActiveGame(null)} />
    )
  }
  if (activeGame === 'tetris') {
     return (
      <Tetris onExit={() => setActiveGame(null)} />
     )
  }
  if (activeGame === 'memory') {
    return (
       <Memory onExit={() => setActiveGame(null)} />
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          GAME<span>HUB</span>
        </div>

        <nav className="nav">
          <a href="#home">Home</a>
          <a href="#games">Games</a>
          <a href="#about">About</a>
        </nav>

        <button className="menu-button" type="button">
          ☰
        </button>
      </header>

      <main>
        <section className="hero-section" id="home">
          <div className="hero-content">
            <p className="hero-label">WELCOME TO GAMEHUB</p>

            <h1>
              PLAY.
              <br />
              <span>HAVE FUN.</span>
            </h1>

            <p className="hero-text">
              Discover fun browser games built for both desktop and mobile.
            </p>

            <a href="#games" className="play-button">
              EXPLORE GAMES
            </a>
          </div>
        </section>

        <section className="games-section" id="games">
          <div className="section-heading">
            <p>CHOOSE YOUR GAME</p>
            <h2>Featured Games</h2>
          </div>

          <div className="games-grid">

            {/* Snake */}
            <article className="game-card">
              <div className="game-icon">🐍</div>

              <div className="game-info">
                <span>ARCADE</span>

                <h3>Snake</h3>

                <p>
                  Classic snake game with mobile controls.
                </p>

                <button
                  type="button"
                  onClick={() => setActiveGame('snake')}
                >
                  PLAY NOW →
                </button>
              </div>
            </article>

            {/* Tetris */}
            <article className="game-card">
              <div className="game-icon">🧱</div>

              <div className="game-info">
                <span>PUZZLE</span>

                <h3>Tetris</h3>

                <p>
                  Arrange the blocks and beat your high score.
                </p>

                <button type="button" onClick={() => setActiveGame('tetris')}>
                  PLAY NOW →
                </button>
              </div>
            </article>

            {/* Dark Shooter */}
            <article className="game-card">
              <div className="game-icon">🔫</div>

              <div className="game-info">
                <span>ACTION</span>

                <h3>Dark Shooter</h3>

                <p>
                  Enter the darkness. Hunt your targets.
                </p>

                <button
                  type="button"
                  onClick={() => setActiveGame('shooter')}
                >
                  PLAY NOW →
                </button>
              </div>
            </article>

            {/* Memory */}
            <article className="game-card">
              <div className="game-icon">🧠</div>

              <div className="game-info">
                <span>PUZZLE</span>

                <h3>Memory</h3>

                <p>
                  Test your memory and find matching cards.
                </p>

                <button type="button" onClick = {() => setActiveGame('memory')}>
                  PLAY NOW →
                </button>
              </div>
            </article>

          </div>
        </section>
      </main>

      <footer id="about">
        <p>
          © 2026 GameHub · Built with React
        </p>
      </footer>
    </div>
  )
}
export default App