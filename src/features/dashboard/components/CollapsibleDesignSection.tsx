import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useAutosave } from '@/hooks/use-autosave'
import { Check, Loader2 } from 'lucide-react'

interface CollapsibleDesignSectionProps {
  id: string
  title: string
  children: React.ReactNode
  onSave: () => Promise<void>
  data: any
  fieldName: string
  defaultOpen?: boolean
}

export function CollapsibleDesignSection({ 
  id, 
  title, 
  children, 
  onSave, 
  data, 
  fieldName,
  defaultOpen = false 
}: CollapsibleDesignSectionProps) {
  const { status, debouncedSave, getStatusDisplay } = useAutosave({
    onSave,
    data,
    fieldName,
    debounceMs: 1000
  })

  const statusDisplay = getStatusDisplay()

  const handleSaveClick = async () => {
    await onSave()
  }

  return (
    <Accordion type="single" collapsible defaultValue={defaultOpen ? id : undefined}>
      <AccordionItem value={id} className="border-0">
        <AccordionTrigger className="px-0 py-2 hover:no-underline">
          <div className="flex items-center justify-between w-full mr-4">
            <span className="font-medium">{title}</span>
            {status !== 'idle' && (
              <div className={`flex items-center space-x-1 text-xs ${statusDisplay.className}`}>
                <span>{statusDisplay.icon}</span>
                <span>{statusDisplay.text}</span>
              </div>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-0 pb-2">
          <div className="space-y-3">
            {children}
            
            <div className="flex justify-end pt-2 border-t">
              <Button
                onClick={handleSaveClick}
                disabled={status === 'saving'}
                className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300"
                variant="outline"
                size="sm"
              >
                {status === 'saving' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Opslaan...
                  </>
                ) : status === 'saved' ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Opgeslagen
                  </>
                ) : (
                  'Opslaan'
                )}
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}