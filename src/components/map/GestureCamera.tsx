import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { GestureState } from '../../types/gesture'

interface GestureCameraProps {
  gestureState: GestureState
  enabled: boolean
}

export function GestureCamera({ gestureState, enabled }: GestureCameraProps) {
  const { camera } = useThree()
  const targetY = useRef(20)
  const targetRotation = useRef(0)

  useFrame(() => {
    if (!enabled || !gestureState.active) return

    const { type, scale, rotation } = gestureState

    if (type === 'zoom' || type === 'pan') {
      // Depth-based zoom: adjust camera Y
      targetY.current *= scale
      targetY.current = Math.max(5, Math.min(45, targetY.current))
    }

    if (type === 'orbit') {
      // Wrist rotation = orbit around the point we're looking at
      targetRotation.current += rotation
    }

    if (type === 'fist') {
      // Return to overview
      targetY.current += (20 - targetY.current) * 0.05
      targetRotation.current += (0 - targetRotation.current) * 0.05
    }

    // Apply zoom smoothly
    camera.position.y += (targetY.current - camera.position.y) * 0.06

    // Apply orbit rotation around map center
    const target = new THREE.Vector3(0, 0, -2)
    const dist = camera.position.distanceTo(target)
    const desiredX = Math.sin(targetRotation.current) * dist * 0.5
    const desiredZ = Math.cos(targetRotation.current) * dist * 0.5 + target.z

    camera.position.x += (desiredX - camera.position.x) * 0.04
    camera.position.z += (desiredZ - camera.position.z) * 0.04
  })

  return null
}
