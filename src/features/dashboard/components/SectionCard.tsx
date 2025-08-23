import { ReactNode } from 'react'

export function SectionCard({ title, cta, children }: { title: string; cta?: ReactNode; children: ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-50">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
          {cta}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}


