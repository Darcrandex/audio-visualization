import defImgUrl from '@/assets/images/default-img.png'
import { cls } from '@/utils/cls'
import { PauseCircleFilled, PlayCircleFilled } from '@ant-design/icons'
import { Button, Drawer, Form, Input } from 'antd'
import { clamp, delay, round } from 'es-toolkit'
import { useEffect, useRef, useState } from 'react'

import './styles.css'
import { AudioVisualizer } from './utils'

// 格式化时间（秒 -> MM:SS）
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export default function MusicVisualizer() {
  const [open, setOpen] = useState(false)

  const audioInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [audioFilename, setAudioFilename] = useState('')
  const [imageFilename, setImageFilename] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
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

  const [coverClassName, setCoverClassName] = useState('')
  const onTogglePlay = () => {
    if (!audioRef.current || !audioRef.current.src) {
      setOpen(true)
      return
    }

    if (audioRef.current?.paused) {
      visualizerRef.current?.play()
      setIsPlaying(true)
      setCoverClassName('ui-film-cover ui-film-cover--playing')
    } else {
      visualizerRef.current?.pause()
      setIsPlaying(false)
      setCoverClassName('ui-film-cover ui-film-cover--paused')
    }
  }

  const onResetPlay = async () => {
    visualizerRef.current?.reset()
    setIsPlaying(false)
    setCoverClassName('')

    await delay(100)
    setCoverClassName('ui-film-cover ui-film-cover--paused')
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
      <nav className='fixed top-4 right-4'>
        <Button type='primary' size='large' onClick={() => setOpen(true)}>
          Settings
        </Button>
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
      </nav>

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
            <Input value={title} maxLength={30} allowClear onChange={(e) => setTitle(e.target.value)} />
          </Form.Item>

          <Form.Item label='Description'>
            <Input.TextArea
              rows={3}
              maxLength={200}
              showCount
              allowClear
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Drawer>

      <section className='flex h-screen items-center justify-center bg-black'>
        <main className='relative flex aspect-[calc(9/16)] w-xl flex-col items-center justify-center overflow-hidden bg-gray-300 text-white'>
          <img
            src={backgroundImage || defImgUrl}
            alt=''
            className='pointer-events-none absolute top-0 left-0 h-full w-full scale-120 object-cover blur-lg brightness-75'
          />

          <h1 className='relative mx-12 text-center text-2xl font-bold'>{title || 'Title'}</h1>
          <p className='relative mx-12 mt-6 mb-12 text-center'>{description || 'Description'}</p>

          <div className='ui-film-container group relative flex h-64 w-64 items-center justify-center overflow-hidden rounded-full border-2 border-black'>
            <img
              src={backgroundImage || defImgUrl}
              alt='music cover'
              className={cls('relative z-10 h-40 w-40 rounded-full border-2 border-black object-cover', coverClassName)}
            />

            <button
              className='absolute top-1/2 left-1/2 z-30 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-all group-hover:opacity-80'
              onClick={onTogglePlay}
            >
              {isPlaying ? <PauseCircleFilled className='text-5xl' /> : <PlayCircleFilled className='text-5xl' />}
            </button>
          </div>

          <canvas ref={canvasRef} className='relative h-24 w-96' />

          <footer className='relative mt-6 flex w-96 items-center'>
            <span className='w-16 text-xs'>{formatTime(currentTime)}</span>
            <div
              ref={progressRef}
              className='group relative h-3 w-full'
              onMouseMove={onProgessHover}
              onClick={seekToByPercent}
            >
              <i className='absolute top-1 left-0 h-1 w-full rounded-full bg-white/25'></i>
              <i style={{ width: timeProgress }} className='absolute top-1 left-0 h-1 rounded-full bg-white'></i>
              <i
                className='pointer-events-none absolute top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-white opacity-0 transition-opacity group-hover:opacity-100'
                style={{ left: sliderLeft }}
              ></i>
            </div>
            <span className='w-16 text-right text-xs'>{formatTime(audioDuration)}</span>
          </footer>
        </main>
      </section>
    </>
  )
}
