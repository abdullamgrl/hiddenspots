'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { compressImage } from '@/lib/image-compressor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import {
  MapPin,
  Image as ImageIcon,
  Sparkles,
  Search,
  CheckCircle,
  AlertTriangle,
  UploadCloud,
  Loader2,
  X,
  Locate,
} from 'lucide-react'
import { loadGoogleMaps } from '@/lib/maps-loader'

// Zod Schema for validation
const spotSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(80),
  description: z.string().optional().or(z.literal('')),
  short_description: z.string().min(10, 'Short description must be at least 10 characters').max(250),
  category_id: z.string().uuid('Please select a valid category'),
  state_id: z.string().uuid('Please select a state'),
  district_id: z.string().uuid('Please select a district'),
  address: z.string().min(5, 'Address is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  best_time_to_visit: z.string().optional(),
  difficulty_level: z.enum(['easy', 'moderate', 'challenging', 'extreme']).optional(),
  entry_fee: z.number().nonnegative(),
  parking_available: z.boolean(),
  family_friendly: z.boolean(),
  pet_friendly: z.boolean(),
  requires_trek: z.boolean(),
  trek_distance_km: z.number().nonnegative(),
  estimated_visit_duration: z.string().optional(),
  safety_notes: z.string().optional(),
  social_url: z.string().url('Please enter a valid Instagram or social URL').optional().or(z.literal('')),
})

type SpotFormValues = z.infer<typeof spotSchema>

interface AddSpotFormProps {
  categories: { id: string; name: string; slug: string }[]
  states: { id: string; name: string; slug: string; code: string }[]
  districts: { id: string; state_id: string; name: string; slug: string }[]
  userId: string
}

