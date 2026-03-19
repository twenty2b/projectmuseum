import { useState } from 'react'
import { motion } from 'framer-motion'

interface LoginGateProps {
  onAuthenticated: () => void
}

export function LoginGate({ onAuthenticated }: LoginGateProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.toLowerCase() === 'davin' && password === 'calgaryflames') {
      sessionStorage.setItem('mot-auth', '1')
      onAuthenticated()
    } else {
      setError(true)
      setTimeout(() => setError(false), 2000)
    }
  }

  return (
    <div className="w-screen h-screen bg-[#0a0a0a] flex items-center justify-center">
      <motion.div
        className="w-full max-w-sm px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.4em] uppercase text-white/30 mb-3">
            Museum of Toronto
          </p>
          <h1
            className="text-3xl font-bold mb-2"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #e8a838 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            The T.O. You Don't Know
          </h1>
          <p className="text-sm text-white/30">Prototype Preview</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#e8a838]/50 transition-colors"
            autoFocus
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#e8a838]/50 transition-colors"
          />
          <button
            type="submit"
            className="w-full py-3 bg-[#e8a838] hover:bg-[#f0b848] text-black font-semibold rounded-lg transition-colors"
          >
            Enter
          </button>
          {error && (
            <motion.p
              className="text-sm text-red-400 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Invalid credentials
            </motion.p>
          )}
        </form>

        <p className="text-xs text-white/15 text-center mt-8">
          twenty2b Automations
        </p>
      </motion.div>
    </div>
  )
}
