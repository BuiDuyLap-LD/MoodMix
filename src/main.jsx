import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AudioProvider } from './context/AudioContext'
import { SettingsProvider } from './context/SettingsContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SettingsProvider>
      <AudioProvider>
        <App />
      </AudioProvider>
    </SettingsProvider>
  </StrictMode>,
)
