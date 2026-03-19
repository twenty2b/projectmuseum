import { motion } from 'framer-motion'
import type { Story } from '../../types/story'

interface StoryPanelProps {
  story: Story
  allStories: Story[]
  onPlay: () => void
  onBack: () => void
  onSelectRelated: (storyId: string) => void
}

export function StoryPanel({ story, allStories, onPlay, onBack, onSelectRelated }: StoryPanelProps) {
  const relatedStories = story.relatedStoryIds
    .map(id => allStories.find(s => s.id === id))
    .filter(Boolean) as Story[]

  return (
    <motion.div
      className="absolute right-0 top-0 bottom-0 z-20 w-full max-w-lg"
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      <div className="h-full overflow-y-auto bg-gradient-to-l from-black/95 via-black/90 to-black/70 backdrop-blur-xl p-8 flex flex-col">
        {/* Back button */}
        <button
          onClick={onBack}
          className="self-start flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors mb-8 text-sm tracking-wide"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Map
        </button>

        {/* Story info */}
        <div className="flex-1">
          {/* Neighborhood tag */}
          <p className="text-xs tracking-[0.3em] uppercase text-[#e8a838]/80 mb-3">
            {story.neighborhood}
          </p>

          <h2 className="text-3xl font-bold mb-4 leading-tight">
            {story.title}
          </h2>

          <p className="text-white/60 leading-relaxed mb-6">
            {story.description}
          </p>

          {/* Themes */}
          <div className="flex flex-wrap gap-2 mb-8">
            {story.themes.map(theme => (
              <span
                key={theme}
                className="px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-white/50"
              >
                {theme}
              </span>
            ))}
          </div>

          {/* Play button */}
          <button
            onClick={onPlay}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-[#e8a838] hover:bg-[#f0b848] text-black font-semibold text-lg transition-colors mb-8"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            Watch Story ({story.duration}s)
          </button>

          {/* Entities / Insights */}
          {story.entities.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xs tracking-[0.2em] uppercase text-white/30 mb-4">
                In This Story
              </h3>
              <div className="space-y-3">
                {story.entities.map(entity => (
                  <div
                    key={entity.id}
                    className="p-3 rounded-lg bg-white/5 border border-white/5"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] tracking-wider uppercase px-2 py-0.5 rounded bg-white/10 text-white/40">
                        {entity.type}
                      </span>
                      <span className="text-sm font-medium">{entity.name}</span>
                    </div>
                    <p className="text-xs text-white/40 leading-relaxed">
                      {entity.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related stories */}
          {relatedStories.length > 0 && (
            <div>
              <h3 className="text-xs tracking-[0.2em] uppercase text-white/30 mb-4">
                Related Stories
              </h3>
              <div className="space-y-2">
                {relatedStories.map(related => (
                  <button
                    key={related.id}
                    onClick={() => onSelectRelated(related.id)}
                    className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <p className="text-sm font-medium mb-1">{related.title}</p>
                    <p className="text-xs text-white/40">{related.neighborhood}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Duration */}
        <div className="mt-8 pt-4 border-t border-white/5">
          <p className="text-xs text-white/20 text-center">
            {story.duration} second story
          </p>
        </div>
      </div>
    </motion.div>
  )
}
