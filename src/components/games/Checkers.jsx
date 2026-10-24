import React, { useState, useCallback, useEffect } from 'react'
import CatSprite from '../CatSprite'

// ── Board helpers ─────────────────────────────────────────────────────────────
function initBoard() {
  const board = Array(64).fill(null)
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 8; c++)
      if ((r+c) % 2 === 1) board[r*8+c] = 'b'
  for (let r = 5; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if ((r+c) % 2 === 1) board[r*8+c] = 'r'
  return board
}

const bpos = (r,c) => r*8+c
const brow = i => Math.floor(i/8)
const bcol = i => i % 8

function getMoves(board, idx, jumpsOnly = false) {
  const piece = board[idx]
  if (!piece) return []
  const isRed = piece.startsWith('r')
  const isKing = piece.endsWith('k')
  const directions = []
  if (isRed || isKing) directions.push(-1)
  if (!isRed || isKing) directions.push(1)
  const moves = []
  for (const dr of directions) {
    for (const dc of [-1, 1]) {
      const nr = brow(idx)+dr, nc = bcol(idx)+dc
      if (nr<0||nr>7||nc<0||nc>7) continue
      const nIdx = bpos(nr,nc)
      if (!jumpsOnly && !board[nIdx]) moves.push({ from:idx, to:nIdx, captured:null })
      const er = nr+dr, ec = nc+dc
      if (er<0||er>7||ec<0||ec>7) continue
      const eIdx = bpos(er,ec)
      const target = board[nIdx]
      if (target && target.startsWith(isRed?'b':'r') && !board[eIdx])
        moves.push({ from:idx, to:eIdx, captured:nIdx })
    }
  }
  return moves
}

function getAllMoves(board, isRed) {
  const prefix = isRed ? 'r' : 'b'
  const pieces = board.reduce((acc,p,i) => p?.startsWith(prefix) ? [...acc,i] : acc, [])
  const jumps = pieces.flatMap(i => getMoves(board,i,true))
  if (jumps.length) return jumps
  return pieces.flatMap(i => getMoves(board,i,false))
}

function applyMove(board, move) {
  const next = [...board]
  const piece = next[move.from]
  next[move.to] = piece; next[move.from] = null
  if (move.captured !== null) next[move.captured] = null
  if (piece==='r' && brow(move.to)===0) next[move.to] = 'rk'
  if (piece==='b' && brow(move.to)===7) next[move.to] = 'bk'
  return next
}