export function AddSpotForm({ categories, states, districts, userId }: AddSpotFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

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

  useEffect(() => {
    if (mapsApiLoaded) {
      setAutocompleteService(new google.maps.places.AutocompleteService())
      setGeocoder(new google.maps.Geocoder())
    }
  }, [mapsApiLoaded])

  // Image Upload state
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [compressing, setCompressing] = useState(false)

  // Duplicate Check warning state
  const [duplicateWarning, setDuplicateWarning] = useState<{
    confidence: number
    reason: string
    spotId: string
  } | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<SpotFormValues>({
    resolver: zodResolver(spotSchema),
    defaultValues: {
      title: '',
      description: '',
      short_description: '',
      address: '',
      latitude: 0.0,
      longitude: 0.0,
      entry_fee: 0,
      parking_available: false,
      family_friendly: false,
      pet_friendly: false,
      requires_trek: false,
      trek_distance_km: 0,
      social_url: '',
    },
  })

  // Watch fields for duplicate detection trigger
  const watchTitle = watch('title')
  const watchLat = watch('latitude')
  const watchLng = watch('longitude')
  const watchDistrict = watch('district_id')
  const watchSocial = watch('social_url')

  // Run duplicate check on field changes
  useEffect(() => {
    const runDuplicateCheck = async () => {
      if (!watchTitle || watchTitle.length < 5 || !watchLat || !watchLng || !watchDistrict) return

      try {
        const { data, error } = await supabase.rpc('check_duplicate_spot', {
          input_lat: watchLat,
          input_lon: watchLng,
          input_title: watchTitle,
          input_district_id: watchDistrict,
          input_social_urls: watchSocial ? [watchSocial] : [],
        })

        if (error) throw error

        if (data && data.length > 0) {
          const dup = data[0]
          setDuplicateWarning({
            confidence: dup.confidence_score,
            reason: dup.match_reason,
            spotId: dup.duplicate_spot_id,
          })
        } else {
          setDuplicateWarning(null)
        }
      } catch (err) {
        console.error('Error running duplicate check:', err)
      }
    }

    const timer = setTimeout(runDuplicateCheck, 800)
    return () => clearTimeout(timer)
  }, [watchTitle, watchLat, watchLng, watchDistrict, watchSocial, supabase])

  // Filter districts based on selected state
  const selectedStateId = watch('state_id')
  const filteredDistricts = districts.filter((d) => d.state_id === selectedStateId)

  // Geocoding search function using Google Maps Autocomplete
  const handleGeoSearch = async (val: string) => {
    setGeoQuery(val)
    if (val.length < 3) {
      setGeoSuggestions([])
      return
    }

    if (!autocompleteService) return

    setSearchingGeo(true)
    autocompleteService.getPlacePredictions(
      {
        input: val,
        componentRestrictions: { country: 'in' },
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
  }

  const handleSelectSuggestion = (suggestion: any) => {
    if (!geocoder) return

    const placeId = suggestion.place_id
    setGeoQuery(suggestion.description)
    setGeoSuggestions([])

    geocoder.geocode({ placeId: placeId }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        const location = results[0].geometry.location
        const lat = location.lat()
        const lng = location.lng()
        setValue('latitude', lat, { shouldValidate: true })
        setValue('longitude', lng, { shouldValidate: true })
        setValue('address', results[0].formatted_address, { shouldValidate: true })

        const components = results[0].address_components || []
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
      } else {
        toast.error('Geocoding failed for the selected location')
      }
    })
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

              const components = results[0].address_components || []
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

  useEffect(() => {
    if (step !== 2 || !mapsApiLoaded || !formMapContainerRef.current) {
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
  }, [step, mapsApiLoaded])

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

  // Handle Drag & Drop / Image Selection
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setCompressing(true)
      const filesArray = Array.from(e.target.files)
      try {
        const compressedArray = await Promise.all(
          filesArray.map(async (file) => {
            toast.info(`Compressing ${file.name}...`)
            return await compressImage(file)
          })
        )
        setSelectedImages((prev) => [...prev, ...compressedArray])
        toast.success('Images compressed to optimized WebP format!')
      } catch (err) {
        toast.error('Image compression failed')
      } finally {
        setCompressing(false)
      }
    }
  }

  const removeSelectedImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
  }

  // Navigation handlers
  const nextStep = async () => {
    let fieldsToValidate: any[] = []
    if (step === 1) {
      fieldsToValidate = ['title', 'short_description', 'description', 'category_id']
    } else if (step === 2) {
      fieldsToValidate = ['address', 'state_id', 'district_id', 'latitude', 'longitude']
    } else if (step === 3) {
      fieldsToValidate = ['difficulty_level', 'entry_fee', 'trek_distance_km']
    }

    const isValid = await trigger(fieldsToValidate)
    if (isValid) {
      setStep((prev) => prev + 1)
    } else {
      toast.error('Please correct the validation errors before moving on')
    }
  }

  const prevStep = () => {
    setStep((prev) => prev - 1)
  }

  // Submit Handler
  const onSubmit = async (values: SpotFormValues) => {
    if (selectedImages.length === 0) {
      toast.error('At least one cover photo is required!')
      return
    }

    setLoading(true)
    try {
      const spotId = crypto.randomUUID()
      const uploadedImageUrls: string[] = []

      // 1. Upload compressed images to Supabase Storage CDN
      for (let i = 0; i < selectedImages.length; i++) {
        const file = selectedImages[i]
        const filePath = `spots/${spotId}/${crypto.randomUUID()}.webp`
        
        const { error: uploadError } = await supabase.storage
          .from('spot-media')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('spot-media')
          .getPublicUrl(filePath)

        uploadedImageUrls.push(publicUrl)
      }

      // 2. Insert main spot record
      const slug = values.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')

      const { error: spotError } = await supabase.from('spots').insert({
        id: spotId,
        title: values.title,
        slug: slug,
        description: values.description || values.short_description,
        short_description: values.short_description,
        latitude: values.latitude,
        longitude: values.longitude,
        address: values.address,
        state_id: values.state_id,
        district_id: values.district_id,
        category_id: values.category_id,
        cover_image: uploadedImageUrls[0],
        created_by: userId,
        status: 'pending', // Queue for moderation review
        best_time_to_visit: values.best_time_to_visit || null,
        difficulty_level: values.difficulty_level || null,
        entry_fee: values.entry_fee,
        parking_available: values.parking_available,
        family_friendly: values.family_friendly,
        pet_friendly: values.pet_friendly,
        requires_trek: values.requires_trek,
        trek_distance_km: values.requires_trek ? values.trek_distance_km : 0,
        estimated_visit_duration: values.estimated_visit_duration || null,
        safety_notes: values.safety_notes || null,
      })

      if (spotError) throw spotError

      // 3. Insert rest gallery images
      if (uploadedImageUrls.length > 0) {
        const imageInserts = uploadedImageUrls.map((url, idx) => ({
          spot_id: spotId,
          image_url: url,
          is_cover: idx === 0,
        }))
        const { error: imagesError } = await supabase.from('spot_images').insert(imageInserts)
        if (imagesError) throw imagesError
      }

      // 4. Insert Social URL if available
      if (values.social_url) {
        const isReel = values.social_url.includes('/reel/')
        const { error: socialError } = await supabase.from('spot_social_links').insert({
          spot_id: spotId,
          platform: 'instagram',
          url: values.social_url,
        })
        if (socialError) throw socialError
      }

      // 5. Get creator username for profile redirection
      const { data: creatorProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single()

      toast.success('Spot submitted successfully! Queueing for moderator approval.')
      router.push(`/profile/${creatorProfile?.username || userId}`)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Submission failed. Please check connection.')
    } finally {
      setLoading(false)
    }
  }

  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  }

  return (
    <Card className="glass shadow-xl overflow-hidden border-border/50">
      <CardContent className="p-6 sm:p-8">
        {/* Progress Tracker Header */}
        <div className="relative flex justify-between items-center mb-8 max-w-xs mx-auto">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="relative z-10 flex flex-col items-center">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step >= num
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 scale-110'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {num}
              </div>
            </div>
          ))}
          <div className="absolute top-4 left-0 right-0 h-[2px] bg-muted -z-0">
            <div
              className="h-full bg-emerald-600 transition-all duration-300"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Duplicate Warning Banner */}
        {duplicateWarning && (
          <div className="mb-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 flex items-start space-x-3 text-sm animate-pulse">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold flex items-center gap-1.5">
                <span>Possible Duplicate Found ({duplicateWarning.confidence}% Confidence)</span>
              </div>
              <p className="mt-1 text-muted-foreground">{duplicateWarning.reason}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <AnimatePresence mode="wait" custom={step}>
            {step === 1 && (
              <motion.div
                key="step1"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <h3 className="font-heading text-lg font-bold text-foreground">Step 1: Spot Description</h3>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</label>
                  <Input
                    {...register('title')}
                    placeholder="E.g., Cheengeri Hills, Wayanad"
                    className="glass"
                  />
                  {errors.title && <span className="text-xs text-destructive">{errors.title.message}</span>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Short Description</label>
                  <Input
                    {...register('short_description')}
                    placeholder="Brief 1-2 sentence hook..."
                    className="glass"
                  />
                  {errors.short_description && <span className="text-xs text-destructive">{errors.short_description.message}</span>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Detailed Description (Optional)</label>
                  <Textarea
                    {...register('description')}
                    placeholder="Describe how to reach, what makes it special, and best spots to view..."
                    rows={4}
                    className="glass"
                  />
                  {errors.description && <span className="text-xs text-destructive">{errors.description.message}</span>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
                  <Select
                    value={watch('category_id')}
                    onValueChange={(val) => setValue('category_id', val as string)}
                  >
                    <SelectTrigger className="glass">
                      <SelectValue placeholder="Select travel category">
                        {categories.find((cat) => cat.id === watch('category_id'))?.name}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="glass">
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category_id && <span className="text-xs text-destructive">{errors.category_id.message}</span>}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <h3 className="font-heading text-lg font-bold text-foreground">Step 2: Location Details</h3>

                <div className="space-y-1.5 relative">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Search Location (Google Autocomplete)</label>
                  <div className="relative">
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Latitude</label>
                    <Input
                      type="number"
                      step="any"
                      {...register('latitude', { valueAsNumber: true })}
                      className="glass"
                    />
                    {errors.latitude && <span className="text-xs text-destructive">{errors.latitude.message}</span>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Longitude</label>
                    <Input
                      type="number"
                      step="any"
                      {...register('longitude', { valueAsNumber: true })}
                      className="glass"
                    />
                    {errors.longitude && <span className="text-xs text-destructive">{errors.longitude.message}</span>}
                  </div>
                </div>

                {/* GPS Capture Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDetectGPS}
                  disabled={detectingGps}
                  className="w-full flex items-center justify-center space-x-2 border-emerald-600/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600/10 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all font-semibold"
                >
                  {detectingGps ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Detecting Location...</span>
                    </>
                  ) : (
                    <>
                      <Locate className="h-4 w-4" />
                      <span>Detect Current GPS Location</span>
                    </>
                  )}
                </Button>

                {/* Click-to-Pin Interactive Map */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Pin Hidden Spot (Click to pin / Drag marker)
                  </label>
                  <div
                    ref={formMapContainerRef}
                    className="h-60 w-full rounded-xl overflow-hidden border border-border/50 shadow-inner bg-muted"
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <h3 className="font-heading text-lg font-bold text-foreground">Step 3: Travel Info & Social Embed</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Best Time To Visit</label>
                    <Input
                      {...register('best_time_to_visit')}
                      placeholder="E.g., Oct to Mar, Monsoons"
                      className="glass"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Difficulty Level</label>
                    <Select
                      value={watch('difficulty_level')}
                      onValueChange={(val) => setValue('difficulty_level', val as any)}
                    >
                      <SelectTrigger className="glass">
                        <SelectValue placeholder="Difficulty">
                          {watch('difficulty_level') === 'easy' && 'Easy (Family stroll)'}
                          {watch('difficulty_level') === 'moderate' && 'Moderate (Some climbing)'}
                          {watch('difficulty_level') === 'challenging' && 'Challenging (Steep trail)'}
                          {watch('difficulty_level') === 'extreme' && 'Extreme (For experts only)'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="glass">
                        <SelectItem value="easy">Easy (Family stroll)</SelectItem>
                        <SelectItem value="moderate">Moderate (Some climbing)</SelectItem>
                        <SelectItem value="challenging">Challenging (Steep trail)</SelectItem>
                        <SelectItem value="extreme">Extreme (For experts only)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 items-center">
                  <div className="flex items-center space-x-3 rounded-lg border border-border p-3 glass">
                    <Switch
                      id="parking"
                      checked={watch('parking_available')}
                      onCheckedChange={(checked) => setValue('parking_available', checked)}
                    />
                    <label htmlFor="parking" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer">
                      Parking Available
                    </label>
                  </div>

                  <div className="flex items-center space-x-3 rounded-lg border border-border p-3 glass">
                    <Switch
                      id="family"
                      checked={watch('family_friendly')}
                      onCheckedChange={(checked) => setValue('family_friendly', checked)}
                    />
                    <label htmlFor="family" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer">
                      Family Friendly
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 items-center">
                  <div className="flex items-center space-x-3 rounded-lg border border-border p-3 glass">
                    <Switch
                      id="pet"
                      checked={watch('pet_friendly')}
                      onCheckedChange={(checked) => setValue('pet_friendly', checked)}
                    />
                    <label htmlFor="pet" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer">
                      Pet Friendly
                    </label>
                  </div>

                  <div className="flex items-center space-x-3 rounded-lg border border-border p-3 glass">
                    <Switch
                      id="trek"
                      checked={watch('requires_trek')}
                      onCheckedChange={(checked) => setValue('requires_trek', checked)}
                    />
                    <label htmlFor="trek" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer">
                      Requires Trek
                    </label>
                  </div>
                </div>

                {watch('requires_trek') && (
                  <div className="space-y-1.5 animate-in fade-in duration-300">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trek Distance (Kilometers)</label>
                    <Input
                      type="number"
                      step="any"
                      {...register('trek_distance_km', { valueAsNumber: true })}
                      placeholder="Distance in km"
                      className="glass"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Instagram Post or Reel URL</label>
                  <Input
                    {...register('social_url')}
                    placeholder="https://www.instagram.com/p/... or /reel/..."
                    className="glass"
                  />
                  {errors.social_url && <span className="text-xs text-destructive">{errors.social_url.message}</span>}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <h3 className="font-heading text-lg font-bold text-foreground">Step 4: Upload Media</h3>

                {/* Drag and Drop Zone */}
                <div className="rounded-xl border-2 border-dashed border-border p-8 text-center bg-muted/20 hover:bg-muted/40 transition-colors relative cursor-pointer glass">
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg, image/png, image/webp"
                    onChange={handleImageChange}
                    disabled={compressing}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center">
                    {compressing ? (
                      <>
                        <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mb-3" />
                        <span className="text-sm font-semibold">Compressing images on-client...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="h-10 w-10 text-emerald-600 mb-3" />
                        <span className="text-sm font-semibold">Click or drag images here to upload</span>
                        <span className="text-xs text-muted-foreground mt-1">JPEG, PNG, WebP format. Maximum 5MB.</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Image Previews */}
                {selectedImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
                    {selectedImages.map((file, idx) => (
                      <div key={idx} className="relative h-20 rounded-lg overflow-hidden border border-border group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt="preview"
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeSelectedImage(idx)}
                          className="absolute -top-1 -right-1 p-1 rounded-full bg-red-600 text-white opacity-90 hover:opacity-100 shadow-md scale-75"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        {idx === 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-emerald-600/90 text-white text-[10px] text-center font-semibold py-0.5">
                            Cover Image
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action buttons footer */}
          <div className="flex justify-between pt-6 border-t border-border/50">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={prevStep} disabled={loading}>
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <Button type="button" onClick={nextStep} className="gradient-btn">
                Next Step
              </Button>
            ) : (
              <Button type="submit" disabled={loading || compressing} className="gradient-btn px-6">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Spot...
                  </>
                ) : (
                  'Submit Hidden Spot'
                )}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
