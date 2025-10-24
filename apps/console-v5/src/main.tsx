import { StrictMode } from 'react'
import * as ReactDOM from 'react-dom/client'
import '../../../libs/shared/ui/src/lib/styles/main.scss'
import App from './app/app'
import { ThemeProvider } from './app/components/theme-provider/theme-provider'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
)
