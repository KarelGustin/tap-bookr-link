import { useState, useEffect } from 'react';
import { THEME_PALETTES, applyThemeToDOM, type ThemeConfig } from '@/lib/themePalettes';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ThemeSelectorProps {
  profileId: string;
  currentTheme?: string;
  onThemeChange?: (theme: string) => void;
  isPreview?: boolean;
}

export default function ThemeSelector({ 
  profileId, 
  currentTheme = 'elegant-rose', 
  onThemeChange,
  isPreview = false 
}: ThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setSelectedTheme(currentTheme);
    if (isPreview) {
      applyThemeToDOM(currentTheme);
    }
  }, [currentTheme, isPreview]);

  const handleThemeSelect = async (themeName: string) => {
    setSelectedTheme(themeName);
    
    if (isPreview) {
      applyThemeToDOM(themeName);
    }

    if (onThemeChange) {
      onThemeChange(themeName);
    }

    // Update database if not in preview mode
    if (!isPreview) {
      setIsUpdating(true);
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ theme_palette: themeName })
          .eq('id', profileId);

        if (error) {
          throw error;
        }

        toast({
          title: "Kleurenschema bijgewerkt",
          description: `Je hebt gekozen voor het ${THEME_PALETTES[themeName].displayName} thema.`,
        });
      } catch (error) {
        console.error('Error updating theme:', error);
        toast({
          title: "Fout bij bijwerken",
          description: "Er is een fout opgetreden bij het bijwerken van je kleurenschema.",
          variant: "destructive",
        });
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Kies je kleurenschema
        </h3>
        <p className="text-gray-600">
          Selecteer een kleurenschema dat past bij jouw bedrijf en stijl. 
          Je kunt dit later altijd aanpassen.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(THEME_PALETTES).map(([key, theme]) => (
          <button
            key={key}
            onClick={() => handleThemeSelect(key)}
            disabled={isUpdating}
            className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
              selectedTheme === key 
                ? 'border-primary ring-2 ring-primary/20' 
                : 'border-gray-200 hover:border-gray-300'
            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            style={{
              backgroundColor: theme.colors.background,
              color: theme.colors.text
            }}
          >
            {/* Selected indicator */}
            {selectedTheme === key && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}

            {/* Color preview */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex gap-1">
                <div 
                  className="w-6 h-6 rounded-full border border-white/20" 
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <div 
                  className="w-6 h-6 rounded-full border border-white/20" 
                  style={{ backgroundColor: theme.colors.secondary }}
                />
                <div 
                  className="w-6 h-6 rounded-full border border-white/20" 
                  style={{ backgroundColor: theme.colors.accent }}
                />
              </div>
            </div>

            {/* Theme info */}
            <div className="text-left">
              <h4 className="font-semibold text-lg mb-1">{theme.displayName}</h4>
              <p className="text-sm opacity-80 mb-2">{theme.description}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-white/20">
                  {theme.businessType}
                </span>
              </div>
            </div>

            {/* Hover effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>

      {/* Current theme info */}
      {selectedTheme && (
        <div className="mt-6 p-4 rounded-lg bg-gray-50 border">
          <h4 className="font-medium text-gray-900 mb-2">
            Geselecteerd thema: {THEME_PALETTES[selectedTheme].displayName}
          </h4>
          <p className="text-sm text-gray-600">
            {THEME_PALETTES[selectedTheme].description}
          </p>
        </div>
      )}

      {/* Loading state */}
      {isUpdating && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            Kleurenschema bijwerken...
          </div>
        </div>
      )}
    </div>
  );
}
