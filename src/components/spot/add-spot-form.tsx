'use client'

import { useState, useEffect } from 'react'
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
import { toast } from 'sonner'
import {
  AlertTriangle,
  UploadCloud,
  Loader2,
  X,
} from 'lucide-react'
import { LocationPicker } from './location-picker'
import { errMessage } from '@/lib/utils'

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
}).refine((d) => !(d.latitude === 0 && d.longitude === 0), {
  path: ['latitude'],
  message: 'Please set the location — search, use current location, or tap the map',
})

export type SpotFormValues = z.infer<typeof spotSchema>

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
      } catch {
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
    let fieldsToValidate: (keyof SpotFormValues)[] = []
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
    } catch (err) {
      toast.error(errMessage(err, 'Submission failed. Please check connection.'))
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
        <div className="relative flex justify-between items-center mb-10 max-w-md mx-auto">
          {['Details', 'Location', 'Info', 'Media'].map((name, index) => {
            const num = index + 1
            const isCompleted = step > num
            const isActive = step === num
            return (
              <div key={name} className="relative z-10 flex flex-col items-center flex-1">
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    isCompleted
                      ? 'bg-brand text-white shadow-md shadow-brand/25 scale-105'
                      : isActive
                      ? 'bg-brand text-white border-2 border-brand-cream dark:border-brand-green shadow-lg scale-110'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700 dark:bg-zinc-900'
                  }`}
                >
                  {num}
                </div>
                <span
                  className={`mt-2 text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                    isActive ? 'text-brand dark:text-brand-cream font-extrabold' : isCompleted ? 'text-brand/90 dark:text-brand-cream/90' : 'text-zinc-500'
                  }`}
                >
                  {name}
                </span>
              </div>
            )
          })}
          <div className="absolute top-[18px] left-[12%] right-[12%] h-[2px] bg-zinc-700 dark:bg-zinc-800 -z-0">
            <div
              className="h-full bg-brand transition-all duration-300"
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
                <LocationPicker
                  register={register}
                  setValue={setValue}
                  watch={watch}
                  errors={errors}
                  states={states}
                  districts={districts}
                  active={step === 2}
                />
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
                      onValueChange={(val) => setValue('difficulty_level', val as SpotFormValues['difficulty_level'])}
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
                        <Loader2 className="h-10 w-10 animate-spin text-brand dark:text-brand-cream mb-3" />
                        <span className="text-sm font-semibold">Compressing images on-client...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="h-10 w-10 text-brand dark:text-brand-cream mb-3" />
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
                        {/* Local blob preview — next/image can't optimize object URLs */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
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
                          <div className="absolute bottom-0 left-0 right-0 bg-brand/90 text-white text-[10px] text-center font-semibold py-0.5">
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
