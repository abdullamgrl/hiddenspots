'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { FolderPlus, Globe, Lock, Link2, Trash2, Loader2 } from 'lucide-react'

export interface Collection {
  id: string
  name: string
  slug: string
  is_public: boolean
}

interface CollectionControlsProps {
  collections: Collection[]
  activeSlug: string | null
  username: string
  userId: string
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

/**
 * Collection chips + create/share/visibility/delete actions for /saved.
 * Mutations go straight through Supabase (RLS-enforced) then refresh the
 * server-rendered list.
 */
export function CollectionControls({
  collections,
  activeSlug,
  username,
  userId,
}: CollectionControlsProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [busy, setBusy] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const active = collections.find((c) => c.slug === activeSlug) ?? null

  const createCollection = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    const slug = slugify(trimmed)
    if (!slug) {
      toast.error('Give the collection a name with letters or numbers')
      return
    }
    setBusy(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('collections').insert({
        profile_id: userId,
        name: trimmed,
        slug,
        is_public: isPublic,
      })
      if (error) {
        if (error.code === '23505') {
          toast.error('You already have a collection with this name')
        } else {
          throw error
        }
        return
      }
      toast.success(`Collection “${trimmed}” created`)
      setDialogOpen(false)
      setName('')
      setIsPublic(false)
      router.push(`/saved?c=${slug}`)
      router.refresh()
    } catch {
      toast.error('Could not create the collection. Try again.')
    } finally {
      setBusy(false)
    }
  }

  const toggleVisibility = async () => {
    if (!active) return
    setBusy(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('collections')
        .update({ is_public: !active.is_public })
        .eq('id', active.id)
      if (error) throw error
      toast.success(
        active.is_public
          ? 'Collection is now private'
          : 'Collection is now public — anyone with the link can view it'
      )
      router.refresh()
    } catch {
      toast.error('Could not update visibility')
    } finally {
      setBusy(false)
    }
  }

  const copyShareLink = async () => {
    if (!active) return
    const url = `${window.location.origin}/collections/${username}/${active.slug}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Share link copied')
    } catch {
      toast.error('Could not copy the link')
    }
  }

  const deleteCollection = async () => {
    if (!active) return
    if (!confirmingDelete) {
      setConfirmingDelete(true)
      setTimeout(() => setConfirmingDelete(false), 4000)
      return
    }
    setBusy(true)
    try {
      const supabase = createClient()
      // Spots inside stay saved — collection_id is set null on delete.
      const { error } = await supabase.from('collections').delete().eq('id', active.id)
      if (error) throw error
      toast.success(`Deleted “${active.name}” — its spots stay in your saved list`)
      router.push('/saved')
      router.refresh()
    } catch {
      toast.error('Could not delete the collection')
    } finally {
      setBusy(false)
      setConfirmingDelete(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Collection chips */}
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/saved"
          className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
            !activeSlug
              ? 'border-brand bg-brand/10 text-brand dark:text-brand-cream'
              : 'border-border/50 bg-card text-muted-foreground hover:border-brand/40 hover:text-foreground'
          }`}
        >
          All Saved
        </Link>
        {collections.map((c) => (
          <Link
            key={c.id}
            href={`/saved?c=${c.slug}`}
            className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
              activeSlug === c.slug
                ? 'border-brand bg-brand/10 text-brand dark:text-brand-cream'
                : 'border-border/50 bg-card text-muted-foreground hover:border-brand/40 hover:text-foreground'
            }`}
          >
            {c.is_public ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
            {c.name}
          </Link>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDialogOpen(true)}
          className="gap-1.5 rounded-full border-dashed border-border/70 text-muted-foreground hover:text-foreground"
        >
          <FolderPlus className="h-4 w-4" />
          New Collection
        </Button>
      </div>

      {/* Active collection actions */}
      {active && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/50 bg-card px-4 py-3">
          <span className="mr-auto flex items-center gap-1.5 text-sm font-semibold">
            {active.is_public ? (
              <Globe className="h-4 w-4 text-brand dark:text-brand-cream" />
            ) : (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
            {active.is_public ? 'Public — anyone with the link can view' : 'Private collection'}
          </span>
          <Button variant="outline" size="sm" onClick={toggleVisibility} disabled={busy} className="gap-1.5">
            {active.is_public ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
            Make {active.is_public ? 'Private' : 'Public'}
          </Button>
          {active.is_public && (
            <Button variant="outline" size="sm" onClick={copyShareLink} className="gap-1.5">
              <Link2 className="h-4 w-4" />
              Copy Share Link
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={deleteCollection}
            disabled={busy}
            className={`gap-1.5 ${
              confirmingDelete
                ? 'border-red-500/50 bg-red-500/10 text-red-500 hover:text-red-400'
                : 'text-muted-foreground hover:text-red-500'
            }`}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {confirmingDelete ? 'Confirm Delete' : 'Delete'}
          </Button>
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl font-bold">New Collection</DialogTitle>
            <DialogDescription>
              Group saved spots into a trip plan or theme — make it public to share the link.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={createCollection} className="space-y-4 pt-2">
            <div className="space-y-2">
              <label htmlFor="collection-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Name
              </label>
              <Input
                id="collection-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Monsoon Waterfall Trip"
                maxLength={60}
                disabled={busy}
                required
              />
            </div>
            <label className="flex items-center justify-between gap-3 rounded-xl border border-border/50 px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Globe className="h-4 w-4 text-brand dark:text-brand-cream" />
                Public collection
              </span>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} disabled={busy} />
            </label>
            <Button type="submit" disabled={busy} className="gradient-btn w-full">
              {busy ? 'Creating…' : 'Create Collection'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
