import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/i18n'
import { PrefsSync } from '@/components/layout/PrefsSync'
import { TooltipProvider } from '@/components/ui/tooltip'
import { router } from './router'
import '@/styles/app.css'

const root = document.getElementById('root')
if (!root) throw new Error('Root element missing')

createRoot(root).render(
  <StrictMode>
    <PrefsSync />
    <TooltipProvider delayDuration={300}>
      <RouterProvider router={router} />
    </TooltipProvider>
  </StrictMode>,
)
