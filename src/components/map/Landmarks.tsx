import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { geoToWorld } from '../../types/map'

interface LandmarkDef {
  name: string
  lat: number
  lng: number
  height: number
  width: number
  depth: number
  color: string
  emissive: string
}

// Real Toronto landmarks with approximate positions and relative heights
const LANDMARKS: LandmarkDef[] = [
  // CN Tower
  { name: 'CN Tower', lat: 43.6426, lng: -79.3871, height: 8, width: 0.15, depth: 0.15, color: '#2a3555', emissive: '#1a2545' },
  // Rogers Centre
  { name: 'Rogers Centre', lat: 43.6414, lng: -79.3894, height: 0.6, width: 0.8, depth: 0.8, color: '#1e2d45', emissive: '#0d1a30' },
  // First Canadian Place
  { name: 'First Canadian Place', lat: 43.6490, lng: -79.3815, height: 3.5, width: 0.4, depth: 0.4, color: '#2a3050', emissive: '#1a2040' },
  // TD Centre
  { name: 'TD Centre', lat: 43.6475, lng: -79.3812, height: 2.8, width: 0.5, depth: 0.35, color: '#1e2535', emissive: '#0e1525' },
  // Commerce Court
  { name: 'Commerce Court', lat: 43.6492, lng: -79.3790, height: 2.5, width: 0.35, depth: 0.35, color: '#252d45', emissive: '#151d35' },
  // Brookfield Place
  { name: 'Brookfield Place', lat: 43.6490, lng: -79.3765, height: 2.3, width: 0.45, depth: 0.3, color: '#202840', emissive: '#101830' },
  // Scotia Plaza
  { name: 'Scotia Plaza', lat: 43.6502, lng: -79.3802, height: 2.7, width: 0.35, depth: 0.35, color: '#1e2840', emissive: '#0e1830' },
  // Royal York Hotel
  { name: 'Royal York Hotel', lat: 43.6456, lng: -79.3815, height: 1.2, width: 0.6, depth: 0.4, color: '#2a3050', emissive: '#1a2040' },
  // Union Station
  { name: 'Union Station', lat: 43.6453, lng: -79.3806, height: 0.4, width: 1.0, depth: 0.5, color: '#222840', emissive: '#121830' },
  // City Hall (curved towers)
  { name: 'City Hall', lat: 43.6534, lng: -79.3841, height: 1.5, width: 0.35, depth: 0.35, color: '#252d50', emissive: '#151d40' },
  // Old City Hall
  { name: 'Old City Hall', lat: 43.6524, lng: -79.3813, height: 1.0, width: 0.4, depth: 0.3, color: '#2a3050', emissive: '#1a2040' },
  // Eaton Centre
  { name: 'Eaton Centre', lat: 43.6544, lng: -79.3807, height: 0.5, width: 0.3, depth: 1.2, color: '#1e2535', emissive: '#0e1525' },
  // One King West
  { name: 'One King West', lat: 43.6495, lng: -79.3770, height: 2.0, width: 0.2, depth: 0.25, color: '#252d45', emissive: '#151d35' },
  // Aura (tallest condo)
  { name: 'Aura', lat: 43.6589, lng: -79.3832, height: 3.0, width: 0.2, depth: 0.2, color: '#202545', emissive: '#101535' },
  // L Tower
  { name: 'L Tower', lat: 43.6471, lng: -79.3749, height: 2.2, width: 0.2, depth: 0.2, color: '#1e2840', emissive: '#0e1830' },
  // Harbourfront Centre
  { name: 'Harbourfront Centre', lat: 43.6388, lng: -79.3820, height: 0.3, width: 0.8, depth: 0.4, color: '#1e2535', emissive: '#0e1525' },
  // Some Waterfront condos
  { name: 'CityPlace', lat: 43.6395, lng: -79.3950, height: 1.8, width: 0.3, depth: 0.3, color: '#202840', emissive: '#101830' },
  { name: 'CityPlace 2', lat: 43.6390, lng: -79.3930, height: 2.0, width: 0.2, depth: 0.2, color: '#1e2535', emissive: '#0e1525' },
  { name: 'Ice Condos', lat: 43.6420, lng: -79.3880, height: 2.3, width: 0.2, depth: 0.2, color: '#252d45', emissive: '#151d35' },
]

function Landmark({ def }: { def: LandmarkDef }) {
  const [x, , z] = geoToWorld(def.lat, def.lng)

  return (
    <mesh position={[x, def.height / 2, z]} castShadow>
      <boxGeometry args={[def.width, def.height, def.depth]} />
      <meshStandardMaterial
        color="#4a6090"
        emissive="#3050aa"
        emissiveIntensity={0.4}
        metalness={0.7}
        roughness={0.2}
        transparent
        opacity={0.9}
      />
    </mesh>
  )
}

// CN Tower gets special treatment - cylinder + sphere
function CNTower() {
  const [x, , z] = geoToWorld(43.6426, -79.3871)
  const ref = useRef<THREE.Group>(null)

  // Subtle pulse on the observation deck light
  useFrame(({ clock }) => {
    // Could animate beacon here
  })

  return (
    <group ref={ref} position={[x, 0, z]}>
      {/* Main shaft */}
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[0.04, 0.12, 6, 8]} />
        <meshStandardMaterial color="#5070aa" emissive="#3050cc" emissiveIntensity={0.5} metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Observation pod */}
      <mesh position={[0, 5.2, 0]}>
        <cylinderGeometry args={[0.3, 0.25, 0.4, 16]} />
        <meshStandardMaterial color="#6080bb" emissive="#4060dd" emissiveIntensity={0.6} metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Antenna spire */}
      <mesh position={[0, 7, 0]}>
        <cylinderGeometry args={[0.01, 0.03, 3, 4]} />
        <meshStandardMaterial color="#3a4565" emissive="#2a3555" emissiveIntensity={0.3} metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Beacon light */}
      <pointLight position={[0, 8.5, 0]} intensity={0.3} color="#ff4444" distance={3} />
    </group>
  )
}

export function Landmarks() {
  return (
    <group>
      <CNTower />
      {LANDMARKS.filter(l => l.name !== 'CN Tower').map((def) => (
        <Landmark key={def.name} def={def} />
      ))}
    </group>
  )
}
