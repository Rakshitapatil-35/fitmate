import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ToastProvider } from './components/Feedback.jsx'
import { applyThemeToDOM, loadThemeSettings } from './themeStore.js'

// Apply persistent theme settings on boot before first paint
applyThemeToDOM(loadThemeSettings())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider><App /></ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
