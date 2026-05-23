import { ConfigProvider, theme } from 'antd'
import { createBrowserRouter, RouterProvider } from 'react-router'
import Home from './pages/Home'
import PromptCreator from './pages/PromptCreator'

const routes = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/prompt-creator', element: <PromptCreator /> },
])

export default function App() {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#34d399' }, algorithm: theme.darkAlgorithm }}>
      <RouterProvider router={routes} />
    </ConfigProvider>
  )
}
