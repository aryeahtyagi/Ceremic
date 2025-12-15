import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { API_URL } from './config/api'

// Dynamically set favicon using API_URL so it works for localhost and production
const setFaviconFromApi = () => {
  try {
    const base = (API_URL || '').replace(/\/+$/, '')
    const href = `${base}/image/8`

    let link = document.querySelector("link[rel='icon']")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.type = 'image/png'
    link.href = href
  } catch (e) {
    console.error('Error setting favicon from API_URL:', e)
  }
}

setFaviconFromApi()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)


