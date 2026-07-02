'use client'

import { useState, useEffect, useRef } from 'react'
import type {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
  FieldErrors,
} from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { MapPin, Search, Loader2, Locate } from 'lucide-react'
import { loadGoogleMaps } from '@/lib/maps-loader'
import type { SpotFormValues } from './add-spot-form'

interface LocationPickerProps {
  register: UseFormRegister<SpotFormValues>
  setValue: UseFormSetValue<SpotFormValues>
  watch: UseFormWatch<SpotFormValues>
  errors: FieldErrors<SpotFormValues>
  states: { id: string; name: string; slug: string; code: string }[]
  districts: { id: string; state_id: string; name: string; slug: string }[]
  // True when the location step is the active wizard step (controls map init)
  active: boolean
}

const darkMapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#12131a' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8ec3b9' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1a1b26' }],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ color: '#2c2e3e' }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0d9488' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#1c1e2d' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#a8ebd0' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#0b2820' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#34d399' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#24283b' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ab8b2' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#1f3a38' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0d9488' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#091c18' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#31645a' }],
  },
]

export function LocationPicker({
  register,
  setValue,
  watch,
  errors,
  states,
  districts,
  active,
}: LocationPickerProps) {
  // Google Maps autocompletion state
  const [geoQuery, setGeoQuery] = useState('')
  const [geoSuggestions, setGeoSuggestions] = useState<any[]>([])
  const [searchingGeo, setSearchingGeo] = useState(false)

  const [mapsApiLoaded, setMapsApiLoaded] = useState(false)
  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null)
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null)
  const [detectingGps, setDetectingGps] = useState(false)

  useEffect(() => {
    loadGoogleMaps()
      .then(() => {
        setMapsApiLoaded(true)
      })
      .catch((err) => {
        console.error('Error loading Google Maps for form:', err)
      })
  }, [])

  // Cost controls for the one approved Google surface: a session token spans
  // all keystrokes of one search and is closed by the Place Details call on
  // selection (session-based billing), and requests are debounced so we never
  // fire per-keystroke.
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null)
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null)
  const geoDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (mapsApiLoaded) {
      setAutocompleteService(new google.maps.places.AutocompleteService())
      setGeocoder(new google.maps.Geocoder())
      placesServiceRef.current = new google.maps.places.PlacesService(
        document.createElement('div')
      )
    }
  }, [mapsApiLoaded])

  useEffect(() => {
    return () => {
      if (geoDebounceRef.current) clearTimeout(geoDebounceRef.current)
    }
  }, [])

  // Coordinates are set programmatically (search / GPS / map pin) rather than via
  // visible inputs, so register them explicitly to keep validation + trigger() working.
  useEffect(() => {
    register('latitude', { valueAsNumber: true })
    register('longitude', { valueAsNumber: true })
  }, [register])

  // Filter districts based on selected state
  const selectedStateId = watch('state_id')
  const filteredDistricts = districts.filter((d) => d.state_id === selectedStateId)

  // Debounced Places Autocomplete search (session-token billed)
  const handleGeoSearch = (val: string) => {
    setGeoQuery(val)
    if (geoDebounceRef.current) clearTimeout(geoDebounceRef.current)

    if (val.length < 3) {
      setGeoSuggestions([])
      return
    }

    if (!autocompleteService) return

    geoDebounceRef.current = setTimeout(() => {
      if (!sessionTokenRef.current) {
        sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken()
      }
      setSearchingGeo(true)
      autocompleteService.getPlacePredictions(
        {
          input: val,
          componentRestrictions: { country: 'in' },
          sessionToken: sessionTokenRef.current,
        },
        (predictions, status) => {
          setSearchingGeo(false)
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setGeoSuggestions(predictions)
          } else {
            setGeoSuggestions([])
          }
        }
      )
    }, 350)
  }

  // Autofill state/district selects from resolved address components.
  const applyAddressComponents = (components: google.maps.GeocoderAddressComponent[]) => {
    const administrativeArea1 = components.find((c) =>
      c.types.includes('administrative_area_level_1')
    )
    const administrativeArea2 = components.find((c) =>
      c.types.includes('administrative_area_level_2')
    )

    if (administrativeArea1) {
      const stateName = administrativeArea1.long_name.toLowerCase()
      const matchedState = states.find(
        (s) =>
          s.name.toLowerCase().includes(stateName) ||
          stateName.includes(s.name.toLowerCase())
      )
      if (matchedState) {
        setValue('state_id', matchedState.id, { shouldValidate: true })

        if (administrativeArea2) {
          const districtName = administrativeArea2.long_name.toLowerCase()
          const matchedDistrict = districts.find(
            (d) =>
              d.state_id === matchedState.id &&
              (d.name.toLowerCase().includes(districtName) ||
                districtName.includes(d.name.toLowerCase()))
          )
          if (matchedDistrict) {
            setValue('district_id', matchedDistrict.id, { shouldValidate: true })
          }
        }
      }
    }
  }

  const handleSelectSuggestion = (suggestion: any) => {
    const placesService = placesServiceRef.current
    if (!placesService) return

    setGeoQuery(suggestion.description)
    setGeoSuggestions([])

    // Place Details (limited fields) closes the autocomplete session, so the
    // whole search bills as one session instead of per-request.
    placesService.getDetails(
      {
        placeId: suggestion.place_id,
        fields: ['geometry.location', 'formatted_address', 'address_components'],
        sessionToken: sessionTokenRef.current ?? undefined,
      },
      (place, status) => {
        sessionTokenRef.current = null
        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          place?.geometry?.location
        ) {
          const location = place.geometry.location
          setValue('latitude', location.lat(), { shouldValidate: true })
          setValue('longitude', location.lng(), { shouldValidate: true })
          setValue('address', place.formatted_address ?? suggestion.description, {
            shouldValidate: true,
          })
          applyAddressComponents(place.address_components ?? [])
        } else {
          toast.error('Could not resolve the selected location')
        }
      }
    )
  }

  // Detect GPS location with browser geolocation
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }

    setDetectingGps(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setValue('latitude', latitude, { shouldValidate: true })
        setValue('longitude', longitude, { shouldValidate: true })

        toast.success(`GPS Location detected: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
        setDetectingGps(false)

        if (geocoder) {
          geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
              setValue('address', results[0].formatted_address, { shouldValidate: true })

              applyAddressComponents(results[0].address_components || [])
            }
          })
        }
      },
      (error) => {
        console.error('GPS error:', error)
        toast.error(`Unable to retrieve your location: ${error.message}`)
        setDetectingGps(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  const formMapContainerRef = useRef<HTMLDivElement>(null)
  const formMapRef = useRef<google.maps.Map | null>(null)
  const formMarkerRef = useRef<google.maps.Marker | null>(null)

  const formLat = watch('latitude')
  const formLng = watch('longitude')

  useEffect(() => {
    if (!active || !mapsApiLoaded || !formMapContainerRef.current) {
      formMapRef.current = null
      formMarkerRef.current = null
      return
    }

    if (!formMapRef.current) {
      const initialLat = formLat || 11.68
      const initialLng = formLng || 76.13

      const mapOptions: google.maps.MapOptions = {
        center: { lat: initialLat, lng: initialLng },
        zoom: formLat && formLng ? 13 : 9,
        styles: darkMapStyle,
        gestureHandling: 'cooperative',
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      }

      const map = new google.maps.Map(formMapContainerRef.current, mapOptions)
      formMapRef.current = map

      const marker = new google.maps.Marker({
        position: { lat: initialLat, lng: initialLng },
        map: map,
        draggable: true,
        title: 'Drag or click map to pin hidden spot',
        icon: {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
          fillColor: '#10b981',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 1.5,
          scale: 1.8,
          anchor: new google.maps.Point(12, 22),
        },
      })
      formMarkerRef.current = marker

      marker.addListener('dragend', () => {
        const pos = marker.getPosition()
        if (pos) {
          const lat = pos.lat()
          const lng = pos.lng()
          setValue('latitude', lat, { shouldValidate: true })
          setValue('longitude', lng, { shouldValidate: true })

          if (geocoder) {
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
              if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
                setValue('address', results[0].formatted_address, { shouldValidate: true })
              }
            })
          }
        }
      })

      map.addListener('click', (e: google.maps.MapMouseEvent) => {
        const latLng = e.latLng
        if (latLng) {
          const lat = latLng.lat()
          const lng = latLng.lng()
          setValue('latitude', lat, { shouldValidate: true })
          setValue('longitude', lng, { shouldValidate: true })
          marker.setPosition(latLng)

          if (geocoder) {
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
              if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
                setValue('address', results[0].formatted_address, { shouldValidate: true })
              }
            })
          }
        }
      })
    }
  }, [active, mapsApiLoaded])

  useEffect(() => {
    if (formMapRef.current && formMarkerRef.current && formLat && formLng) {
      const currentPos = formMarkerRef.current.getPosition()
      if (currentPos) {
        const diffLat = Math.abs(currentPos.lat() - formLat)
        const diffLng = Math.abs(currentPos.lng() - formLng)
        if (diffLat > 0.000001 || diffLng > 0.000001) {
          const newPos = new google.maps.LatLng(formLat, formLng)
          formMarkerRef.current.setPosition(newPos)
          formMapRef.current.panTo(newPos)
        }
      }
    }
  }, [formLat, formLng])

  const hasPin = !!formLat && !!formLng && !(formLat === 0 && formLng === 0)

  return (
    <>
      <h3 className="font-heading text-lg font-bold text-foreground">Step 2: Location Details</h3>
      <p className="text-xs text-muted-foreground -mt-2">
        Search for the place or use your current location, then drag the pin to the exact spot.
      </p>

      {/* Primary location inputs: search + one-tap current location */}
      <div className="space-y-1.5 relative">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Find the location</label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Type location, town, or landmark name..."
              value={geoQuery}
              onChange={(e) => handleGeoSearch(e.target.value)}
              className="pl-9 glass"
            />
            {searchingGeo && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleDetectGPS}
            disabled={detectingGps}
            className="flex items-center justify-center space-x-2 border-emerald-600/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600/10 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all font-semibold whitespace-nowrap"
          >
            {detectingGps ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Detecting...</span>
              </>
            ) : (
              <>
                <Locate className="h-4 w-4" />
                <span>Use current location</span>
              </>
            )}
          </Button>
        </div>

        {geoSuggestions.length > 0 && (
          <div className="absolute z-30 w-full mt-1 rounded-md border border-border bg-card shadow-lg max-h-60 overflow-y-auto glass">
            {geoSuggestions.map((s: any) => (
              <button
                key={s.place_id}
                type="button"
                onClick={() => handleSelectSuggestion(s)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center space-x-2"
              >
                <MapPin className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span className="truncate">{s.description}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">State</label>
          <Select
            value={watch('state_id')}
            onValueChange={(val) => {
              setValue('state_id', val as string)
              setValue('district_id', '') // Clear district on state change
            }}
          >
            <SelectTrigger className="glass">
              <SelectValue placeholder="State">
                {states.find((st) => st.id === watch('state_id'))?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="glass">
              {states.map((st) => (
                <SelectItem key={st.id} value={st.id}>
                  {st.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.state_id && <span className="text-xs text-destructive">{errors.state_id.message}</span>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">District</label>
          <Select
            value={watch('district_id')}
            onValueChange={(val) => setValue('district_id', val as string)}
            disabled={!selectedStateId}
          >
            <SelectTrigger className="glass">
              <SelectValue placeholder="District">
                {districts.find((dst) => dst.id === watch('district_id'))?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="glass">
              {filteredDistricts.map((dst) => (
                <SelectItem key={dst.id} value={dst.id}>
                  {dst.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.district_id && <span className="text-xs text-destructive">{errors.district_id.message}</span>}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Address</label>
        <Input
          {...register('address')}
          placeholder="Detailed route coordinates description"
          className="glass"
        />
        {errors.address && <span className="text-xs text-destructive">{errors.address.message}</span>}
      </div>

      {/* Click-to-Pin Interactive Map — the confirmed source of truth */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Confirm exact spot (tap to pin / drag marker)
        </label>
        <div
          ref={formMapContainerRef}
          className="h-64 w-full rounded-xl overflow-hidden border border-border/50 shadow-inner bg-muted"
        />
        <div className="flex items-center justify-between gap-2 pt-0.5">
          {hasPin ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <MapPin className="h-3.5 w-3.5" />
              Pinned at {formLat.toFixed(5)}, {formLng.toFixed(5)}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">No location set yet</span>
          )}
        </div>
        {errors.latitude && <span className="text-xs text-destructive">{errors.latitude.message}</span>}
      </div>
    </>
  )
}
