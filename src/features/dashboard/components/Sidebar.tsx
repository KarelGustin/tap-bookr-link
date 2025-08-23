import { Button } from '@/components/ui/button'
import { ChevronDown, LogOut } from 'lucide-react'

type SectionKey = 'design' | 'subscription'

export function Sidebar({
  profileName,
  userInitial,
  activeSection,
  onChangeSection,
  onSignOut,
  sidebarOpen,
  setSidebarOpen,
}: {
  profileName?: string
  userInitial?: string
  activeSection: SectionKey
  onChangeSection: (s: SectionKey) => void
  onSignOut: () => void
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
}) {
  return (
    <div
      id="sidebar"
      className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-100 border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="p-4 lg:p-6">
        <div className="hidden lg:flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">{userInitial || 'U'}</span>
            </div>
            <span className="font-semibold text-gray-900">{profileName || 'User'}</span>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>

        <nav className="space-y-1">
          <div className="mb-4 space-y-1">
            {([
              { key: 'design', label: 'Design' },
              { key: 'subscription', label: 'Abonnement' },
            ] as const).map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  onChangeSection(item.key)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                  activeSection === item.key
                    ? 'bg-gray-200 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-200">
          <div className="space-y-2">
            <button
              onClick={onSignOut}
              className="w-full flex items-center px-3 py-2 text-sm rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Uitloggen
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


