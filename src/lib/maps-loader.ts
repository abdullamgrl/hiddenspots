let loadPromise: Promise<void> | null = null

export function loadGoogleMaps(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps cannot be loaded on the server side.'))
  }

  if (window.google?.maps) {
    return Promise.resolve()
  }

  if (loadPromise) {
    return loadPromise
  }

  loadPromise = new Promise((resolve, reject) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      loadPromise = null
      reject(new Error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not defined.'))
      return
    }

    const scriptId = 'google-maps-sdk'
    if (document.getElementById(scriptId)) {
      const interval = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(interval)
          resolve()
        }
      }, 100)
      return
    }

    const script = document.createElement('script')
    script.id = scriptId
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=en&region=IN`
    script.async = true;
    script.defer = true;

    script.onload = () => {
      resolve()
    }

    script.onerror = () => {
      loadPromise = null
      reject(new Error('Failed to load Google Maps SDK.'))
    }

    document.head.appendChild(script)
  })

  return loadPromise
}
