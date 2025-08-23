import { Button } from '@/components/ui/button'
import { LanguageSelector } from '@/components/ui/language-selector'
import { Menu } from 'lucide-react'

export function Header({ onOpenSidebar, title }: { onOpenSidebar: () => void; title: string }) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onOpenSidebar} className="lg:hidden">
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{title}</h1>
        </div>
        <div className="flex items-center space-x-2 lg:space-x-3">
          <LanguageSelector />
        </div>
      </div>
    </header>
  )
}


