import { ConfigProvider, theme } from 'antd'
import MusicVisualizer from './components/MusicVisualizer'

export default function App() {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#34d399' }, algorithm: theme.darkAlgorithm }}>
      <header className='fixed top-2 left-2 flex items-center'>
        <img src='/logo-512.png' className='w-10 h-10 mr-4 object-contain' />
        <h1 className='font-silent-forest text-4xl text-white'>Sound Vizor</h1>
      </header>

      <MusicVisualizer />
    </ConfigProvider>
  )
}
