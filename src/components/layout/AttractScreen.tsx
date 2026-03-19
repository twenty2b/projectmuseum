import { motion } from 'framer-motion'

interface AttractScreenProps {
  onStart: () => void
}

export function AttractScreen({ onStart }: AttractScreenProps) {
  return (
    <motion.div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
      onClick={onStart}
      style={{ cursor: 'pointer' }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center px-8">
        <motion.p
          className="text-sm tracking-[0.4em] uppercase text-white/40 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          Museum of Toronto
        </motion.p>

        <motion.h1
          className="text-6xl md:text-8xl font-bold tracking-tight mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1.2 }}
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #e8a838 50%, #ffffff 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          The T.O.
          <br />
          You Don't Know
        </motion.h1>

        <motion.p
          className="text-xl text-white/50 font-light max-w-xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 1 }}
        >
          Explore the lesser-known stories that shaped Toronto
        </motion.p>

        <motion.div
          className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 1 }}
        >
          <motion.div
            className="w-2 h-2 rounded-full bg-[#e8a838]"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <span className="text-sm tracking-widest uppercase text-white/60">
            Touch anywhere to begin
          </span>
        </motion.div>
      </div>

      {/* Bottom attribution */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <p className="text-xs text-white/20 tracking-widest uppercase">
          401 Richmond
        </p>
      </div>
    </motion.div>
  )
}
