import { useState } from 'react'

export function useDesignState() {
  const [design, setDesign] = useState({
    bannerType: 'image' as 'color' | 'image',
    bannerUrl: '',
    bannerColor: '#6E56CF',
    bannerHeading: '',
    bannerSubheading: '',
    bannerTextColor: '#FFFFFF',
    name: '',
    slogan: '',
    category: '',
    avatarUrl: '',
    aboutTitle: '',
    aboutDescription: '',
    footerBusinessName: '',
    footerAddress: '',
    footerEmail: '',
    footerPhone: '',
    footerHours: {} as Record<string, { open: string; close: string; closed: boolean }>,
    footerNextAvailable: '',
    footerCancellationPolicy: '',
    footerPrivacyPolicy: '',
    footerTermsOfService: '',
    footerShowMaps: true,
    footerShowAttribution: true,
    mediaFiles: [] as File[],
    mediaOrder: [] as Array<{ id: string; url: string; alt?: string }>,
    socials: [] as Array<{ id: string; title: string; platform?: string; url: string }>,
    bookingUrl: '',
    bookingMode: 'embed' as 'embed' | 'new_tab',
    testimonials: [] as Array<{ customer_name: string; review_title: string; review_text: string; image_url?: string }>,
  })

  return { design, setDesign }
}


