import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const FAQ = () => {
  const faqs = [
    {
      question: "Can I use Salonized/Treatwell/Calendly?",
      answer: "Yes—paste your link and Bookr embeds it or opens it in a new tab if embed is blocked."
    },
    {
      question: "Do I need a website?", 
      answer: "No—Bookr is your website. It creates a professional landing page that wraps around your booking system."
    },
    {
      question: "How fast can I go live?",
      answer: "Under 5 minutes. Simply claim your handle, add your details, and publish your page."
    },
    {
      question: "What booking systems do you support?",
      answer: "We support all major booking platforms including Salonized, Treatwell, Calendly, and any system with a public booking link."
    },
    {
      question: "Can I customize the design?",
      answer: "Yes! Choose from different color schemes, upload your logo, add your photos, and customize your content to match your brand."
    },
    {
      question: "Is there a mobile app?",
      answer: "Bookr works perfectly in any web browser and is optimized for mobile. Your customers can book directly from their phones."
    }
  ];

  return (
    <section className="py-20" style={{background: 'var(--gradient-faq)'}}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
            Got questions?
          </h2>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-0 rounded-2xl px-8 bg-black/20 backdrop-blur-sm transition-colors duration-200"
              >
                <AccordionTrigger className="text-left text-lg font-medium py-8 text-white hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-white/80 pb-8 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};