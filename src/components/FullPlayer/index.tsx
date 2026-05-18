import { Button, Drawer, Form, Input } from 'antd'
import { clamp, round } from 'es-toolkit'
import { Pause, Play, Settings2, Square } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { AudioVisualizer, formatTime } from './utils'
import LyricsView from '../LyricsView'
import './styles.css'

const defaultBg = 'https://picsum.photos/1920/1080?blur=10'

export default function FullPlayer() {
  // 配置表单
  const [open, setOpen] = useState(false)

  const audioInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [audioFilename, setAudioFilename] = useState('')
  const [imageFilename, setImageFilename] = useState('')
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const [lrc, setLrc] = useState('')

  const [audioDuration, setAudioDuration] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const timeProgress = audioDuration ? `${round((currentTime / audioDuration) * 100, 2)}%` : '0%'

  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const visualizerRef = useRef<AudioVisualizer>()
  const [isPlaying, setIsPlaying] = useState(false)

  // 初始化可视化器
  useEffect(() => {
    if (audioRef.current && canvasRef.current) {
      visualizerRef.current = new AudioVisualizer(audioRef.current, canvasRef.current)
    }
    return () => visualizerRef.current?.destroy()
  }, [])

  const onSelectAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && visualizerRef.current) {
      setAudioFilename(file.name)
      await visualizerRef.current.loadFile(file)
    }
  }

  const onSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setImageFilename(file.name)
      const imageUrl = URL.createObjectURL(file)
      setBackgroundImage(imageUrl)
    }
  }

  const onTogglePlay = () => {
    if (!audioRef.current || !audioRef.current.src) {
      setOpen(true)
      return
    }

    if (audioRef.current?.paused) {
      visualizerRef.current?.play()
      setIsPlaying(true)
    } else {
      visualizerRef.current?.pause()
      setIsPlaying(false)
    }
  }

  const onResetPlay = async () => {
    if (!audioRef.current || !audioRef.current.src) {
      setOpen(true)
      return
    }

    visualizerRef.current?.reset()
    setIsPlaying(false)
  }

  const progressRef = useRef<HTMLDivElement>(null)
  const [sliderLeft, setSliderLeft] = useState(0)

  const onProgessHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) {
      return
    }

    const { left = 0, width = 0 } = progressRef.current?.getBoundingClientRect() || {}
    const percent = round(clamp((e.clientX - left) / width, 0, 1), 2)
    setSliderLeft(percent * width)
  }

  const seekToByPercent = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !audioRef.current.src) {
      return
    }

    if (visualizerRef.current) {
      const { left = 0, width = 0 } = progressRef.current?.getBoundingClientRect() || {}
      const percent = round(clamp((e.clientX - left) / width, 0, 1), 2)
      visualizerRef.current.seekTo(percent * audioDuration)
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        controls
        className='hidden'
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setAudioDuration(audioRef.current.duration)
          }
        }}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime)
          }
        }}
        onEnded={onResetPlay}
      />

      <Drawer title='Settings' open={open} width={560} onClose={() => setOpen(false)}>
        <Form layout='vertical'>
          <Form.Item label='Audio' required>
            <input ref={audioInputRef} type='file' accept='audio/*' onChange={onSelectAudio} hidden />
            <Button disabled={isPlaying} onClick={() => audioInputRef.current?.click()}>
              Upload Audio File
            </Button>
            <p className='mt-2 text-sm text-gray-500'>Current File: {audioFilename || 'none'}</p>
          </Form.Item>

          <Form.Item label='Background Image'>
            <input ref={imageInputRef} type='file' accept='image/*' hidden onChange={onSelectImage} />
            <Button onClick={() => imageInputRef.current?.click()}>Upload Image File</Button>
            <p className='mt-2 text-sm text-gray-500'>Current File: {imageFilename || 'none'}</p>
          </Form.Item>

          <Form.Item label='Title'>
            <Input value={title} maxLength={100} allowClear onChange={(e) => setTitle(e.target.value)} />
          </Form.Item>

          <Form.Item label='Subtitle'>
            <Input.TextArea
              rows={3}
              maxLength={500}
              showCount
              allowClear
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </Form.Item>

          <Form.Item label='Lyrics'>
            <Input.TextArea rows={10} showCount allowClear value={lrc} onChange={(e) => setLrc(e.target.value)} />
          </Form.Item>
        </Form>
      </Drawer>

      <section className='flex h-screen w-screen flex-col select-none'>
        <img
          src={backgroundImage || defaultBg}
          alt=''
          className='fixed bottom-0 left-0 block h-full w-full object-cover'
        />

        <main className='relative my-auto px-4 text-white'>
          <h1 className='ui-text-shadow font-kaushan-script relative mx-auto w-3xl text-center text-3xl font-bold'>
            {title || 'Title'}
          </h1>
          <p className='ui-text-shadow font-libre-baskerville relative mx-auto mt-6 w-3xl text-center text-2xl italic'>
            {subtitle || 'Subtitle'}
          </p>
        </main>

        <LyricsView lrc={lrc} currentTime={currentTime} />

        <section className='relative mb-8 px-4'>
          <canvas ref={canvasRef} className='relative mx-auto h-32 w-3xl' />
        </section>

        <footer className='w-full bg-black/25 px-4 py-8 backdrop-blur-sm'>
          <div className='relative mx-auto flex w-3xl max-w-full items-center text-white'>
            <span className='w-16 text-sm'>{formatTime(currentTime)}</span>
            <div
              ref={progressRef}
              className='group relative h-3 w-full'
              onMouseMove={onProgessHover}
              onClick={seekToByPercent}
            >
              <i className='absolute top-1 left-0 h-1 w-full rounded-full bg-white/25'></i>
              <i style={{ width: timeProgress }} className='absolute top-1 left-0 h-1 rounded-full bg-white'></i>
              <i
                style={{ left: sliderLeft }}
                className='pointer-events-none absolute top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-white opacity-0 transition-opacity group-hover:opacity-100'
              ></i>
            </div>
            <span className='w-16 text-right text-sm'>{formatTime(audioDuration)}</span>
          </div>

          <nav className='mx-auto mt-6 flex w-3xl max-w-full items-center justify-center space-x-4 text-white'>
            {isPlaying ? (
              <Pause size={32} className='ui-ctrl-button' onClick={onTogglePlay} />
            ) : (
              <Play size={32} className='ui-ctrl-button' onClick={onTogglePlay} />
            )}

            <Square size={32} className='ui-ctrl-button' onClick={onResetPlay} />
            <Settings2 size={32} className='ui-ctrl-button' onClick={() => setOpen(true)} />
          </nav>
        </footer>
      </section>
    </>
  )
}
