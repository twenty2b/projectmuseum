import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import * as THREE from 'three'
import { MapPin } from './MapPin'
import { MapGround } from './MapGround'
import { Landmarks } from './Landmarks'
import type { Story } from '../../types/story'
import type { AppView } from '../../types/map'
import { geoToWorld } from '../../types/map'

interface TorontoMapProps {
  stories: Story[]
  selectedStory: Story | null
  watchedStoryIds: Set<string>
  view: AppView
  onSelectStory: (story: Story) => void
  gestureActive?: boolean
}

interface NeighborhoodFeature {
  type: string
  properties: { name: string; id: string }
  geometry: {
    type: string
    coordinates: number[][][]
  }
}

interface NeighborhoodGeoJSON {
  type: string
  features: NeighborhoodFeature[]
}

export function TorontoMap({
  stories,
  selectedStory,
  watchedStoryIds,
  view,
  onSelectStory,
  gestureActive = false,
}: TorontoMapProps) {
  const controlsRef = useRef<any>(null)
  const { camera } = useThree()
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodGeoJSON | null>(null)
  const [hoveredPin, setHoveredPin] = useState<string | null>(null)

  // Load neighborhood data
  useEffect(() => {
    fetch('/data/toronto-neighborhoods.json')
      .then(res => res.json())
      .then(setNeighborhoods)
      .catch(console.error)
  }, [])

  // Camera positions for different views
  const cameraTargets = useMemo(() => ({
    attract: {
      position: new THREE.Vector3(0, 35, 25),
      target: new THREE.Vector3(0, 0, -2),
    },
    map: {
      position: new THREE.Vector3(0, 20, 15),
      target: new THREE.Vector3(0, 0, -2),
    },
    story: selectedStory
      ? (() => {
          const [x, , z] = geoToWorld(selectedStory.lat, selectedStory.lng)
          return {
            position: new THREE.Vector3(x + 3, 8, z + 5),
            target: new THREE.Vector3(x, 0, z),
          }
        })()
      : {
          position: new THREE.Vector3(0, 20, 15),
          target: new THREE.Vector3(0, 0, -2),
        },
    video: selectedStory
      ? (() => {
          const [x, , z] = geoToWorld(selectedStory.lat, selectedStory.lng)
          return {
            position: new THREE.Vector3(x, 6, z + 3),
            target: new THREE.Vector3(x, 2, z),
          }
        })()
      : {
          position: new THREE.Vector3(0, 20, 15),
          target: new THREE.Vector3(0, 0, -2),
        },
  }), [selectedStory])

  // Smoothly animate camera to target position
  useFrame(() => {
    const target = cameraTargets[view]
    if (!target || !controlsRef.current) return

    camera.position.lerp(target.position, 0.03)
    controlsRef.current.target.lerp(target.target, 0.03)
    controlsRef.current.update()
  })

  // Attract mode: slow orbit
  useFrame(({ clock }) => {
    if (view !== 'attract') return
    const t = clock.getElapsedTime() * 0.1
    const radius = 30
    camera.position.x = Math.sin(t) * radius * 0.3
    camera.position.z = Math.cos(t) * radius * 0.5 + 15
    camera.position.y = 30 + Math.sin(t * 0.5) * 5
  })

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} color="#3355aa" />
      <directionalLight
        position={[10, 25, 10]}
        intensity={0.8}
        color="#ffeedd"
        castShadow
      />
      <pointLight position={[0, 12, 0]} intensity={0.5} color="#e8a838" />
      <pointLight position={[-10, 8, -5]} intensity={0.2} color="#4466cc" />
      <pointLight position={[10, 8, 5]} intensity={0.2} color="#4466cc" />

      {/* Fog for atmosphere */}
      <fog attach="fog" args={['#060810', 50, 150]} />

      {/* Real Toronto map tiles */}
      <MapGround />

      {/* 3D landmark buildings */}
      <Landmarks />

      {/* Neighborhood shapes */}
      {/* Story pins */}
      {stories.map((story) => {
        const [x, , z] = geoToWorld(story.lat, story.lng)
        const isSelected = selectedStory?.id === story.id
        const isWatched = watchedStoryIds.has(story.id)
        const isHovered = hoveredPin === story.id

        return (
          <MapPin
            key={story.id}
            position={[x, 0, z]}
            story={story}
            state={isSelected ? 'selected' : isHovered ? 'hovered' : isWatched ? 'watched' : 'default'}
            visible={view === 'map' || (view === 'story' && isSelected)}
            onSelect={() => view === 'map' && onSelectStory(story)}
            onHover={(hovered) => setHoveredPin(hovered ? story.id : null)}
          />
        )
      })}

      {/* Fallback ground beyond map edges */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[300, 300]} />
        <meshBasicMaterial color="#080a10" />
      </mesh>

      {/* Controls */}
      <OrbitControls
        ref={controlsRef}
        enablePan={view === 'map' && !gestureActive}
        enableZoom={view === 'map' && !gestureActive}
        enableRotate={view === 'map' && !gestureActive}
        minDistance={5}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={0.3}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  )
}
