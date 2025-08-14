import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'nl' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('nl'); // Nederlands als standaard

  useEffect(() => {
    // Laad opgeslagen taalvoorkeur uit localStorage
    const savedLanguage = localStorage.getItem('bookr-language') as Language;
    if (savedLanguage && (savedLanguage === 'nl' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('bookr-language', lang);
  };

  const t = (key: string, replacements?: Record<string, string>): string => {
    let text = translations[language][key] || translations.nl[key] || key;
    
    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        text = text.replace(new RegExp(`{${placeholder}}`, 'g'), value);
      });
    }
    
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Volledige vertalingen - Nederlands als standaard
const translations = {
  nl: {
    // Algemene navigatie
    'nav.dashboard': 'Dashboard',
    'nav.design': 'Ontwerp',
    'nav.analytics': 'Analytics',
    'nav.settings': 'Instellingen',
    'nav.profile': 'Profiel',
    'nav.logout': 'Uitloggen',
    'nav.login': 'Inloggen',
    'nav.signup': 'Aanmelden',

    // Onboarding
    'onboarding.title': 'Welkom bij Bookr',
    'onboarding.subtitle': 'Maak je professionele boekingspagina in minuten',
    'onboarding.next': 'Volgende',
    'onboarding.back': 'Terug',
    'onboarding.finish': 'Voltooien',
    'onboarding.skip': 'Overslaan',
    'onboarding.step1.title': 'Kies Je Handle',
    'onboarding.step1.subtitle': 'Kies een unieke URL voor je boekingspagina',
    'onboarding.step1.handle.label': 'Je unieke URL',
    'onboarding.step1.handle.placeholder': 'jouw-naam',
    'onboarding.step1.handle.description': 'Dit wordt je persoonlijke link: {urlPrefix}jouw-naam',
    'onboarding.step1.businessName.label': 'Bedrijfsnaam (optioneel)',
    'onboarding.step1.businessName.placeholder': 'Jouw Bedrijfsnaam',
    'onboarding.step1.isBusiness.label': 'Dit is een bedrijfsprofiel',
    'onboarding.step1.isBusiness.description': 'Vink aan als je een bedrijf vertegenwoordigt',

    'onboarding.step2.title': 'Boeking Instellen',
    'onboarding.step2.subtitle': 'Verbind je boekingssysteem',
    'onboarding.step2.bookingUrl.label': 'Boekingslink',
    'onboarding.step2.bookingUrl.placeholder': 'https://calendly.com/jouw-naam',
    'onboarding.step2.bookingMode.label': 'Boekingsmodus',
    'onboarding.step2.bookingMode.embed': 'Inbedden in pagina',
    'onboarding.step2.bookingMode.newTab': 'Openen in nieuw tabblad',
    'onboarding.step2.whatsapp.label': 'WhatsApp gebruiken',
    'onboarding.step2.whatsapp.description': 'Klanten kunnen direct via WhatsApp contact opnemen',
    'onboarding.step2.whatsappNumber.label': 'WhatsApp nummer',
    'onboarding.step2.whatsappNumber.placeholder': '+31 6 12345678',

    'onboarding.step3.title': 'Uitstraling',
    'onboarding.step3.subtitle': 'Pas je uiterlijk aan',
    'onboarding.step3.name.label': 'Je naam',
    'onboarding.step3.name.placeholder': 'Jouw Naam',
    'onboarding.step3.slogan.label': 'Slogan (optioneel)',
    'onboarding.step3.slogan.placeholder': 'Korte beschrijving van wat je doet',
    'onboarding.step3.avatar.label': 'Profielfoto',
    'onboarding.step3.avatar.description': 'Upload een professionele foto van jezelf',
    'onboarding.step3.category.label': 'Bedrijfscategorie',
    'onboarding.step3.category.placeholder': 'Selecteer je bedrijfstype',
    'onboarding.step3.banner.label': 'Banner Achtergrond',
    'onboarding.step3.banner.color': 'Vaste Kleur',
    'onboarding.step3.banner.image': 'Achtergrondafbeelding',
    'onboarding.step3.banner.heading.label': 'Hoofdtitel',
    'onboarding.step3.banner.heading.placeholder': 'Welkom bij mijn diensten',
    'onboarding.step3.banner.subheading.label': 'Subtitel',
    'onboarding.step3.banner.subheading.placeholder': 'Professionele dienstverlening',

    'onboarding.step4.title': 'Over & Media',
    'onboarding.step4.subtitle': 'Vertel je verhaal',
    'onboarding.step4.aboutTitle.label': 'Titel voor je verhaal',
    'onboarding.step4.aboutTitle.placeholder': 'Maak kennis met {name}',
    'onboarding.step4.aboutDescription.label': 'Je verhaal',
    'onboarding.step4.aboutDescription.placeholder': 'Vertel klanten over jezelf, je ervaring en wat je te bieden hebt...',
    'onboarding.step4.aboutAlignment.label': 'Uitlijning',
    'onboarding.step4.aboutAlignment.center': 'Gecentreerd',
    'onboarding.step4.aboutAlignment.left': 'Links uitgelijnd',
    'onboarding.step4.media.label': 'Media toevoegen',
    'onboarding.step4.media.description': 'Upload foto\'s van je werk of diensten',
    'onboarding.step4.socials.label': 'Sociale Media',
    'onboarding.step4.aboutYou.title': 'Over Jou',
    'onboarding.step4.aboutYou.alreadySaved': '(Al opgeslagen)',
    'onboarding.step4.aboutYou.titleLabel': 'Titel',
    'onboarding.step4.aboutYou.descriptionLabel': 'Beschrijving',
    'onboarding.step4.aboutYou.descriptionPlaceholder': 'Hallo! Ik ben {name}. Ik help klanten zich op hun best te voelen met natuurlijke, langdurige resultaten.',
    'onboarding.step4.aboutYou.characters': 'karakters',
    'onboarding.step4.socialLinks.title': 'Sociale Links',
    'onboarding.step4.mediaGallery.title': 'Media Galerij',
    'onboarding.step4.mediaGallery.images': 'afbeeldingen',
    'onboarding.step4.mediaGallery.existingDescription': 'Je bestaande media galerij wordt hieronder getoond. Je kunt meer afbeeldingen toevoegen of ze opnieuw ordenen.',
    'onboarding.step4.mediaGallery.uploadDescription': 'Upload 6 van je beste afbeeldingen om je werk en wat je doet te tonen.',
    'onboarding.step4.mediaGallery.dragDropDescription': 'Sleep en zet neer om afbeeldingen opnieuw te ordenen. Eerste afbeelding wordt de hoofdfoto.',
    'onboarding.step4.mediaGallery.addMedia': 'Media Toevoegen',
    'onboarding.step4.mediaGallery.remaining': 'over',
    'onboarding.step4.mediaGallery.mediaAlt': 'Media',
    'onboarding.step4.extras.title': 'Je extra\'s',
    'onboarding.step4.extras.optionalTitle': 'Optionele extra\'s',
    'onboarding.step4.extras.subtitle': 'Je extra informatie is opgeslagen.',
    'onboarding.step4.extras.optionalSubtitle': 'Voeg meer details toe om je pagina te laten opvallen.',
    'onboarding.step4.socials.instagram': 'Instagram',
    'onboarding.step4.socials.facebook': 'Facebook',
    'onboarding.step4.socials.linkedin': 'LinkedIn',
    'onboarding.step4.socials.youtube': 'YouTube',

    'onboarding.step5.title': 'Sociaal & Aanbevelingen',
    'onboarding.step5.subtitle': 'Bouw vertrouwen op met sociale bewijzen',
    'onboarding.step5.socialLinks.label': 'Sociale Links',
    'onboarding.step5.socialLinks.description': 'Voeg links toe naar je sociale media profielen',
    'onboarding.step5.testimonials.label': 'Klantaanbevelingen',
    'onboarding.step5.testimonials.description': 'Voeg positieve reviews van klanten toe',
    'onboarding.step5.testimonials.add': 'Aanbeveling toevoegen',
    'onboarding.step5.testimonials.customerName': 'Klantnaam',
    'onboarding.step5.testimonials.reviewTitle': 'Review titel',
    'onboarding.step5.testimonials.reviewText': 'Review tekst',

    'onboarding.step6.title': 'Footer & Instellingen',
    'onboarding.step6.subtitle': 'Laatste aanpassingen en beleid',
    'onboarding.step6.footerBusinessName.label': 'Bedrijfsnaam in footer',
    'onboarding.step6.footerBusinessName.placeholder': 'Jouw Bedrijf BV',
    'onboarding.step6.address.label': 'Adres',
    'onboarding.step6.address.placeholder': 'Straatnaam 123, 1234 AB Stad',
    'onboarding.step6.email.label': 'E-mail',
    'onboarding.step6.email.placeholder': 'info@jouwbedrijf.nl',
    'onboarding.step6.phone.label': 'Telefoon',
    'onboarding.step6.phone.placeholder': '+31 20 1234567',
    'onboarding.step6.hours.label': 'Openingstijden',
    'onboarding.step6.hours.monday': 'Maandag',
    'onboarding.step6.hours.tuesday': 'Dinsdag',
    'onboarding.step6.hours.wednesday': 'Woensdag',
    'onboarding.step6.hours.thursday': 'Donderdag',
    'onboarding.step6.hours.friday': 'Vrijdag',
    'onboarding.step6.hours.saturday': 'Zaterdag',
    'onboarding.step6.hours.sunday': 'Zondag',
    'onboarding.step6.hours.open': 'Open',
    'onboarding.step6.hours.close': 'Sluit',
    'onboarding.step6.hours.closed': 'Gesloten',

    'onboarding.step7.title': 'Voorvertoning',
    'onboarding.step7.subtitle': 'Zie je eindresultaat',
    'onboarding.step7.preview.description': 'Bekijk hoe je pagina eruit zal zien voor bezoekers',
    'onboarding.step7.publish': 'Pagina Publiceren',
    'onboarding.step7.edit': 'Bewerken',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welkom terug',
    'dashboard.createProfile': 'Maak je profiel aan',
    'dashboard.editProfile': 'Profiel bewerken',
    'dashboard.viewPublicPage': 'Openbare pagina bekijken',
    'dashboard.save': 'Opslaan',
    'dashboard.cancel': 'Annuleren',
    'dashboard.edit': 'Bewerken',
    'dashboard.preview': 'Voorvertoning',
    'dashboard.design': 'Ontwerp',
    'dashboard.analytics': 'Analytics',
    'dashboard.settings': 'Instellingen',
    'dashboard.share': 'Delen',

    // Profiel bewerken
    'edit.title': 'Profiel Bewerken',
    'edit.save': 'Wijzigingen Opslaan',
    'edit.cancel': 'Annuleren',
    'edit.preview': 'Voorvertoning',
    'edit.publish': 'Publiceren',
    'edit.unpublish': 'Publicatie ongedaan maken',

    // Publiek profiel
    'public.booking': 'Boeken',
    'public.contact': 'Contact',
    'public.about': 'Het gezicht achter {name}',
    'public.services': 'Diensten',
    'public.testimonials': 'Aanbevelingen',
    'public.workResults': 'Werk & Resultaten',
    'public.footer': 'Footer',

    // Algemene UI
    'common.businessName': 'Bedrijfsnaam',
    'common.slogan': 'Slogan',
    'common.category': 'Categorie',
    'common.about': 'Over',
    'common.description': 'Beschrijving',
    'common.upload': 'Uploaden',
    'common.select': 'Selecteren',
    'common.save': 'Opslaan',
    'common.cancel': 'Annuleren',
    'common.next': 'Volgende',
    'common.back': 'Terug',
    'common.finish': 'Voltooien',
    'common.loading': 'Laden...',
    'common.error': 'Fout',
    'common.success': 'Succes',
    'common.required': 'Verplicht',
    'common.optional': 'Optioneel',
    'common.yes': 'Ja',
    'common.no': 'Nee',
    'common.open': 'Open',
    'common.closed': 'Gesloten',
    'common.available': 'Beschikbaar',
    'common.unavailable': 'Niet beschikbaar',
    'common.handleLocked': 'Je huidige handle (kan niet worden gewijzigd)',
    'common.urlPrefix': 'tapbookr.com/',

    // Taalselector
    'language.english': 'English',
    'language.dutch': 'Nederlands',
    'language.select': 'Selecteer Taal',

    // Categorieën
    'category.beauty': 'Schoonheid & Haar',
    'category.fitness': 'Fitness & Wellness',
    'category.photography': 'Fotografie',
    'category.consulting': 'Consultancy',
    'category.coaching': 'Life Coaching',
    'category.massage': 'Massage & Spa',
    'category.healthcare': 'Gezondheidszorg',
    'category.legal': 'Juridisch',
    'category.financial': 'Financieel',
    'category.creative': 'Creatief & Design',
    'category.technology': 'Technologie',
    'category.education': 'Onderwijs',
    'category.other': 'Anders',

    // Validatie berichten
    'validation.required': 'Dit veld is verplicht',
    'validation.minLength': 'Moet minimaal {min} karakters bevatten',
    'validation.maxLength': 'Mag maximaal {max} karakters bevatten',
    'validation.invalidUrl': 'Voer een geldige URL in',
    'validation.invalidEmail': 'Voer een geldig e-mailadres in',
    'validation.handleExists': 'Deze handle is al in gebruik',
    'validation.handleInvalid': 'Handle mag alleen letters, cijfers, streepjes en underscores bevatten',

    // Success/Error berichten
    'success.profileSaved': 'Profiel succesvol opgeslagen',
    'success.profilePublished': 'Profiel succesvol gepubliceerd',
    'success.changesSaved': 'Wijzigingen opgeslagen',
    'error.profileSaveFailed': 'Fout bij opslaan van profiel',
    'error.profileLoadFailed': 'Fout bij laden van profiel',
    'error.uploadFailed': 'Fout bij uploaden van bestand',
  },
  en: {
    // English translations (fallback)
    'nav.dashboard': 'Dashboard',
    'nav.design': 'Design',
    'nav.analytics': 'Analytics',
    'nav.settings': 'Settings',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',
    'nav.login': 'Login',
    'nav.signup': 'Sign Up',

    // Onboarding
    'onboarding.title': 'Welcome to Bookr',
    'onboarding.subtitle': 'Create your professional booking page in minutes',
    'onboarding.next': 'Next',
    'onboarding.back': 'Back',
    'onboarding.finish': 'Finish',
    'onboarding.skip': 'Skip',
    'onboarding.step1.title': 'Choose Your Handle',
    'onboarding.step1.subtitle': 'Pick a unique URL for your booking page',
    'onboarding.step1.handle.label': 'Your unique URL',
    'onboarding.step1.handle.placeholder': 'your-name',
    'onboarding.step1.handle.description': 'This will be your personal link: {urlPrefix}your-name',
    'onboarding.step1.businessName.label': 'Business Name (optional)',
    'onboarding.step1.businessName.placeholder': 'Your Business Name',
    'onboarding.step1.isBusiness.label': 'This is a business profile',
    'onboarding.step1.isBusiness.description': 'Check if you represent a business',

    'onboarding.step2.title': 'Booking Setup',
    'onboarding.step2.subtitle': 'Connect your booking system',
    'onboarding.step2.bookingUrl.label': 'Booking Link',
    'onboarding.step2.bookingUrl.placeholder': 'https://calendly.com/your-name',
    'onboarding.step2.bookingMode.label': 'Booking Mode',
    'onboarding.step2.bookingMode.embed': 'Embed in page',
    'onboarding.step2.bookingMode.newTab': 'Open in new tab',
    'onboarding.step2.whatsapp.label': 'Use WhatsApp',
    'onboarding.step2.whatsapp.description': 'Customers can contact you directly via WhatsApp',
    'onboarding.step2.whatsappNumber.label': 'WhatsApp Number',
    'onboarding.step2.whatsappNumber.placeholder': '+31 6 12345678',

    'onboarding.step3.title': 'Branding',
    'onboarding.step3.subtitle': 'Customize your appearance',
    'onboarding.step3.name.label': 'Your Name',
    'onboarding.step3.name.placeholder': 'Your Name',
    'onboarding.step3.slogan.label': 'Slogan (optional)',
    'onboarding.step3.slogan.placeholder': 'Brief description of what you do',
    'onboarding.step3.avatar.label': 'Profile Photo',
    'onboarding.step3.avatar.description': 'Upload a professional photo of yourself',
    'onboarding.step3.category.label': 'Business Category',
    'onboarding.step3.category.placeholder': 'Select your business type',
    'onboarding.step3.banner.label': 'Banner Background',
    'onboarding.step3.banner.color': 'Solid Color',
    'onboarding.step3.banner.image': 'Background Image',
    'onboarding.step3.banner.heading.label': 'Main Title',
    'onboarding.step3.banner.heading.placeholder': 'Welcome to my services',
    'onboarding.step3.banner.subheading.label': 'Subtitle',
    'onboarding.step3.banner.subheading.placeholder': 'Professional service delivery',

    'onboarding.step4.title': 'About & Media',
    'onboarding.step4.subtitle': 'Tell your story',
    'onboarding.step4.aboutTitle.label': 'Title for your story',
    'onboarding.step4.aboutTitle.placeholder': 'Meet {name}',
    'onboarding.step4.aboutDescription.label': 'Your story',
    'onboarding.step4.aboutDescription.placeholder': 'Tell customers about yourself, your experience and what you offer...',
    'onboarding.step4.aboutAlignment.label': 'Alignment',
    'onboarding.step4.aboutYou.title': 'About You',
    'onboarding.step4.aboutYou.alreadySaved': '(Already saved)',
    'onboarding.step4.aboutYou.titleLabel': 'Title',
    'onboarding.step4.aboutYou.descriptionLabel': 'Description',
    'onboarding.step4.aboutYou.descriptionPlaceholder': 'Hi! I\'m {name}. I help clients feel their best with natural, long-lasting results.',
    'onboarding.step4.aboutYou.characters': 'characters',
    'onboarding.step4.socialLinks.title': 'Social Links',
    'onboarding.step4.mediaGallery.title': 'Media Gallery',
    'onboarding.step4.mediaGallery.images': 'images',
    'onboarding.step4.mediaGallery.existingDescription': 'Your existing media gallery is shown below. You can add more images or reorder them.',
    'onboarding.step4.mediaGallery.uploadDescription': 'Upload 6 of your best images to show your work and what you do.',
    'onboarding.step4.mediaGallery.dragDropDescription': 'Drag and drop to reorder images. First image will be the main image.',
    'onboarding.step4.mediaGallery.addMedia': 'Add Media',
    'onboarding.step4.mediaGallery.remaining': 'remaining',
    'onboarding.step4.mediaGallery.mediaAlt': 'Media',
    'onboarding.step4.extras.title': 'Your extras',
    'onboarding.step4.extras.optionalTitle': 'Optional extras',
    'onboarding.step4.extras.subtitle': 'Your additional information is saved.',
    'onboarding.step4.extras.optionalSubtitle': 'Add more details to make your page stand out.',
    'onboarding.step4.aboutAlignment.center': 'Centered',
    'onboarding.step4.aboutAlignment.left': 'Left aligned',
    'onboarding.step4.media.label': 'Add Media',
    'onboarding.step4.media.description': 'Upload photos of your work or services',
    'onboarding.step4.socials.label': 'Social Media',
    'onboarding.step4.socials.instagram': 'Instagram',
    'onboarding.step4.socials.facebook': 'Facebook',
    'onboarding.step4.socials.linkedin': 'LinkedIn',
    'onboarding.step4.socials.youtube': 'YouTube',

    'onboarding.step5.title': 'Social & Testimonials',
    'onboarding.step5.subtitle': 'Build trust with social proof',
    'onboarding.step5.socialLinks.label': 'Social Links',
    'onboarding.step5.socialLinks.description': 'Add links to your social media profiles',
    'onboarding.step5.testimonials.label': 'Customer Testimonials',
    'onboarding.step5.testimonials.description': 'Add positive reviews from customers',
    'onboarding.step5.testimonials.add': 'Add Testimonial',
    'onboarding.step5.testimonials.customerName': 'Customer Name',
    'onboarding.step5.testimonials.reviewTitle': 'Review Title',
    'onboarding.step5.testimonials.reviewText': 'Review Text',

    'onboarding.step6.title': 'Footer & Settings',
    'onboarding.step6.subtitle': 'Final touches and policies',
    'onboarding.step6.footerBusinessName.label': 'Business Name in Footer',
    'onboarding.step6.footerBusinessName.placeholder': 'Your Business BV',
    'onboarding.step6.address.label': 'Address',
    'onboarding.step6.address.placeholder': 'Street Name 123, 1234 AB City',
    'onboarding.step6.email.label': 'Email',
    'onboarding.step6.email.placeholder': 'info@yourbusiness.com',
    'onboarding.step6.phone.label': 'Phone',
    'onboarding.step6.phone.placeholder': '+31 20 1234567',
    'onboarding.step6.hours.label': 'Opening Hours',
    'onboarding.step6.hours.monday': 'Monday',
    'onboarding.step6.hours.tuesday': 'Tuesday',
    'onboarding.step6.hours.wednesday': 'Wednesday',
    'onboarding.step6.hours.thursday': 'Thursday',
    'onboarding.step6.hours.friday': 'Friday',
    'onboarding.step6.hours.saturday': 'Saturday',
    'onboarding.step6.hours.sunday': 'Sunday',
    'onboarding.step6.hours.open': 'Open',
    'onboarding.step6.hours.close': 'Close',
    'onboarding.step6.hours.closed': 'Closed',

    'onboarding.step7.title': 'Preview',
    'onboarding.step7.subtitle': 'See your final result',
    'onboarding.step7.preview.description': 'See how your page will look to visitors',
    'onboarding.step7.publish': 'Publish Page',
    'onboarding.step7.edit': 'Edit',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome back',
    'dashboard.createProfile': 'Create Your Profile',
    'dashboard.editProfile': 'Edit Profile',
    'dashboard.viewPublicPage': 'View Public Page',
    'dashboard.save': 'Save',
    'dashboard.cancel': 'Cancel',
    'dashboard.edit': 'Edit',
    'dashboard.preview': 'Preview',
    'dashboard.design': 'Design',
    'dashboard.analytics': 'Analytics',
    'dashboard.settings': 'Settings',
    'dashboard.share': 'Share',

    // Edit profile
    'edit.title': 'Edit Profile',
    'edit.save': 'Save Changes',
    'edit.cancel': 'Cancel',
    'edit.preview': 'Preview',
    'edit.publish': 'Publish',
    'edit.unpublish': 'Unpublish',

    // Public profile
    'public.booking': 'Book',
    'public.contact': 'Contact',
    'public.about': 'Meet {name}',
    'public.services': 'Services',
    'public.testimonials': 'Testimonials',
    'public.workResults': 'Work & Results',
    'public.footer': 'Footer',

    // Common UI
    'common.businessName': 'Business Name',
    'common.slogan': 'Slogan',
    'common.category': 'Category',
    'common.about': 'About',
    'common.description': 'Description',
    'common.upload': 'Upload',
    'common.select': 'Select',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.next': 'Next',
    'common.back': 'Back',
    'common.finish': 'Finish',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.required': 'Required',
    'common.optional': 'Optional',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.open': 'Open',
    'common.closed': 'Closed',
    'common.available': 'Available',
    'common.unavailable': 'Not available',
    'common.handleLocked': 'Your current handle (cannot be changed)',
    'common.urlPrefix': 'tapbookr.com/',

    // Language selector
    'language.english': 'English',
    'language.dutch': 'Nederlands',
    'language.select': 'Select Language',

    // Categories
    'category.beauty': 'Beauty & Hair',
    'category.fitness': 'Fitness & Wellness',
    'category.photography': 'Photography',
    'category.consulting': 'Consulting',
    'category.coaching': 'Life Coaching',
    'category.massage': 'Massage & Spa',
    'category.healthcare': 'Healthcare',
    'category.legal': 'Legal',
    'category.financial': 'Financial',
    'category.creative': 'Creative & Design',
    'category.technology': 'Technology',
    'category.education': 'Education',
    'category.other': 'Other',

    // Validation messages
    'validation.required': 'This field is required',
    'validation.minLength': 'Must contain at least {min} characters',
    'validation.maxLength': 'Must contain at most {max} characters',
    'validation.invalidUrl': 'Please enter a valid URL',
    'validation.invalidEmail': 'Please enter a valid email address',
    'validation.handleExists': 'This handle is already in use',
    'validation.handleInvalid': 'Handle can only contain letters, numbers, dashes and underscores',

    // Success/Error messages
    'success.profileSaved': 'Profile saved successfully',
    'success.profilePublished': 'Profile published successfully',
    'success.changesSaved': 'Changes saved',
    'error.profileSaveFailed': 'Failed to save profile',
    'error.profileLoadFailed': 'Failed to load profile',
    'error.uploadFailed': 'Failed to upload file',
  }
};
