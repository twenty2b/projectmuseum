import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { GestureState } from '../../types/gesture'

interface GestureOverlayProps {
  gestureState: GestureState
  cameraEnabled: boolean
  handDetected: boolean
  onToggleCamera: () => void
  videoRef: React.MutableRefObject<HTMLVideoElement | null>
}

const GESTURE_LABELS: Record<string, string> = {
  idle: '',
  pan: 'Flying',
  zoom: 'Zooming',
  orbit: 'Orbiting',
  fist: 'Returning to Overview',
  point: 'Selecting',
  pinch: 'Zooming',
}

export function GestureOverlay({ gestureState, cameraEnabled, handDetected, onToggleCamera, videoRef }: GestureOverlayProps) {
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)

  // Draw camera preview in grayscale, mirrored
  useEffect(() => {
    if (!cameraEnabled) {
      cancelAnimationFrame(animFrameRef.current)
      return
    }

    const drawPreview = () => {
      const canvas = previewCanvasRef.current
      const video = videoRef.current
      if (canvas && video && video.videoWidth > 0) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.save()
          ctx.filter = 'grayscale(100%) contrast(1.2)'
          // Mirror horizontally
          ctx.scale(-1, 1)
          ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
          ctx.restore()
        }
      }
      animFrameRef.current = requestAnimationFrame(drawPreview)
    }

    animFrameRef.current = requestAnimationFrame(drawPreview)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [cameraEnabled, videoRef])

  return (
    <>
      {/* Camera toggle button */}
      <div className="absolute top-6 right-6 z-30">
        <button
          onClick={onToggleCamera}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs tracking-wide transition-all ${
            cameraEnabled
              ? 'bg-[#e8a838]/20 border border-[#e8a838]/40 text-[#e8a838]'
              : 'bg-white/5 border border-white/10 text-white/40 hover:text-white/60'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {cameraEnabled ? (
              <path d="M23 7l-7 5 7 5V7zM1 5h15a1 1 0 011 1v12a1 1 0 01-1 1H1a1 1 0 01-1-1V6a1 1 0 011-1z" />
            ) : (
              <>
                <path d="M23 7l-7 5 7 5V7zM1 5h15a1 1 0 011 1v12a1 1 0 01-1 1H1a1 1 0 01-1-1V6a1 1 0 011-1z" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </>
            )}
          </svg>
          {cameraEnabled ? 'Hand Tracking On' : 'Enable Hand Tracking'}
        </button>
      </div>

      {/* Camera preview window (bottom-left, grayscale, mirrored) */}
      <AnimatePresence>
        {cameraEnabled && (
          <motion.div
            className="absolute bottom-6 left-6 z-30 rounded-lg overflow-hidden border border-white/10 shadow-2xl"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
          >
            <canvas
              ref={previewCanvasRef}
              width={200}
              height={150}
              className="block bg-black"
            />
            {/* Status indicator */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${handDetected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-[10px] text-white/60 font-medium">
                {handDetected ? GESTURE_LABELS[gestureState.type] || 'Tracking' : 'No hand'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hand detection indicator (top-left) */}
      <AnimatePresence>
        {cameraEnabled && (
          <motion.div
            className="absolute top-6 left-6 z-30 flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className={`w-2 h-2 rounded-full ${handDetected ? 'bg-green-400' : 'bg-white/20'}`} />
            <span className="text-xs text-white/40">
              {handDetected ? GESTURE_LABELS[gestureState.type] || 'Hand Detected' : 'Show your hand'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hand cursor indicator */}
      {cameraEnabled && handDetected && gestureState.active && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: gestureState.x - 16,
            top: gestureState.y - 16,
            transition: 'left 0.05s, top 0.05s',
          }}
        >
          <div className={`w-8 h-8 rounded-full border-2 ${
            gestureState.type === 'fist' ? 'border-red-400 bg-red-400/20 scale-75' :
            gestureState.type === 'pinch' ? 'border-blue-400 bg-blue-400/20 scale-50' :
            gestureState.type === 'point' ? 'border-[#e8a838] bg-[#e8a838]/20' :
            'border-white/60 bg-white/10'
          } transition-all duration-150`} />
        </div>
      )}

      {/* First-time gesture hints */}
      {cameraEnabled && !handDetected && (
        <motion.div
          className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="bg-black/60 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/10">
            <p className="text-sm text-white/60 text-center mb-3">Hand Gesture Controls</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-white/40">
              <span>Open hand move</span><span className="text-white/60">Fly / Pan</span>
              <span>Pinch</span><span className="text-white/60">Zoom</span>
              <span>Rotate wrist</span><span className="text-white/60">Orbit</span>
              <span>Fist</span><span className="text-white/60">Reset view</span>
              <span>Point</span><span className="text-white/60">Select pin</span>
            </div>
          </div>
        </motion.div>
      )}
    </>
  )
}
