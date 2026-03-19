export interface Story {
  id: string
  title: string
  description: string
  neighborhood: string
  lat: number
  lng: number
  themes: string[]
  duration: number // seconds
  videoUrl: string | null // null = placeholder
  thumbnail: string | null
  transcript: string
  entities: Entity[]
  relatedStoryIds: string[]
}

export interface Entity {
  id: string
  name: string
  type: 'person' | 'place' | 'theme' | 'event'
  description: string
  timestampStart?: number // seconds into video
  timestampEnd?: number
}

export interface Neighborhood {
  id: string
  name: string
  center: [number, number] // [lat, lng]
  storyCount: number
}
