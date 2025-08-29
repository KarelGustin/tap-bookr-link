import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { SectionCard } from './SectionCard'
import { Upload, X, Image as ImageIcon, GripVertical } from 'lucide-react'
import { useImageUpload } from '@/hooks/use-image-upload'
import { useToast } from '@/hooks/use-toast'

interface MediaItem {
  id: string
  url: string
  alt?: string
}

interface MediaSectionProps {
  mediaItems: MediaItem[]
  onUpdate: (items: MediaItem[]) => void
}

export function MediaSection({ mediaItems, onUpdate }: MediaSectionProps) {
  const { uploadImage, isUploading } = useImageUpload()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleImageUpload = async (files: FileList) => {
    const currentCount = mediaItems.length
    const newFiles = Array.from(files).slice(0, 6 - currentCount)
    
    if (newFiles.length === 0) {
      toast({
        title: "Maximum bereikt",
        description: "Je kunt maximaal 6 afbeeldingen uploaden.",
        variant: "destructive",
      })
      return
    }

    try {
      const uploadPromises = newFiles.map(async (file, index) => {
        const result = await uploadImage(file, 'media', `gallery/${Date.now()}_${index}_${file.name}`)
        if (result) {
          return {
            id: `${Date.now()}_${index}`,
            url: result.url,
            alt: file.name
          }
        }
        return null
      })

      const uploadedItems = await Promise.all(uploadPromises)
      const validItems = uploadedItems.filter((item) => item !== null)
      
      if (validItems.length > 0) {
        onUpdate([...mediaItems, ...validItems])
        toast({
          title: "Afbeeldingen geüpload",
          description: `${validItems.length} afbeelding(en) succesvol geüpload.`,
        })
      }
    } catch (error) {
      toast({
        title: "Upload mislukt",
        description: "Er is een fout opgetreden bij het uploaden.",
        variant: "destructive",
      })
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      handleImageUpload(files)
    }
  }

  const removeImage = (id: string) => {
    const updated = mediaItems.filter(item => item.id !== id)
    onUpdate(updated)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex === null || draggedIndex === dropIndex) return
    
    const newItems = [...mediaItems]
    const draggedItem = newItems[draggedIndex]
    
    // Remove dragged item
    newItems.splice(draggedIndex, 1)
    
    // Insert at new position
    const adjustedDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex
    newItems.splice(adjustedDropIndex, 0, draggedItem)
    
    onUpdate(newItems)
    setDraggedIndex(null)
  }

  const canUploadMore = mediaItems.length < 6

  return (
    <SectionCard 
      title="Media Gallerij"
      cta={
        canUploadMore && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {isUploading ? 'Uploaden...' : 'Afbeelding(en)'}
          </Button>
        )
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ImageIcon className="w-4 h-4" />
          <p className="text-sm">
            Upload tot 6 afbeeldingen voor je gallerij. Sleep om de volgorde te wijzigen.
          </p>
        </div>

        {/* Media Grid */}
        {mediaItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {mediaItems.map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className="relative group cursor-move bg-muted rounded-lg overflow-hidden aspect-square"
              >
                <img
                  src={item.url}
                  alt={item.alt || `Media ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Drag Handle */}
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/50 rounded p-1">
                    <GripVertical className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Remove Button */}
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(item.id)}
                >
                  <X className="w-3 h-3" />
                </Button>

                {/* Order Indicator */}
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">Nog geen afbeeldingen</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload afbeeldingen om je gallerij te vullen
            </p>
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Uploaden...' : 'Eerste afbeelding uploaden'}
            </Button>
          </div>
        )}

        {/* Upload Progress */}
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{mediaItems.length} / 6 afbeeldingen</span>
          {canUploadMore && (
            <span>Je kunt nog {6 - mediaItems.length} afbeelding(en) toevoegen</span>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </SectionCard>
  )
}