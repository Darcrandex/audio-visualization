import { ConfigProvider, theme } from 'antd'
import MusicVisualizer from './components/MusicVisualizer'

export default function App() {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#34d399' }, algorithm: theme.darkAlgorithm }}>
      <MusicVisualizer />
    </ConfigProvider>
  )
}
