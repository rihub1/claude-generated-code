import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import Link from 'next/link'
import { ArrowRight, Star, User } from 'lucide-react'

export default async function TemplatesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: templates } = await supabase
    .from('templates')
    .select('*')
    .or(`is_builtin.eq.true,user_id.eq.${user.id}`)
    .order('is_builtin', { ascending: false })
    .order('created_at', { ascending: true })

  const builtins = templates?.filter((t) => t.is_builtin) || []
  const custom = templates?.filter((t) => !t.is_builtin) || []

  const categoryColors: Record<string, string> = {
    web: 'bg-blue-100 text-blue-700',
    marketing: 'bg-green-100 text-green-700',
    branding: 'bg-purple-100 text-purple-700',
    social: 'bg-pink-100 text-pink-700',
    software: 'bg-orange-100 text-orange-700',
    general: 'bg-gray-100 text-gray-700',
  }

  return (
    <div>
      <PageHeader
        title="Templates"
        description="Built-in templates to kickstart your proposals"
      />

      {/* Built-in templates */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-4 h-4 text-yellow-500" />
          <h2 className="text-sm font-semibold text-gray-700">Built-in templates</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {builtins.map((tpl) => (
            <div key={tpl.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full inline-block mb-3 ${
                  categoryColors[tpl.category] || categoryColors.general
                }`}
              >
                {tpl.category}
              </span>
              <h3 className="text-sm font-bold text-gray-900 mb-1">{tpl.name}</h3>
              <p className="text-xs text-gray-500 mb-4 line-clamp-2">{tpl.description}</p>
              <Link
                href={`/proposals/new?template=${tpl.id}`}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
              >
                Use template <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Custom templates */}
      {custom.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700">Your templates</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {custom.map((tpl) => (
              <div key={tpl.id} className="bg-white border border-gray-200 rounded-xl p-5">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full inline-block mb-3 bg-gray-100 text-gray-700">
                  {tpl.category}
                </span>
                <h3 className="text-sm font-bold text-gray-900 mb-1">{tpl.name}</h3>
                <p className="text-xs text-gray-500 mb-4 line-clamp-2">{tpl.description}</p>
                <Link
                  href={`/proposals/new?template=${tpl.id}`}
                  className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                >
                  Use template <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
