export type AppView = 'attract' | 'map' | 'story' | 'video'

export interface CameraState {
  position: [number, number, number]
  target: [number, number, number]
  zoom: number
}

export interface MapPinData {
  storyId: string
  position: [number, number, number] // 3D world position
  state: 'default' | 'hovered' | 'selected' | 'watched'
}

export const TORONTO_CENTER = {
  lat: 43.6532,
  lng: -79.3832,
} as const

// Convert lat/lng to 3D world coordinates
// Toronto spans roughly 43.58-43.72 lat, -79.55 to -79.25 lng
// We map this to a ~40x40 unit space centered at origin
export function geoToWorld(lat: number, lng: number): [number, number, number] {
  const x = (lng - TORONTO_CENTER.lng) * 200
  const z = -(lat - TORONTO_CENTER.lat) * 200
  return [x, 0, z]
}
