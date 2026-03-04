'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/shared/PageHeader'
import { Loader2, Save } from 'lucide-react'

interface BrandKitRow {
  agency_name: string | null
  primary_color: string | null
  tone_of_voice: string | null
  logo_url: string | null
}

interface BrandKitForm {
  agency_name: string
  primary_color: string
  tone_of_voice: string
  logo_url: string
}

export default function BrandKitPage() {
  const [form, setForm] = useState<BrandKitForm>({
    agency_name: '',
    primary_color: '#3B82F6',
    tone_of_voice: 'professional',
    logo_url: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function loadBrandKit() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('brand_kits')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle() as { data: BrandKitRow | null, error: unknown }

      if (data) {
        setForm({
          agency_name: data.agency_name || '',
          primary_color: data.primary_color || '#3B82F6',
          tone_of_voice: data.tone_of_voice || 'professional',
          logo_url: data.logo_url || '',
        })
      }
      setLoading(false)
    }
    loadBrandKit()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: saveError } = await supabase
      .from('brand_kits')
      .upsert(
        { user_id: user.id, ...form, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )

    if (saveError) {
      setError(saveError.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="max-w-xl">
      <PageHeader
        title="Brand Kit"
        description="Set your agency defaults. These are used in every proposal you generate."
      />

      <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Agency name</label>
          <input
            type="text"
            value={form.agency_name}
            onChange={(e) => setForm({ ...form, agency_name: e.target.value })}
            placeholder="Acme Digital Agency"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">Used in the &quot;Prepared by&quot; line of your proposals.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Primary brand color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={form.primary_color}
              onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
              className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={form.primary_color}
              onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
              placeholder="#3B82F6"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Default tone of voice</label>
          <select
            value={form.tone_of_voice}
            onChange={(e) => setForm({ ...form, tone_of_voice: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="professional">Professional</option>
            <option value="friendly">Friendly & approachable</option>
            <option value="bold">Bold & direct</option>
            <option value="formal">Formal</option>
            <option value="creative">Creative & energetic</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
          <input
            type="url"
            value={form.logo_url}
            onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
            placeholder="https://youragency.com/logo.png"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">Optional. Shown in exported proposals.</p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save brand kit'}
        </button>
      </form>
    </div>
  )
}