function aiMove(board) {
  const moves = getAllMoves(board, false)
  if (!moves.length) return null
  const scored = moves.map(m => {
    let s = 0
    if (m.captured !== null) s += 10
    const b = applyMove(board, m)
    if (b[m.to]==='bk') s += 5
    return { m, s }
  })
  scored.sort((a,b) => b.s-a.s)
  const best = scored[0].s
  const top = scored.filter(x => x.s===best)
  return top[Math.floor(Math.random()*top.length)].m
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Checkers({ onWin, onClose }) {
  const [board, setBoard] = useState(() => initBoard())
  const [selected, setSelected] = useState(null)
  const [validMoves, setValidMoves] = useState([])
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [thinking, setThinking] = useState(false)
  const [gameOver, setGameOver] = useState(null)
  const [scores, setScores] = useState({ player: 0, ai: 0 })
  const [lastMove, setLastMove] = useState(null)
  const [catState, setCatState] = useState('idle')

  const playerMoves = getAllMoves(board, true)
  const aiMoves = getAllMoves(board, false)

  // Cat reactions
  useEffect(() => {
    if (gameOver === 'player') setCatState('sad')
    else if (gameOver === 'ai') setCatState('excited')
    else if (thinking) setCatState('hangry')  // focused/intense
    else if (isPlayerTurn) setCatState('idle')
  }, [gameOver, thinking, isPlayerTurn])

  // Check game over
  useEffect(() => {
    const rCount = board.filter(p => p?.startsWith('r')).length
    const bCount = board.filter(p => p?.startsWith('b')).length
    if (!gameOver) {
      if (rCount === 0 || (!isPlayerTurn && aiMoves.length === 0)) {
        setGameOver('ai'); setScores(s => ({...s, ai: s.ai+1}))
      } else if (bCount === 0 || (isPlayerTurn && playerMoves.length === 0)) {
        setGameOver('player'); setScores(s => ({...s, player: s.player+1}))
      }
    }
  }, [board, isPlayerTurn])

  // AI turn
  useEffect(() => {
    if (!isPlayerTurn && !gameOver) {
      setThinking(true)
      const t = setTimeout(() => {
        const move = aiMove(board)
        if (move) {
          const afterBoard = applyMove(board, move)
          setBoard(afterBoard)
          setLastMove(move)
          if (move.captured !== null) {
            const more = getMoves(afterBoard, move.to, true)
            if (more.length > 0) {
              const afterBoard2 = applyMove(afterBoard, more[0])
              setBoard(afterBoard2)
              setLastMove(more[0])
            }
          }
        }
        setIsPlayerTurn(true)
        setThinking(false)
        setCatState('idle')
      }, 900)
      return () => clearTimeout(t)
    }
  }, [isPlayerTurn, gameOver])

  const handleCellClick = (idx) => {
    if (!isPlayerTurn || gameOver || thinking) return
    const piece = board[idx]
    if (piece?.startsWith('r')) {
      setSelected(idx)
      const moves = getMoves(board, idx)
      const hasJumps = playerMoves.some(m => m.captured !== null)
      setValidMoves(hasJumps ? moves.filter(m => m.captured !== null) : moves)
      return
    }
    if (selected !== null) {
      const move = validMoves.find(m => m.to === idx)
      if (move) {
        const next = applyMove(board, move)
        setBoard(next)
        setLastMove(move)
        // react when player captures
        if (move.captured !== null) setCatState('sad')
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
      setSelected(null); setValidMoves([])
    }
  }

  const reset = () => {
    setBoard(initBoard())
    setSelected(null); setValidMoves([])
    setIsPlayerTurn(true)
    setGameOver(null)
    setLastMove(null)
    setCatState('idle')
  }

  const handleClose = () => {
    if (gameOver === 'player') onWin(20)
    else onClose()
  }

  const getStatus = () => {
    if (gameOver === 'player') return '🎉 Ти переміг!'
    if (gameOver === 'ai') return '😼 Котик переміг!'
    if (thinking) return '🤔 Котик думає...'
    return isPlayerTurn ? '🔴 Твій хід' : '🔵 Хід котика'
  }

  const CELL_SIZE = 42
  const rCount = board.filter(p => p?.startsWith('r')).length
  const bCount = board.filter(p => p?.startsWith('b')).length

  return (
    <div
      className="fixed inset-0 flex flex-col bg-gradient-to-b from-emerald-900 via-teal-900 to-cyan-900"
      style={{ zIndex: 70 }}
    >
      {/* Header */}
      <div className="w-full flex items-center justify-between px-4 py-3 bg-black/20">
        <button onClick={handleClose}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 text-white text-xl active:scale-90">
          ←
        </button>
        <div className="text-white font-black text-lg">♟️ Шашки</div>
        <div className="flex gap-2">
          <div className="bg-red-500/40 rounded-xl px-2 py-1 text-white text-xs font-black">Ти: {scores.player}</div>
          <div className="bg-blue-500/40 rounded-xl px-2 py-1 text-white text-xs font-black">🐱: {scores.ai}</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start gap-2 px-2 pt-2 pb-4 overflow-auto">

        {/* Cat + status row */}
        <div className="flex items-center gap-4 w-full max-w-sm px-2">
          <div className="relative flex-shrink-0">
            <CatSprite state={catState} size={80} />
            {/* Speech bubble */}
            {thinking && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-white rounded-xl px-2 py-0.5 text-xs font-black text-teal-700 shadow whitespace-nowrap">
                Ходжу... 🤔
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0"
                  style={{ borderLeft:'5px solid transparent', borderRight:'5px solid transparent', borderTop:'5px solid white'}} />
              </div>
            )}
            {gameOver === 'ai' && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-yellow-400 rounded-xl px-2 py-0.5 text-xs font-black text-yellow-900 shadow whitespace-nowrap">
                Я переміг! 😼
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0"
                  style={{ borderLeft:'5px solid transparent', borderRight:'5px solid transparent', borderTop:'5px solid #facc15'}} />
              </div>
            )}
            {gameOver === 'player' && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-white rounded-xl px-2 py-0.5 text-xs font-black text-teal-700 shadow whitespace-nowrap">
                Не чесно... 😿
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0"
                  style={{ borderLeft:'5px solid transparent', borderRight:'5px solid transparent', borderTop:'5px solid white'}} />
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="text-white font-black text-base">{getStatus()}</div>
            <div className="flex gap-3 mt-1">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-red-400"/>
                <span className="text-white/80 text-xs font-bold">×{rCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-blue-400"/>
                <span className="text-white/80 text-xs font-bold">×{bCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Board */}
        <div className="rounded-2xl overflow-hidden border-4 border-yellow-800/60 shadow-2xl">
          {Array.from({length:8}, (_,r) => (
            <div key={r} className="flex">
              {Array.from({length:8}, (_,c) => {
                const idx = bpos(r,c)
                const isDark = (r+c)%2===1
                const piece = board[idx]
                const isSel = selected===idx
                const isValid = validMoves.some(m=>m.to===idx)
                const isLast = lastMove?.from===idx || lastMove?.to===idx
                return (
                  <div
                    key={c}
                    onClick={() => handleCellClick(idx)}
                    style={{ width:CELL_SIZE, height:CELL_SIZE }}
                    className={`flex items-center justify-center relative transition-colors
                      ${isDark ? (isLast?'bg-yellow-700/80':'bg-amber-900') : 'bg-amber-100'}`}>
                    {isValid && isDark && !piece && (
                      <div className="w-3 h-3 rounded-full bg-yellow-400/70 border-2 border-yellow-400"/>
                    )}
                    {isValid && isDark && piece && (
                      <div className="absolute inset-0 border-2 border-yellow-400"/>
                    )}
                    {piece && (
                      <div
                        className={`rounded-full flex items-center justify-center font-black text-white
                          ${piece.startsWith('r')
                            ? 'bg-gradient-to-b from-red-400 to-red-600 shadow-md'
                            : 'bg-gradient-to-b from-blue-400 to-blue-600 shadow-md'
                          }
                          ${isSel ? 'ring-2 ring-yellow-300 ring-offset-1 scale-110' : ''}
                          ${piece.endsWith('k') ? 'border-2 border-yellow-400' : ''}`}
                        style={{ width:CELL_SIZE-10, height:CELL_SIZE-10, fontSize:14 }}>
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
          <div className="flex flex-col items-center gap-2 w-full max-w-xs mt-1">
            {gameOver === 'player' && (
              <div className="bg-yellow-400/20 border border-yellow-400/50 rounded-2xl px-6 py-2 text-center">
                <div className="text-yellow-300 font-black">+20 котик радіє за тебе! 😸</div>
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
            Натисни на 🔴 фішку, потім на клітинку
          </div>
        )}
      </div>
    </div>
  )
}
