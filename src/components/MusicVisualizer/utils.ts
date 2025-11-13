export class AudioVisualizer {
  private audioCtx: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private source: MediaElementAudioSourceNode | null = null
  private dataArray: Uint8Array | null = null
  private canvasCtx: CanvasRenderingContext2D | null = null
  private animationId: number | null = null
  private audioElement: HTMLAudioElement
  private isPlaying = false

  constructor(audioElement: HTMLAudioElement, canvas: HTMLCanvasElement) {
    this.audioElement = audioElement
    this.canvasCtx = canvas.getContext('2d')
  }

  /** 初始化音频上下文和分析器 */
  private init() {
    if (this.audioCtx) return

    this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    this.analyser = this.audioCtx.createAnalyser()
    this.analyser.fftSize = 256 // 256 个频率 bin

    const bufferLength = this.analyser.frequencyBinCount
    this.dataArray = new Uint8Array(bufferLength)

    this.source = this.audioCtx.createMediaElementSource(this.audioElement)
    this.source.connect(this.analyser)
    this.analyser.connect(this.audioCtx.destination)
  }

  /** 加载用户上传的音频文件 */
  async loadFile(file: File) {
    const url = URL.createObjectURL(file)
    this.audioElement.src = url
    this.audioElement.load()
    this.reset()
  }

  /** 播放音频 */
  async play() {
    this.init()
    if (!this.audioCtx || !this.analyser) return

    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume()
    }

    await this.audioElement.play()
    this.isPlaying = true
    this.draw()
  }

  /** 暂停音频 */
  pause() {
    this.audioElement.pause()
    this.isPlaying = false
    if (this.animationId) cancelAnimationFrame(this.animationId)
  }

  /** 重置播放 */
  reset() {
    this.pause()
    this.audioElement.currentTime = 0

    if (this.canvasCtx) {
      const canvas = this.canvasCtx.canvas
      const { width, height } = canvas
      this.canvasCtx.clearRect(0, 0, width, height)
    }
  }

  /** 绘制频谱可视化 */
  private draw() {
    if (!this.canvasCtx || !this.analyser || !this.dataArray) return

    this.analyser.getByteFrequencyData(this.dataArray as any)

    const canvas = this.canvasCtx.canvas
    const { width, height } = canvas

    this.canvasCtx.clearRect(0, 0, width, height)
    // 绘制波形
    const barGap = 2
    const barWidth = 2

    let x = 0

    for (let i = 0; i < this.dataArray.length; i++) {
      const barHeight = Math.floor((this.dataArray[i] / 256) * height * 0.8)
      this.canvasCtx.fillStyle = '#fff'
      this.canvasCtx.fillRect(x, height - barHeight, barWidth, barHeight)
      x += barWidth + barGap
    }

    if (this.isPlaying) {
      this.animationId = requestAnimationFrame(() => this.draw())
    }
  }

  /** 销毁音频上下文 */
  destroy() {
    this.pause()
    this.audioCtx?.close()
    this.audioCtx = null
    this.source = null
    this.analyser = null
    this.dataArray = null
  }
}
