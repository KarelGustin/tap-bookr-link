import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PhoneMockupProps {
  profileUrl: string
  userName?: string
}

export function PhoneMockup({ profileUrl, userName }: PhoneMockupProps) {
  const handleViewFull = () => {
    window.open(profileUrl, '_blank')
  }

  return (
    <div className="relative mx-auto w-full max-w-xs">
      {/* iPhone Frame */}
      <div className="relative bg-background border-8 border-border rounded-[2.5rem] shadow-xl">
        {/* Top Notch */}
        <div className="absolute top-0 inset-x-0 flex justify-center">
          <div className="bg-border h-6 w-32 rounded-b-2xl"></div>
        </div>
        
        {/* Screen */}
        <div className="relative bg-background rounded-[1.75rem] overflow-hidden h-[600px] w-full">
          <iframe
            src={profileUrl}
            className="w-full h-full border-0"
            title={`Preview van ${userName || 'je profiel'}`}
            loading="lazy"
            scrolling="yes"
            style={{ 
              overflow: 'auto',
              WebkitOverflowScrolling: 'touch'
            }}
          />
        </div>
        
        {/* Home Indicator */}
        <div className="absolute bottom-1 inset-x-0 flex justify-center">
          <div className="bg-border h-1 w-32 rounded-full"></div>
        </div>
      </div>
      
      {/* Caption */}
      <div className="text-center mt-4">
        <p className="text-sm text-muted-foreground">
          Live preview van je profiel
        </p>
        <Button 
          variant="link" 
          size="sm" 
          onClick={handleViewFull}
          className="text-xs mt-1"
        >
          <ExternalLink className="w-3 h-3 mr-1" />
          Open volledige preview
        </Button>
      </div>
    </div>
  )
}