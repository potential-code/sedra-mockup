import { createHashHistory, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

// Hash routing: deep links work from static hosting in any sub-folder (no SPA fallback).
export const router = createRouter({
  routeTree,
  history: createHashHistory(),
  defaultPreload: 'intent',
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
  interface StaticDataRouteOption {
    /** i18n key for the document title, e.g. 'learner:dashboard.title' */
    titleKey?: string
  }
}
