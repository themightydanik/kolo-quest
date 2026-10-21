import React, { useState, useCallback, useEffect } from 'react'

// ── Board helpers ─────────────────────────────────────────────────────────────
// 8×8 board, pieces: 'r' red (player), 'b' blue (AI), 'rk'/'bk' kings
// Cells: null or piece string
function initBoard() {
  const board = Array(64).fill(null)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) board[row*8+col] = 'b'
    }
  }
  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) board[row*8+col] = 'r'
    }
  }
  return board
}

function pos(row, col) { return row*8+col }
function row(i) { return Math.floor(i/8) }
function col(i) { return i % 8 }

function getMoves(board, idx, jumpsOnly = false) {
  const piece = board[idx]
  if (!piece) return []
  const isRed = piece.startsWith('r')
  const isKing = piece.endsWith('k')
  const directions = []
  if (isRed || isKing) directions.push(-1) // move up
  if (!isRed || isKing) directions.push(1)  // move down
  const moves = []
  for (const dr of directions) {
    for (const dc of [-1, 1]) {
      const nr = row(idx)+dr, nc = col(idx)+dc
      if (nr < 0||nr > 7||nc < 0||nc > 7) continue
      const nIdx = pos(nr, nc)
      if (!jumpsOnly && !board[nIdx]) {
        moves.push({ from: idx, to: nIdx, captured: null })
      }
      // jump
      const er = nr+dr, ec = nc+dc
      if (er < 0||er > 7||ec < 0||ec > 7) continue
      const eIdx = pos(er, ec)
      const target = board[nIdx]
      if (target && target.startsWith(isRed ? 'b' : 'r') && !board[eIdx]) {
        moves.push({ from: idx, to: eIdx, captured: nIdx })
      }
    }
  }
  return moves
}

function getAllMoves(board, isRed) {
  const prefix = isRed ? 'r' : 'b'
  const pieces = board.reduce((acc, p, i) => p?.startsWith(prefix) ? [...acc, i] : acc, [])
  const jumps = pieces.flatMap(i => getMoves(board, i, true))
  if (jumps.length) return jumps
  return pieces.flatMap(i => getMoves(board, i, false))
}

function applyMove(board, move) {
  const next = [...board]
  const piece = next[move.from]
  next[move.to] = piece
  next[move.from] = null
  if (move.captured !== null) next[move.captured] = null
  // king promotion
  if (piece === 'r' && row(move.to) === 0) next[move.to] = 'rk'
  if (piece === 'b' && row(move.to) === 7) next[move.to] = 'bk'
  return next
}

