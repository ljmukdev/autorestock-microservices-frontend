import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import RegisterPage from './pages/RegisterPage'
import SettingsPage from './pages/SettingsPage'
import AliasPage from './pages/AliasPage'
import StatusPage from './pages/StatusPage'
import HomePage from './pages/HomePage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/alias" element={<AliasPage />} />
        <Route path="/status" element={<StatusPage />} />
      </Routes>
    </Layout>
  )
}

export default App

