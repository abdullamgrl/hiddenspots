'use client'

import { useEffect } from 'react'

export function PWARegister() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('HiddenSpot ServiceWorker registered with scope: ', reg.scope)
          })
          .catch((err) => {
            console.error('HiddenSpot ServiceWorker registration failed: ', err)
          })
      })
    }
  }, [])

  return null
}