// Simple AI: prefer jumps, prefer kings, random among best
function aiMove(board) {
  const moves = getAllMoves(board, false)
  if (!moves.length) return null
  // score: captures are +10, king promotion +5
  const scored = moves.map(m => {
    let s = 0
    if (m.captured !== null) s += 10
    const b = applyMove(board, m)
    if (b[m.to] === 'bk') s += 5
    return { m, s }
  })
  scored.sort((a,b) => b.s - a.s)
  const best = scored[0].s
  const top = scored.filter(x => x.s === best)
  return top[Math.floor(Math.random()*top.length)].m
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Checkers({ onWin, onClose }) {
  const [board, setBoard] = useState(() => initBoard())
  const [selected, setSelected] = useState(null)
  const [validMoves, setValidMoves] = useState([])
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [thinking, setThinking] = useState(false)
  const [gameOver, setGameOver] = useState(null) // 'player'|'ai'|'draw'
  const [scores, setScores] = useState({ player: 0, ai: 0 })
  const [lastMove, setLastMove] = useState(null)

  const playerMoves = getAllMoves(board, true)
  const aiMoves = getAllMoves(board, false)

  // Check game over
  useEffect(() => {
    const rCount = board.filter(p => p?.startsWith('r')).length
    const bCount = board.filter(p => p?.startsWith('b')).length
    if (rCount === 0 || (!isPlayerTurn && aiMoves.length === 0)) {
      setGameOver('ai'); setScores(s => ({...s, ai: s.ai+1}))
    } else if (bCount === 0 || (isPlayerTurn && playerMoves.length === 0)) {
      setGameOver('player'); setScores(s => ({...s, player: s.player+1}))
    }
  }, [board, isPlayerTurn])

  // AI turn
  useEffect(() => {
    if (!isPlayerTurn && !gameOver) {
      setThinking(true)
      const t = setTimeout(() => {
        const move = aiMove(board)
        if (move) {
          setBoard(applyMove(board, move))
          setLastMove(move)
          // check multi-jump
          const afterBoard = applyMove(board, move)
          if (move.captured !== null) {
            const more = getMoves(afterBoard, move.to, true)
            if (more.length > 0) {
              // AI continues jumping (simplified: take first)
              setBoard(applyMove(afterBoard, more[0]))
              setLastMove(more[0])
            }
          }
        }
        setIsPlayerTurn(true)
        setThinking(false)
      }, 800)
      return () => clearTimeout(t)
    }
  }, [isPlayerTurn, gameOver])

  const handleCellClick = (idx) => {
    if (!isPlayerTurn || gameOver || thinking) return
    const piece = board[idx]
    // Select own piece
    if (piece?.startsWith('r')) {
      setSelected(idx)
      const moves = getMoves(board, idx)
      // If jumps available globally, only show jumps
      const hasJumps = playerMoves.some(m => m.captured !== null)
      setValidMoves(hasJumps ? moves.filter(m => m.captured !== null) : moves)
      return
    }
    // Move to valid destination
    if (selected !== null) {
      const move = validMoves.find(m => m.to === idx)
      if (move) {
        const next = applyMove(board, move)
        setBoard(next)
        setLastMove(move)
        // Multi-jump
        if (move.captured !== null) {
          const more = getMoves(next, move.to, true)
          if (more.length > 0) {
            setSelected(move.to)
            setValidMoves(more)
            return
          }
        }
        setSelected(null); setValidMoves([])
        setIsPlayerTurn(false)
        return
      }
      // Deselect
      setSelected(null); setValidMoves([])
    }
  }

  const reset = () => {
    setBoard(initBoard())
    setSelected(null); setValidMoves([])
    setIsPlayerTurn(true)
    setGameOver(null)
    setLastMove(null)
  }

  const handleClose = () => {
    if (gameOver === 'player') onWin(20)
    else onClose()
  }

  const getStatus = () => {
    if (gameOver === 'player') return '🎉 Ти переміг!'
    if (gameOver === 'ai') return '😿 Котик переміг'
    if (thinking) return '🤔 Котик думає...'
    return isPlayerTurn ? '🔴 Твій хід' : '🔵 Хід котика'
  }

  const CELL_SIZE = 44
  const BOARD_SIZE = 8

  return (
    <div className="fixed inset-0 z-70 flex flex-col bg-gradient-to-b from-emerald-900 via-teal-900 to-cyan-900"
         style={{ fontFamily: "'Nunito', sans-serif" }}>

      {/* Header */}
      <div className="w-full flex items-center justify-between px-4 py-3 bg-black/20">
        <button onClick={handleClose}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 text-white text-lg active:scale-90">
          ←
        </button>
        <div className="text-white font-black text-lg">♟️ Шашки</div>
        <div className="flex gap-2">
          <div className="bg-red-500/40 rounded-xl px-2 py-1 text-white text-xs font-black">Ти: {scores.player}</div>
          <div className="bg-blue-500/40 rounded-xl px-2 py-1 text-white text-xs font-black">🐱: {scores.ai}</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
        {/* Status */}
        <div className="text-white font-black text-xl text-center">{getStatus()}</div>

        {/* Piece counts */}
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-1.5">
            <div className="w-5 h-5 rounded-full bg-red-400 shadow"/>
            <span className="text-white text-xs font-bold">{board.filter(p=>p?.startsWith('r')).length}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-1.5">
            <div className="w-5 h-5 rounded-full bg-blue-400 shadow"/>
            <span className="text-white text-xs font-bold">{board.filter(p=>p?.startsWith('b')).length}</span>
          </div>
        </div>

        {/* Board */}
        <div className="rounded-2xl overflow-hidden border-4 border-yellow-800/60 shadow-2xl">
          {Array.from({length: BOARD_SIZE}, (_, r) => (
            <div key={r} className="flex">
              {Array.from({length: BOARD_SIZE}, (_, c) => {
                const idx = pos(r,c)
                const isDark = (r+c) % 2 === 1
                const piece = board[idx]
                const isSel = selected === idx
                const isValid = validMoves.some(m => m.to === idx)
                const isLast = lastMove?.from === idx || lastMove?.to === idx

                return (
                  <div
                    key={c}
                    onClick={() => handleCellClick(idx)}
                    style={{ width: CELL_SIZE, height: CELL_SIZE }}
                    className={`flex items-center justify-center relative transition-all
                      ${isDark
                        ? (isLast ? 'bg-yellow-700/80' : 'bg-amber-900')
                        : 'bg-amber-100'
                      }
                      ${isValid && isDark ? 'cursor-pointer' : ''}`}>

                    {/* Valid move indicator */}
                    {isValid && isDark && !piece && (
                      <div className="w-4 h-4 rounded-full bg-yellow-400/60 border-2 border-yellow-400"/>
                    )}
                    {isValid && isDark && piece && (
                      <div className="absolute inset-0 border-2 border-yellow-400 rounded"/>
                    )}

                    {/* Piece */}
                    {piece && (
                      <div
                        className={`rounded-full flex items-center justify-center font-black text-white text-xs
                          transition-all
                          ${piece.startsWith('r')
                            ? 'bg-gradient-to-b from-red-400 to-red-600 shadow-md shadow-red-800'
                            : 'bg-gradient-to-b from-blue-400 to-blue-600 shadow-md shadow-blue-800'
                          }
                          ${isSel ? 'ring-2 ring-yellow-300 ring-offset-1 scale-110' : ''}
                          ${piece.endsWith('k') ? 'border-2 border-yellow-400' : ''}`}
                        style={{ width: CELL_SIZE-10, height: CELL_SIZE-10 }}>
                        {piece.endsWith('k') ? '♛' : ''}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Result actions */}
        {gameOver ? (
          <div className="flex flex-col items-center gap-3 w-full max-w-xs mt-2">
            {gameOver === 'player' && (
              <div className="bg-yellow-400/20 border border-yellow-400/50 rounded-2xl px-6 py-3 text-center">
                <div className="text-yellow-300 font-black text-lg">+20 😸 радість котику!</div>
              </div>
            )}
            <button onClick={reset}
              className="w-full bg-white/20 text-white font-black py-3 rounded-2xl active:scale-95">
              Грати ще раз
            </button>
            <button onClick={handleClose}
              className="w-full bg-emerald-500 text-white font-black py-3 rounded-2xl active:scale-95">
              {gameOver === 'player' ? 'Отримати нагороду 🎉' : 'Повернутись'}
            </button>
          </div>
        ) : (
          <div className="text-white/40 text-xs text-center">
            Натисни на свою фішку (🔴), потім на клітинку куди рухатись
          </div>
        )}
      </div>
    </div>
  )
}
