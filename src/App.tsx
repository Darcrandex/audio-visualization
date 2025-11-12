import { ConfigProvider } from 'antd'
import PlayerView from './components/PlayerView'

export default function App() {
  return (
    <>
      <ConfigProvider theme={{ token: { colorPrimary: '#34d399' } }}>
        <PlayerView />
      </ConfigProvider>
    </>
  )
}
