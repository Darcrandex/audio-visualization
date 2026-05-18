import { ConfigProvider, theme } from 'antd'
import FullPlayer from './components/FullPlayer'

export default function App() {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#34d399' }, algorithm: theme.darkAlgorithm }}>
      <header className='fixed top-2 left-2 z-10 flex items-center'>
        <img src='/logo-512.png' className='mr-2 h-10 w-10 object-contain' />
        <h1 className='font-silent-forest text-4xl text-white'>Sound Vizor</h1>
      </header>

      <FullPlayer />
    </ConfigProvider>
  )
}
