import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { Story } from '../../types/story'

interface MapPinProps {
  position: [number, number, number]
  story: Story
  state: 'default' | 'hovered' | 'selected' | 'watched'
  visible: boolean
  onSelect: () => void
  onHover: (hovered: boolean) => void
}

const PIN_COLORS = {
  default: '#e8a838',
  hovered: '#ffffff',
  selected: '#ffffff',
  watched: '#555555',
}

export function MapPin({ position, story, state, visible, onSelect, onHover }: MapPinProps) {
  const groupRef = useRef<THREE.Group>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const beamRef = useRef<THREE.Mesh>(null)

  // Floating animation
  useFrame(({ clock }) => {
    if (!groupRef.current || !visible) return
    const t = clock.getElapsedTime()
    // Each pin bobs at a slightly different phase based on position
    const phase = position[0] * 3 + position[2] * 7
    groupRef.current.position.y = position[1] + 1.2 + Math.sin(t * 1.5 + phase) * 0.15

    // Glow pulse
    if (glowRef.current) {
      const scale = 1 + Math.sin(t * 2 + phase) * 0.2
      glowRef.current.scale.set(scale, scale, scale)
    }

    // Beam opacity pulse
    if (beamRef.current) {
      const mat = beamRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.1 + Math.sin(t * 2 + phase) * 0.05
    }
  })

  if (!visible) return null

  const color = PIN_COLORS[state]
  const scale = state === 'hovered' || state === 'selected' ? 1.3 : 1

  return (
    <group position={position}>
      {/* Vertical beam from ground to pin */}
      <mesh ref={beamRef} position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 1.2, 4]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>

      {/* Ground ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.15, 0.25, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Pin group (floating) */}
      <group ref={groupRef} scale={[scale, scale, scale]}>
        {/* Core sphere */}
        <mesh
          onPointerEnter={(e) => { e.stopPropagation(); onHover(true) }}
          onPointerLeave={(e) => { e.stopPropagation(); onHover(false) }}
          onClick={(e) => { e.stopPropagation(); onSelect() }}
        >
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={state === 'hovered' || state === 'selected' ? 0.8 : 0.4}
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>

        {/* Glow ring */}
        <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.25, 0.35, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={state === 'hovered' ? 0.5 : 0.2}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Label */}
        <Html
          position={[0, 0.5, 0]}
          center
          distanceFactor={15}
          style={{
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <div
            data-story-id={story.id}
            className="px-3 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-300"
            style={{
              background: state === 'hovered' || state === 'selected'
                ? 'rgba(232, 168, 56, 0.9)'
                : 'rgba(20, 20, 20, 0.85)',
              color: state === 'hovered' || state === 'selected'
                ? '#0a0a0a'
                : '#e8a838',
              border: `1px solid ${state === 'hovered' || state === 'selected' ? '#e8a838' : 'rgba(232, 168, 56, 0.3)'}`,
              backdropFilter: 'blur(8px)',
              fontFamily: "'Plus Jakarta Sans', system-ui",
              fontSize: '11px',
              letterSpacing: '0.05em',
            }}
          >
            {story.title.length > 30 ? story.neighborhood : story.title}
          </div>
        </Html>
      </group>
    </group>
  )
}
