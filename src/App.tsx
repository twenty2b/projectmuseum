import { useState, useEffect, useCallback, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { TorontoMap } from './components/map/TorontoMap'
import { GestureCamera } from './components/map/GestureCamera'
import { KioskShell } from './components/layout/KioskShell'
import { AttractScreen } from './components/layout/AttractScreen'
import { GestureOverlay } from './components/layout/GestureOverlay'
import { StoryPanel } from './components/story/StoryPanel'
import { VideoPlayer } from './components/video/VideoPlayer'
import { LoginGate } from './components/layout/LoginGate'
import { useGestureTracking } from './hooks/useGestureTracking'
import type { Story } from './types/story'
import type { AppView } from './types/map'

function App() {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem('mot-auth') === '1'
  )

  if (!authenticated) {
    return <LoginGate onAuthenticated={() => setAuthenticated(true)} />
  }

  return <KioskApp />
}

function KioskApp() {
  const [stories, setStories] = useState<Story[]>([])
  const [view, setView] = useState<AppView>('attract')
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [watchedStoryIds, setWatchedStoryIds] = useState<Set<string>>(new Set())

  const {
    gestureState,
    cameraEnabled,
    handDetected,
    startTracking,
    stopTracking,
    videoRef: gestureVideoRef,
  } = useGestureTracking()

  // Load story data
  useEffect(() => {
    fetch('/data/stories.json')
      .then(res => res.json())
      .then(setStories)
      .catch(console.error)
  }, [])

  const handleStartExploring = useCallback(() => {
    setView('map')
  }, [])

  const handleSelectStory = useCallback((story: Story) => {
    setSelectedStory(story)
    // If video exists, go straight to video. Otherwise show story panel.
    if (story.videoUrl) {
      setView('video')
      setWatchedStoryIds(prev => new Set(prev).add(story.id))
    } else {
      setView('story')
    }
  }, [])

  const handlePlayVideo = useCallback(() => {
    if (selectedStory) {
      setView('video')
      setWatchedStoryIds(prev => new Set(prev).add(selectedStory.id))
    }
  }, [selectedStory])

  const handleBackToMap = useCallback(() => {
    setSelectedStory(null)
    setView('map')
  }, [])

  const handleSelectRelated = useCallback((storyId: string) => {
    const story = stories.find(s => s.id === storyId)
    if (story) {
      setSelectedStory(story)
      setView('story')
    }
  }, [stories])

  const handleToggleCamera = useCallback(() => {
    if (cameraEnabled) {
      stopTracking()
    } else {
      startTracking()
    }
  }, [cameraEnabled, startTracking, stopTracking])

  // Fist gesture over a pin = select that story
  const fistCooldownRef = useRef(false)
  useEffect(() => {
    if (!cameraEnabled || !handDetected || view !== 'map') return
    if (gestureState.type !== 'fist' || fistCooldownRef.current) return

    // Find the nearest pin to the cursor using screen-space proximity
    // Pins render as Html overlays, so we check cursor position against pin screen coords
    // Use a simple approach: find story whose geoToWorld position is closest to cursor
    const cursorX = gestureState.x
    const cursorY = gestureState.y

    // Check all pin elements on screen
    const pinElements = document.querySelectorAll('[data-story-id]')
    let closestId: string | null = null
    let closestDist = Infinity

    pinElements.forEach(el => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dist = Math.sqrt((cursorX - cx) ** 2 + (cursorY - cy) ** 2)
      if (dist < closestDist) {
        closestDist = dist
        closestId = el.getAttribute('data-story-id')
      }
    })

    if (closestId && closestDist < 100) {
      const story = stories.find(s => s.id === closestId)
      if (story) {
        fistCooldownRef.current = true
        handleSelectStory(story)
        setTimeout(() => { fistCooldownRef.current = false }, 1000)
      }
    }
  }, [gestureState, cameraEnabled, handDetected, view, stories, handleSelectStory])

  // Session timeout: return to attract after 90s idle
  useEffect(() => {
    if (view === 'attract') return

    let timeout: ReturnType<typeof setTimeout>

    const resetTimer = () => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        setView('attract')
        setSelectedStory(null)
        setWatchedStoryIds(new Set())
      }, 90000)
    }

    resetTimer()

    const events = ['pointerdown', 'pointermove', 'keydown']
    events.forEach(e => window.addEventListener(e, resetTimer))

    return () => {
      clearTimeout(timeout)
      events.forEach(e => window.removeEventListener(e, resetTimer))
    }
  }, [view])

  return (
    <KioskShell>
      {/* 3D Scene - always rendered */}
      <div className="absolute inset-0">
        <Canvas
          camera={{
            position: [0, 25, 20],
            fov: 50,
            near: 0.1,
            far: 500,
          }}
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 2]}
        >
          <TorontoMap
            stories={stories}
            selectedStory={selectedStory}
            watchedStoryIds={watchedStoryIds}
            view={view}
            onSelectStory={handleSelectStory}
            gestureActive={cameraEnabled && handDetected}
          />
          <GestureCamera
            gestureState={gestureState}
            enabled={cameraEnabled && view === 'map'}
          />
        </Canvas>
      </div>

      {/* UI Overlays */}
      {view === 'attract' && (
        <AttractScreen onStart={handleStartExploring} />
      )}

      {view === 'story' && selectedStory && (
        <StoryPanel
          story={selectedStory}
          allStories={stories}
          onPlay={handlePlayVideo}
          onBack={handleBackToMap}
          onSelectRelated={handleSelectRelated}
        />
      )}

      {view === 'video' && selectedStory && (
        <VideoPlayer
          story={selectedStory}
          allStories={stories}
          onBack={handleBackToMap}
          onSelectRelated={handleSelectRelated}
        />
      )}

      {/* Gesture tracking overlay */}
      {view === 'map' && (
        <GestureOverlay
          gestureState={gestureState}
          cameraEnabled={cameraEnabled}
          handDetected={handDetected}
          onToggleCamera={handleToggleCamera}
          videoRef={gestureVideoRef}
        />
      )}

      {/* Navigation hint */}
      {view === 'map' && !cameraEnabled && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <p className="text-sm text-white/30 tracking-widest uppercase">
            Touch a story pin to explore
          </p>
        </div>
      )}
    </KioskShell>
  )
}

export default App
