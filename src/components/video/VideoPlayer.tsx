import { useRef, useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
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

  const hasVideo = !!story.videoUrl

  useEffect(() => {
    if (videoRef.current && hasVideo) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
    }
  }, [hasVideo])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
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

  // Active entities at current timestamp
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
      className="absolute inset-0 z-30 bg-black/95"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="h-full flex flex-col p-6 max-w-7xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-[#e8a838]/60">
              {story.neighborhood}
            </p>
            <h2 className="text-2xl font-bold">{story.title}</h2>
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-white/60 hover:text-white transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Map
          </button>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex gap-5 min-h-0">
          {/* Left: Video + Controls (takes ~65% width) */}
          <div className="flex-[2] flex flex-col min-w-0">
            {/* Video container */}
            <div className="relative flex-1 bg-black rounded-xl overflow-hidden min-h-0">
              {hasVideo ? (
                <video
                  ref={videoRef}
                  src={story.videoUrl!}
                  className="absolute inset-0 w-full h-full object-contain"
                  onTimeUpdate={() => {
                    if (videoRef.current) setCurrentTime(videoRef.current.currentTime)
                  }}
                  onLoadedMetadata={() => {
                    if (videoRef.current) setDuration(videoRef.current.duration)
                  }}
                  onClick={togglePlay}
                  playsInline
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white/20">Video not available</p>
                </div>
              )}

              {/* Play/pause overlay */}
              {hasVideo && !isPlaying && (
                <div
                  className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/30"
                  onClick={togglePlay}
                >
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Active insight overlay (bottom of video) */}
              {activeEntities.length > 0 && (
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex gap-2 flex-wrap">
                    {activeEntities.map(entity => (
                      <div
                        key={entity.id}
                        className="px-3 py-2 rounded-lg bg-black/70 backdrop-blur-xl border border-[#e8a838]/30 text-xs"
                      >
                        <span className="text-[#e8a838] font-medium">{entity.name}</span>
                        <span className="text-white/40 ml-2">{entity.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Progress bar */}
            {hasVideo && (
              <div className="mt-3 shrink-0">
                <div
                  className="w-full h-1.5 bg-white/10 rounded-full cursor-pointer group"
                  onClick={handleSeek}
                >
                  <div
                    className="h-full bg-[#e8a838] rounded-full relative"
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <div className="flex items-center gap-3">
                    <button onClick={togglePlay} className="text-white/60 hover:text-white transition-colors">
                      {isPlaying ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                      )}
                    </button>
                    <span className="text-xs text-white/40 font-mono">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {story.themes.map(t => (
                      <span key={t} className="text-[10px] text-white/30 px-2 py-0.5 rounded bg-white/5">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar: Story details + entities + related (takes ~35% width) */}
          <div className="flex-1 flex flex-col min-w-[280px] max-w-[380px] overflow-y-auto">
            {/* Description */}
            <div className="mb-5">
              <p className="text-sm text-white/60 leading-relaxed">{story.description}</p>
            </div>

            {/* All entities in this story */}
            <div className="mb-5">
              <h3 className="text-xs tracking-[0.2em] uppercase text-white/30 mb-3">
                In This Story
              </h3>
              <div className="space-y-2">
                {story.entities.map(entity => (
                  <div
                    key={entity.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      activeEntities.some(ae => ae.id === entity.id)
                        ? 'bg-[#e8a838]/10 border-[#e8a838]/30'
                        : 'bg-white/3 border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] tracking-wider uppercase px-1.5 py-0.5 rounded bg-white/10 text-white/40">
                        {entity.type}
                      </span>
                      <span className="text-sm font-medium">{entity.name}</span>
                    </div>
                    <p className="text-xs text-white/40 leading-relaxed">{entity.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Related stories */}
            {relatedStories.length > 0 && (
              <div>
                <h3 className="text-xs tracking-[0.2em] uppercase text-white/30 mb-3">
                  Related Stories
                </h3>
                <div className="space-y-2">
                  {relatedStories.map(rs => (
                    <button
                      key={rs.id}
                      onClick={() => onSelectRelated(rs.id)}
                      className="w-full text-left p-3 rounded-lg bg-white/3 hover:bg-white/8 border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <p className="text-sm font-medium mb-0.5">{rs.title}</p>
                      <p className="text-xs text-white/40">{rs.neighborhood}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
