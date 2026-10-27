import { useEffect } from 'react'
import { createBrowserRouter, Outlet, useNavigate } from 'react-router-dom'
import { HomePage } from './pages/home/Page'
import { RadarPage } from './pages/radar/Page'
import { CopilotPage } from './pages/copilot/Page'
import { WorkspacePage } from './pages/workspace/Page'
import { LegacyRedirect } from './lib/legacyRoutes'
import { setNavigator } from './lib/model'

function RootLayout() {
  const navigate = useNavigate()
  useEffect(() => {
    setNavigator((to) => navigate(to))
    return () => setNavigator(null)
  }, [navigate])
  return <Outlet />
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/radar', element: <RadarPage /> },
      { path: '/copilot', element: <CopilotPage /> },
      { path: '/workspace', element: <WorkspacePage /> },
      { path: '/Outmate Radar.dc.html', element: <LegacyRedirect to="/radar" /> },
      { path: '/Outmate Copilot v2.dc.html', element: <LegacyRedirect to="/copilot" /> },
      { path: '/Outmate Workspace v3.dc.html', element: <LegacyRedirect to="/workspace" /> },
      { path: '/index.html', element: <LegacyRedirect to="/" /> },
      { path: '*', element: <LegacyRedirect to="/" /> },
    ],
  },
])
