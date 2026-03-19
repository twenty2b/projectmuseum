import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Story } from '../../types/story'

interface VideoPlayerProps {
  story: Story
  onBack: () => void
  onSelectRelated: (storyId: string) => void
  allStories: Story[]
}

export function VideoPlayer({ story, onBack, onSelectRelated, allStories }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [showInsights, setShowInsights] = useState(false)
  const [ended, setEnded] = useState(false)
  const controlsTimeout = useRef<ReturnType<typeof setTimeout>>()

  const hasVideo = !!story.videoUrl

  // Auto-play on mount
  useEffect(() => {
    if (videoRef.current && hasVideo) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
    }
  }, [hasVideo])

  // Hide controls after 3s of no interaction
  const resetControlsTimer = useCallback(() => {
    setShowControls(true)
    clearTimeout(controlsTimeout.current)
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) setShowControls(false)
    }, 3000)
  }, [isPlaying])

  useEffect(() => {
    resetControlsTimer()
    return () => clearTimeout(controlsTimeout.current)
  }, [resetControlsTimer])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
    resetControlsTimer()
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    videoRef.current.currentTime = pct * duration
  }

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // Find active entities at current timestamp
  const activeEntities = story.entities.filter(e =>
    e.timestampStart !== undefined &&
    e.timestampEnd !== undefined &&
    currentTime >= e.timestampStart &&
    currentTime <= e.timestampEnd
  )

  const relatedStories = story.relatedStoryIds
    .map(id => allStories.find(s => s.id === id))
    .filter(Boolean) as Story[]

  return (
    <motion.div
      className="absolute inset-0 z-30 bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      onPointerMove={resetControlsTimer}
      onClick={resetControlsTimer}
    >
      {hasVideo ? (
        <>
          {/* Video element */}
          <video
            ref={videoRef}
            src={story.videoUrl!}
            className="absolute inset-0 w-full h-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={() => {
              if (videoRef.current) setDuration(videoRef.current.duration)
            }}
            onEnded={() => { setEnded(true); setIsPlaying(false) }}
            onClick={togglePlay}
            playsInline
          />

          {/* Tap to play/pause overlay */}
          <AnimatePresence>
            {!isPlaying && !ended && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={togglePlay}
              >
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls bar */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                {/* Progress bar */}
                <div
                  className="w-full h-1.5 bg-white/20 rounded-full mb-4 cursor-pointer group"
                  onClick={handleSeek}
                >
                  <div
                    className="h-full bg-[#e8a838] rounded-full relative"
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {/* Entity markers on timeline */}
                  {story.entities.map(e => e.timestampStart !== undefined && duration > 0 && (
                    <div
                      key={e.id}
                      className="absolute top-1/2 -translate-y-1/2 w-1 h-3 bg-[#e8a838]/50 rounded"
                      style={{ left: `${(e.timestampStart / duration) * 100}%` }}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button onClick={togglePlay} className="text-white hover:text-[#e8a838] transition-colors">
                      {isPlaying ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                      )}
                    </button>
                    <span className="text-sm text-white/60 font-mono">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowInsights(!showInsights)}
                      className={`px-3 py-1.5 rounded text-xs tracking-wide transition-colors ${
                        showInsights ? 'bg-[#e8a838] text-black' : 'bg-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      Insights
                    </button>
                    <button
                      onClick={onBack}
                      className="px-3 py-1.5 rounded bg-white/10 text-white/60 hover:text-white text-xs tracking-wide transition-colors"
                    >
                      Back to Map
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top bar: story title */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-6 pb-16"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <p className="text-xs tracking-[0.3em] uppercase text-[#e8a838]/60 mb-1">
                  {story.neighborhood}
                </p>
                <h2 className="text-xl font-semibold">{story.title}</h2>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Insight Panel (Apple TV InSight style) */}
          <AnimatePresence>
            {showInsights && activeEntities.length > 0 && (
              <motion.div
                className="absolute bottom-24 left-6 max-w-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="space-y-2">
                  {activeEntities.map(entity => (
                    <div
                      key={entity.id}
                      className="p-3 rounded-lg bg-black/70 backdrop-blur-xl border border-white/10"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] tracking-wider uppercase px-1.5 py-0.5 rounded bg-[#e8a838]/20 text-[#e8a838]">
                          {entity.type}
                        </span>
                        <span className="text-sm font-medium">{entity.name}</span>
                      </div>
                      <p className="text-xs text-white/50 leading-relaxed">{entity.description}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* End screen */}
          <AnimatePresence>
            {ended && (
              <motion.div
                className="absolute inset-0 bg-black/85 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-center max-w-2xl px-8">
                  <h2 className="text-3xl font-bold mb-2">{story.title}</h2>
                  <p className="text-white/40 mb-8">{story.neighborhood}</p>

                  {relatedStories.length > 0 && (
                    <>
                      <p className="text-xs tracking-[0.2em] uppercase text-white/30 mb-4">Watch Next</p>
                      <div className="grid grid-cols-3 gap-3 mb-8">
                        {relatedStories.slice(0, 3).map(rs => (
                          <button
                            key={rs.id}
                            onClick={() => onSelectRelated(rs.id)}
                            className="p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-left transition-colors"
                          >
                            <p className="text-sm font-medium mb-1 line-clamp-2">{rs.title}</p>
                            <p className="text-xs text-white/40">{rs.neighborhood}</p>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  <button
                    onClick={onBack}
                    className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-full text-lg transition-colors"
                  >
                    Return to Map
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        /* No video file - placeholder */
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-lg">
            <p className="text-xs tracking-[0.3em] uppercase text-[#e8a838]/60 mb-3">
              {story.neighborhood}
            </p>
            <h2 className="text-4xl font-bold mb-4">{story.title}</h2>
            <p className="text-white/40 mb-6 leading-relaxed">{story.description}</p>
            <p className="text-sm text-white/20 mb-8">Video not yet available</p>
            <button
              onClick={onBack}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-full text-lg transition-colors"
            >
              Back to Map
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
