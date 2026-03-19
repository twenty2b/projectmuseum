import { useMemo } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { geoToWorld } from '../../types/map'

interface NeighborhoodMeshProps {
  feature: {
    properties: { name: string; id: string }
    geometry: {
      coordinates: number[][][]
    }
  }
  isHighlighted: boolean
}

export function NeighborhoodMesh({ feature, isHighlighted }: NeighborhoodMeshProps) {
  const { geometry, edgeGeometry, center } = useMemo(() => {
    const coords = feature.geometry.coordinates[0]
    const shape = new THREE.Shape()

    let cx = 0, cz = 0

    coords.forEach(([lng, lat], i) => {
      const [x, , z] = geoToWorld(lat, lng)
      cx += x
      cz += z
      if (i === 0) {
        shape.moveTo(x, -z)
      } else {
        shape.lineTo(x, -z)
      }
    })
    shape.closePath()

    cx /= coords.length
    cz /= coords.length

    const extrudeSettings = {
      depth: isHighlighted ? 0.5 : 0.2,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 2,
    }

    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings)
    const edges = new THREE.EdgesGeometry(geo, 15)

    return { geometry: geo, edgeGeometry: edges, center: [cx, cz] as [number, number] }
  }, [feature, isHighlighted])

  return (
    <group>
      {/* Solid fill */}
      <mesh
        geometry={geometry}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial
          color={isHighlighted ? '#1e2d4a' : '#121828'}
          emissive={isHighlighted ? '#2244aa' : '#1a2040'}
          emissiveIntensity={isHighlighted ? 0.6 : 0.15}
          metalness={0.4}
          roughness={0.6}
        />
      </mesh>

      {/* Glowing edges */}
      <lineSegments
        geometry={edgeGeometry}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
      >
        <lineBasicMaterial
          color={isHighlighted ? '#4488ff' : '#2a4070'}
          transparent
          opacity={isHighlighted ? 0.9 : 0.5}
          linewidth={1}
        />
      </lineSegments>

      {/* Neighborhood label */}
      <Html
        position={[center[0], 0.3, center[1]]}
        center
        distanceFactor={25}
        style={{ pointerEvents: 'none' }}
      >
        <p
          className="text-[10px] tracking-[0.15em] uppercase whitespace-nowrap"
          style={{
            color: isHighlighted ? 'rgba(100, 160, 255, 0.8)' : 'rgba(80, 120, 180, 0.35)',
            fontFamily: "'Plus Jakarta Sans', system-ui",
          }}
        >
          {feature.properties.name}
        </p>
      </Html>
    </group>
  )
}
