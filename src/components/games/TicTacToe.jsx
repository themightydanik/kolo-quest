import React, { useState, useEffect } from 'react'
import CatSprite from '../CatSprite'

const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
]

function checkWinner(squares) {
  for (const [a,b,c] of WIN_LINES) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a,b,c] }
    }
  }
  if (squares.every(Boolean)) return { winner: 'draw', line: [] }
  return null
}

function getBestMove(squares, player) {
  const opponent = player === 'X' ? 'O' : 'X'
  for (let i = 0; i < 9; i++) {
    if (!squares[i]) {
      const test = [...squares]; test[i] = player
      if (checkWinner(test)?.winner === player) return i
    }
  }
  for (let i = 0; i < 9; i++) {
    if (!squares[i]) {
      const test = [...squares]; test[i] = opponent
      if (checkWinner(test)?.winner === opponent) return i
    }
  }
  if (!squares[4]) return 4
  for (const c of [0,2,6,8]) { if (!squares[c]) return c }
  for (let i = 0; i < 9; i++) { if (!squares[i]) return i }
  return -1
}

export default function TicTacToe({ onWin, onClose }) {
  const [squares, setSquares] = useState(Array(9).fill(null))
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [result, setResult] = useState(null)
  const [thinking, setThinking] = useState(false)
  const [scores, setScores] = useState({ player: 0, ai: 0 })
  const [catState, setCatState] = useState('idle')

  // Cat reacts to game events
  useEffect(() => {
    if (result) {
      if (result.winner === 'X') setCatState('sad')       // player wins → cat sad
      else if (result.winner === 'O') setCatState('excited') // cat wins → cat excited
      else setCatState('happy')                              // draw → neutral happy
    } else if (thinking) {
      setCatState('idle')  // thinking — focused
    } else if (isPlayerTurn) {
      setCatState('idle')
    }
  }, [result, thinking, isPlayerTurn])

  // Cat reacts when player makes a move
  const handleClick = (idx) => {
    if (!isPlayerTurn || squares[idx] || result || thinking) return
    setCatState('hangry') // cat gets competitive when player moves
    const next = [...squares]; next[idx] = 'X'
    setSquares(next)
    const r = checkWinner(next)
    if (r) {
      setResult(r)
      if (r.winner === 'X') setScores(s => ({...s, player: s.player+1}))
    } else {
      setIsPlayerTurn(false)
    }
  }

  useEffect(() => {
    if (!isPlayerTurn && !result) {
      setThinking(true)
      const timer = setTimeout(() => {
        const move = getBestMove(squares, 'O')
        if (move >= 0) {
          const next = [...squares]; next[move] = 'O'
          setSquares(next)
          const r = checkWinner(next)
          if (r) {
            setResult(r)
            if (r.winner === 'O') setScores(s => ({...s, ai: s.ai+1}))
          } else {
            setIsPlayerTurn(true)
            setCatState('idle')
          }
        }
        setThinking(false)
      }, 700)
      return () => clearTimeout(timer)
    }
  }, [isPlayerTurn, squares, result])

  const reset = () => {
    setSquares(Array(9).fill(null))
    setIsPlayerTurn(true)
    setResult(null)
    setCatState('idle')
  }

  const handleClose = () => {
    if (scores.player > scores.ai) onWin(15)
    else onClose()
  }

  const getStatus = () => {
    if (result?.winner === 'X') return '🎉 Ти переміг!'
    if (result?.winner === 'O') return '😼 Котик переміг!'
    if (result?.winner === 'draw') return '🤝 Нічия!'
    if (thinking) return '🤔 Котик думає...'
    return isPlayerTurn ? '✏️ Твій хід (X)' : '⏳ Хід котика (O)'
  }

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-start bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900"
      style={{ zIndex: 70 }}
    >
      {/* Header */}
      <div className="w-full flex items-center justify-between px-4 py-3 bg-black/20">
        <button onClick={handleClose}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 text-white text-xl active:scale-90">
          ←
        </button>
        <div className="text-white font-black text-lg">❌⭕ Хрестики-нулики</div>
        <div className="flex gap-2">
          <div className="bg-blue-500/40 rounded-xl px-2 py-1 text-white text-xs font-black">Ти: {scores.player}</div>
          <div className="bg-pink-500/40 rounded-xl px-2 py-1 text-white text-xs font-black">🐱: {scores.ai}</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-5 px-4 pb-4">

        {/* Cat sprite — reacts to game state */}
        <div className="relative">
          <CatSprite
            state={catState}
            size={110}
          />
          {/* Speech bubble */}
          {thinking && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white rounded-2xl px-3 py-1 text-xs font-black text-purple-700 shadow whitespace-nowrap">
              Хмм... 🤔
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0"
                style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid white' }} />
            </div>
          )}
          {result?.winner === 'O' && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-yellow-400 rounded-2xl px-3 py-1 text-xs font-black text-yellow-900 shadow whitespace-nowrap">
              Я переміг! 😼
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0"
                style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #facc15' }} />
            </div>
          )}
          {result?.winner === 'X' && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white rounded-2xl px-3 py-1 text-xs font-black text-purple-700 shadow whitespace-nowrap">
              Молодець... 😿
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0"
                style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid white' }} />
            </div>
          )}
        </div>

        {/* Status */}
        <div className="text-white font-black text-lg text-center">{getStatus()}</div>

        {/* Board */}
        <div className="grid grid-cols-3 gap-3">
          {squares.map((sq, i) => {
            const isWinCell = result?.line?.includes(i)
            return (
              <button
                key={i}
                onClick={() => handleClick(i)}
                className={`w-22 h-22 rounded-2xl text-4xl font-black flex items-center justify-center
                  transition-all active:scale-90
                  ${isWinCell
                    ? 'bg-yellow-400 scale-105 shadow-lg shadow-yellow-400/40'
                    : sq
                      ? 'bg-white/20'
                      : 'bg-white/10 active:bg-white/25'
                  }`}
                style={{ width: 82, height: 82 }}
              >
                {sq === 'X' && <span className="text-blue-300" style={{ fontSize: 36 }}>✕</span>}
                {sq === 'O' && <span className="text-pink-300" style={{ fontSize: 36 }}>○</span>}
              </button>
            )
          })}
        </div>

        {/* Result actions */}
        {result && (
          <div className="flex flex-col items-center gap-3 w-full max-w-xs mt-2">
            {result.winner === 'X' && (
              <div className="bg-yellow-400/20 border border-yellow-400/50 rounded-2xl px-6 py-2 text-center">
                <div className="text-yellow-300 font-black">+15 😸 котик радіє за тебе!</div>
              </div>
            )}
            <button onClick={reset}
              className="w-full bg-white/20 text-white font-black py-3 rounded-2xl active:scale-95">
              Грати ще раз
            </button>
            <button onClick={handleClose}
              className="w-full bg-violet-500 text-white font-black py-3 rounded-2xl active:scale-95">
              {scores.player > scores.ai ? 'Отримати нагороду 🎉' : 'Повернутись'}
            </button>
          </div>
        )}

        {!result && (
          <div className="text-white/40 text-xs text-center">
            Переможи котика і він стане щасливішим!
          </div>
        )}
      </div>
    </div>
  )
}
