import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster 
      position="top-right" 
      toastOptions={{
        className: 'rounded-2xl shadow-lg border border-gray-100 font-medium',
        success: { duration: 3000, iconTheme: { primary: '#34C759', secondary: '#fff' } },
        error: { duration: 4000, iconTheme: { primary: '#FF3B30', secondary: '#fff' } }
      }} 
    />
  </StrictMode>,
)
