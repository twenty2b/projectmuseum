export type GestureType = 'idle' | 'pan' | 'zoom' | 'orbit' | 'fist' | 'point' | 'pinch'

export interface GestureState {
  active: boolean
  type: GestureType
  x: number
  y: number
  deltaX: number
  deltaY: number
  scale: number
  rotation: number
  velocity: number
  handCount: number
}

export interface HandLandmark {
  x: number
  y: number
  z: number
}
