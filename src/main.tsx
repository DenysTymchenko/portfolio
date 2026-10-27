import '@fontsource/nunito/400.css'
import '@fontsource/nunito/800.css'
import '@fontsource/jetbrains-mono/400.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { useAppState } from './state/appState'
import { panda } from './state/pandaState'
import './styles.css'

if (import.meta.env.DEV) Object.assign(window, { __panda: panda, __appState: useAppState }) // for debugging in devtools

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
