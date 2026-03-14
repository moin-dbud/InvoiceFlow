import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CompanySettingsProvider } from './context/CompanySettingsContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CompanySettingsProvider>
      <App />
    </CompanySettingsProvider>
  </StrictMode>,
)
