import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { TORONTO_CENTER } from '../../types/map'

// Bounds from the tile download script (zoom 14, 10x10 grid)
const MAP_BOUNDS = {
  tlLat: 43.739352079154706,
  tlLng: -79.51904296875,
  brLat: 43.580390855607845,
  brLng: -79.29931640625,
}

export function MapGround() {
  const texture = useLoader(THREE.TextureLoader, '/data/toronto-map.png?v=3')

  // Calculate world-space dimensions using the same geoToWorld scale (200)
  const width = Math.abs(MAP_BOUNDS.brLng - MAP_BOUNDS.tlLng) * 200
  const height = Math.abs(MAP_BOUNDS.tlLat - MAP_BOUNDS.brLat) * 200

  // Offset: center of map image relative to TORONTO_CENTER
  const mapCenterLng = (MAP_BOUNDS.tlLng + MAP_BOUNDS.brLng) / 2
  const mapCenterLat = (MAP_BOUNDS.tlLat + MAP_BOUNDS.brLat) / 2
  const offsetX = (mapCenterLng - TORONTO_CENTER.lng) * 200
  const offsetZ = -(mapCenterLat - TORONTO_CENTER.lat) * 200

  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.colorSpace = THREE.SRGBColorSpace

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[offsetX, -0.05, offsetZ]}
      receiveShadow
    >
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  )
}
