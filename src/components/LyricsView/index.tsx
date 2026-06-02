import { cls } from '@/utils/cls'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'

type LyricLine = {
  time: number
  text: string
}

type Props = {
  lrc?: string
  currentTime?: number
}

function parseLrc(lrc: string): LyricLine[] {
  if (!lrc) return []

  return lrc
    .split('\n')
    .map((line) => {
      const match = line.match(/\[(\d+):(\d+)(?:\.(\d+))?\](.*)/)

      if (!match) return null

      const min = Number(match[1])
      const sec = Number(match[2])
      const ms = Number(match[3] || 0)

      return {
        time: min * 60 + sec + ms / 1000,
        text: match[4].trim(),
      }
    })
    .filter(Boolean) as LyricLine[]
}

export default function LyricsView({ lrc = '', currentTime = 0 }: Props) {
  const lyrics = useMemo(() => {
    const arr = parseLrc(lrc)

    // 补充空行，避免第一行歌词过早高亮
    const hasEmptyHead = arr[0]?.text.trim() === '' && arr[0].time === 0
    return hasEmptyHead ? arr : [{ time: 0, text: '' }, ...arr]
  }, [lrc])

  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const index = lyrics.findIndex((line, i) => {
      const next = lyrics[i + 1]

      if (!next) {
        return currentTime >= line.time
      }

      return currentTime >= line.time && currentTime < next.time
    })

    if (index !== -1) {
      setActiveIndex(index)
    } else {
      setActiveIndex(0)
    }
  }, [currentTime, lyrics])

  const visibleLyrics = useMemo(() => {
    const maxVisible = 7 // 最多显示的歌词行数 2n+1
    return lyrics.slice(
      Math.max(activeIndex - Math.floor(maxVisible / 2), 0),
      Math.min(activeIndex + Math.floor(maxVisible / 2) + 1, lyrics.length),
    )
  }, [activeIndex, lyrics])

  return (
    <div className='relative flex h-80 items-center justify-center overflow-hidden'>
      <div className='flex w-full flex-col items-center justify-center gap-4'>
        <AnimatePresence mode='popLayout'>
          {visibleLyrics.map((line) => {
            const realIndex = lyrics.findIndex((l) => l.time === line.time)
            const active = realIndex === activeIndex

            return (
              <motion.div
                key={line.time}
                layout
                initial={{
                  opacity: 0,
                  y: 30,
                  scale: 0.9,
                }}
                animate={{
                  opacity: active ? 1 : 0.75,
                  y: 0,
                  scale: active ? 1 : 0.9,
                }}
                exit={{
                  opacity: 0,
                  y: -30,
                  scale: 0.8,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 280,
                  damping: 30,
                }}
                className={cls(
                  'max-w-[90%] origin-center px-4 text-center leading-relaxed wrap-break-word whitespace-pre-wrap will-change-transform select-none',
                  active ? 'ui-text-shadow text-3xl font-bold text-white' : 'text-2xl font-medium text-zinc-50',
                )}
              >
                <span className={cls(line.text.trim() ? 'opacity-100' : 'opacity-0')}>{line.text || 'is empty'}</span>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
