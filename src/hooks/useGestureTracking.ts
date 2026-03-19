import { useRef, useState, useCallback, useEffect } from 'react'
import type { GestureState, GestureType } from '../types/gesture'

const INITIAL_STATE: GestureState = {
  active: false,
  type: 'idle',
  x: 0,
  y: 0,
  deltaX: 0,
  deltaY: 0,
  scale: 1,
  rotation: 0,
  velocity: 0,
  handCount: 0,
}

export function useGestureTracking() {
  const [gestureState, setGestureState] = useState<GestureState>(INITIAL_STATE)
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [handDetected, setHandDetected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const smoothedPosRef = useRef<{ x: number; y: number } | null>(null)
  const smoothedDepthRef = useRef<number | null>(null)
  const lastDepthRef = useRef<number | null>(null)
  const lastAngleRef = useRef<number | null>(null)
  const handHistoryRef = useRef<{ x: number; y: number; time: number }[]>([])
  const handsRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const gestureRef = useRef<GestureState>(INITIAL_STATE)

  const startTracking = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      })

      const video = document.createElement('video')
      video.srcObject = stream
      video.setAttribute('playsinline', '')
      await video.play()
      videoRef.current = video

      const [handsModule, cameraModule] = await Promise.all([
        import('@mediapipe/hands'),
        import('@mediapipe/camera_utils'),
      ])

      const hands = new handsModule.Hands({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      })

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6,
      })

      hands.onResults((results: any) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          setHandDetected(true)
          const landmarks = results.multiHandLandmarks[0]

          // Smooth palm position (landmark 9 = middle finger base)
          const rawX = landmarks[9].x
          const rawY = landmarks[9].y
          const rawZ = landmarks[9].z
          const posSmoothing = 0.4
          const depthSmoothing = 0.3

          // Depth smoothing
          if (smoothedDepthRef.current !== null) {
            smoothedDepthRef.current += (rawZ - smoothedDepthRef.current) * depthSmoothing
          } else {
            smoothedDepthRef.current = rawZ
          }

          // Position smoothing
          if (smoothedPosRef.current) {
            smoothedPosRef.current = {
              x: smoothedPosRef.current.x + (rawX - smoothedPosRef.current.x) * posSmoothing,
              y: smoothedPosRef.current.y + (rawY - smoothedPosRef.current.y) * posSmoothing,
            }
          } else {
            smoothedPosRef.current = { x: rawX, y: rawY }
          }

          const palmX = smoothedPosRef.current.x
          const palmY = smoothedPosRef.current.y

          // Velocity
          const now = Date.now()
          handHistoryRef.current.push({ x: rawX, y: rawY, time: now })
          handHistoryRef.current = handHistoryRef.current.filter(p => now - p.time < 200)

          let velocity = 0
          if (handHistoryRef.current.length > 1) {
            const oldest = handHistoryRef.current[0]
            const newest = handHistoryRef.current[handHistoryRef.current.length - 1]
            const dx = newest.x - oldest.x
            const dy = newest.y - oldest.y
            velocity = Math.sqrt(dx * dx + dy * dy) / ((newest.time - oldest.time) / 1000 + 0.001)
          }

          // Wrist-to-middle-finger angle for rotation
          const wrist = landmarks[0]
          const middleFinger = landmarks[9]
          const currentAngle = Math.atan2(
            middleFinger.x - wrist.x,
            middleFinger.y - wrist.y
          )

          // Finger state
          const fingerTips = [8, 12, 16, 20]
          const fingerMids = [6, 10, 14, 18]
          const fingersCurled = fingerTips.every(
            (tip, i) => landmarks[tip].y > landmarks[fingerMids[i]].y
          )
          const fingersExtended = fingerTips.every(
            (tip, i) => landmarks[tip].y < landmarks[fingerMids[i]].y
          )

          // Gesture classification
          let type: GestureType = 'idle'
          let deltaX = 0
          let deltaY = 0
          let scale = 1
          let rotation = 0

          if (fingersCurled) {
            // FIST = select the nearest pin
            type = 'fist'
          } else if (fingersExtended) {
            // OPEN PALM = primary navigation gesture
            // Palm depth controls zoom (lean toward = zoom in, lean away = zoom out)
            if (smoothedDepthRef.current !== null && lastDepthRef.current !== null) {
              const depthDelta = smoothedDepthRef.current - lastDepthRef.current
              // Leaning toward screen = negative Z = zoom in
              // Leaning away = positive Z = zoom out
              if (Math.abs(depthDelta) > 0.001) {
                scale = 1 - depthDelta * 12
                type = 'zoom'
              }
            }
            lastDepthRef.current = smoothedDepthRef.current

            // Wrist rotation = orbit
            if (lastAngleRef.current !== null) {
              let angleDelta = currentAngle - lastAngleRef.current
              if (angleDelta > Math.PI) angleDelta -= 2 * Math.PI
              if (angleDelta < -Math.PI) angleDelta += 2 * Math.PI

              if (Math.abs(angleDelta) > 0.008 && Math.abs(angleDelta) < 0.2) {
                rotation = angleDelta * 3
                type = 'orbit'
              }
            }

            // If not zooming or orbiting strongly, it's a pan
            if (type === 'idle') {
              type = 'pan'
            }
          }

          lastAngleRef.current = currentAngle

          const newState: GestureState = {
            active: true,
            type,
            x: (1 - palmX) * window.innerWidth, // Mirror for natural feel
            y: palmY * window.innerHeight,
            deltaX,
            deltaY,
            scale: Math.max(0.8, Math.min(1.2, scale)),
            rotation,
            velocity,
            handCount: results.multiHandLandmarks.length,
          }

          gestureRef.current = newState
          setGestureState(newState)
        } else {
          setHandDetected(false)
          smoothedPosRef.current = null
          smoothedDepthRef.current = null
          lastDepthRef.current = null
          lastAngleRef.current = null
          handHistoryRef.current = []

          const idle = { ...INITIAL_STATE }
          gestureRef.current = idle
          setGestureState(idle)
        }
      })

      handsRef.current = hands

      const camera = new cameraModule.Camera(video, {
        onFrame: async () => {
          if (video && handsRef.current) {
            await handsRef.current.send({ image: video })
          }
        },
        width: 640,
        height: 480,
      })
      cameraRef.current = camera
      await camera.start()

      setCameraEnabled(true)
    } catch (err: any) {
      console.error('Gesture tracking failed:', err)
      setError(err.message || 'Camera access denied')
    }
  }, [])

  const stopTracking = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop()
    }
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(t => t.stop())
    }
    setCameraEnabled(false)
    setHandDetected(false)
    setGestureState(INITIAL_STATE)
  }, [])

  useEffect(() => {
    return () => { stopTracking() }
  }, [stopTracking])

  return {
    gestureState,
    gestureRef,
    cameraEnabled,
    handDetected,
    error,
    startTracking,
    stopTracking,
    videoRef,
  }
}
