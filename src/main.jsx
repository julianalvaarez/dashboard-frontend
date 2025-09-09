import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { ContextAppProvider } from './context/ContextAppProvider.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ContextAppProvider>
        <App />
      </ContextAppProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
