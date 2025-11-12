import { cls } from '@/utils/cls'
import { PauseCircleFilled, PlayCircleFilled } from '@ant-design/icons'
import { Button, Form, Modal } from 'antd'
import { atomWithStorage } from 'jotai/utils'
import React, { useEffect, useRef, useState } from 'react'

import { useAtom } from 'jotai'
import './styles.css'

const nameAtom = atomWithStorage<string>('audio-name', '')
const descAtom = atomWithStorage<string>('audio-desc', '')

const PlayerView: React.FC = () => {
  // 状态管理
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioDuration, setAudioDuration] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const [name, setName] = useAtom(nameAtom)
  const [desc, setDesc] = useAtom(descAtom)

  // 引用
  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const animationRef = useRef<number>(0)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const backgroundInputRef = useRef<HTMLInputElement>(null)

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file)
      resetAudio()

      // 创建音频URL并设置给audio元素
      if (audioRef.current) {
        audioRef.current.src = URL.createObjectURL(file)
        audioRef.current.load()
      }
    }
  }

  // 处理背景图上传
  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file)
      setBackgroundImage(imageUrl)
    }
  }

  // 重置音频状态
  const resetAudio = () => {
    setIsPlaying(false)
    setCurrentTime(0)
    cancelAnimationFrame(animationRef.current)

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
  }

  // 初始化音频上下文和分析器
  const initAudioContext = () => {
    if (!audioRef.current) return

    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    analyserRef.current = audioContextRef.current.createAnalyser()
    sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current)

    // 配置分析器
    analyserRef.current.fftSize = 2048
    analyserRef.current.connect(audioContextRef.current.destination)
    sourceRef.current.connect(analyserRef.current)
  }

  // 处理播放/暂停
  const togglePlay = () => {
    if (!audioRef.current || !audioFile) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      cancelAnimationFrame(animationRef.current)
    } else {
      // 确保音频上下文已初始化
      if (!audioContextRef.current) {
        initAudioContext()
      } else if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume()
      }

      audioRef.current.play()
      setIsPlaying(true)
      visualize()
    }
  }

  // 音频可视化
  const visualize = () => {
    if (!canvasRef.current || !analyserRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    // 设置Canvas尺寸
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // 绘制函数
    const draw = () => {
      animationRef.current = requestAnimationFrame(draw)

      // 获取音频数据
      analyserRef.current?.getByteFrequencyData(dataArray)

      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 绘制波形
      const barGap = 2
      const barWidth = 2
      const skipCount = 0.5 * Math.floor(bufferLength / (canvas.width / (barWidth + barGap)))

      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        if (i % skipCount !== 0) continue
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8
        ctx.fillStyle = '#fff'
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)

        x += barWidth + barGap
      }
    }

    draw()
  }

  // 处理时间更新
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  // 格式化时间（秒 -> MM:SS）
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const timeProgress = audioDuration ? `${(currentTime / audioDuration) * 100}%` : '0%'

  // 清理函数
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationRef.current)
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setAudioDuration(audioRef.current.duration)
          }
        }}
        onEnded={() => {
          setIsPlaying(false)
          cancelAnimationFrame(animationRef.current)
        }}
        className='hidden-audio-element'
      />

      <button
        className='fixed top-4 left-4 items-center justify-center rounded-md border-2 border-emerald-400 px-2 py-1 text-emerald-400 transition-colors hover:bg-emerald-400 hover:text-white'
        onClick={() => setOpenModal(true)}
      >
        Settings
      </button>

      <Modal title='Settings' open={openModal} onCancel={() => setOpenModal(false)} footer={null}>
        <Form layout='vertical'>
          <Form.Item label='Audio'>
            <input
              type='file'
              ref={fileInputRef}
              onChange={handleFileChange}
              accept='audio/*'
              className='w-full border border-emerald-400 p-2 focus:outline-none'
            />
          </Form.Item>

          <Form.Item label='Background Image'>
            <input
              type='file'
              ref={backgroundInputRef}
              onChange={handleBackgroundUpload}
              accept='image/*'
              className='w-full border border-emerald-400 p-2 focus:outline-none'
            />
          </Form.Item>

          <Form.Item label='Audio Name'>
            <input
              type='text'
              maxLength={50}
              placeholder='Enter audio name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='w-full border border-emerald-400 p-2 focus:outline-none'
            />
          </Form.Item>

          <Form.Item label='Audio Description'>
            <input
              type='text'
              maxLength={100}
              placeholder='Enter audio description'
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className='w-full border border-emerald-400 p-2 focus:outline-none'
            />
          </Form.Item>
        </Form>

        <footer className='text-right'>
          <Button type='primary' onClick={() => setOpenModal(false)}>
            OK
          </Button>
        </footer>
      </Modal>

      <section className='flex h-screen items-center justify-center overflow-hidden'>
        <div className='relative z-50 flex aspect-[calc(9/16)] w-xl flex-col items-center justify-center overflow-hidden bg-emerald-100'>
          <img
            src={backgroundImage || ''}
            alt=''
            className='absolute top-0 left-0 h-full w-full scale-125 object-cover blur-lg brightness-75'
          />

          <h1 className='relative z-10 cursor-default text-center text-2xl font-bold text-white'>
            {name || 'No Audio Selected'}
          </h1>

          <p className='relative z-10 m-12 text-center text-white'>{desc}</p>

          <section className='relative my-10 rounded-full select-none'>
            <div
              className={cls(
                'ui-record relative z-10 mx-auto flex h-72 w-72 items-center justify-center overflow-hidden rounded-full border-2 border-black bg-gray-950',
              )}
            >
              {!!backgroundImage && (
                <img
                  src={backgroundImage}
                  alt=''
                  className={cls(
                    'ui-player-cover relative z-50 h-52 w-52 rounded-full border-2 border-black object-cover',
                    isPlaying ? 'ui-player-cover--playing' : 'ui-player-cover--paused',
                  )}
                  onClick={togglePlay}
                />
              )}

              <i className='ui-highlight pointer-events-none absolute top-0 left-0 z-20 h-full w-full'></i>
              <i className='ui-highlight pointer-events-none absolute top-0 left-0 z-20 h-full w-full rotate-180'></i>
            </div>

            <div
              className='absolute top-0 left-0 z-50 flex h-full w-full items-center justify-center opacity-0 transition-all hover:opacity-80'
              onClick={togglePlay}
            >
              {isPlaying ? (
                <PauseCircleFilled className='text-6xl !text-white' />
              ) : (
                <PlayCircleFilled className='text-6xl !text-white' />
              )}
            </div>
          </section>

          <canvas ref={canvasRef} className='relative z-10 h-24 w-96' />

          <footer className='relative z-10 mt-10 flex w-96 items-center gap-2'>
            <span className='text-xs text-white'>{formatTime(currentTime)}</span>
            <div className='relative h-1 w-full rounded-full bg-white/25'>
              <i style={{ width: timeProgress }} className='absolute top-0 left-0 h-1 w-1 rounded-full bg-white'></i>
            </div>
            <span className='text-xs text-white'>{formatTime(audioDuration)}</span>
          </footer>
        </div>
      </section>
    </>
  )
}

export default PlayerView
