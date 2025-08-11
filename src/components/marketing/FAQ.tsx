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
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight">
            Got questions?
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 font-semibold">
            Everything you need to know about Bookr.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-6">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-0 rounded-3xl px-10 py-4 bg-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <AccordionTrigger className="text-left text-xl font-black py-8 text-gray-900 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-8 leading-relaxed text-lg font-medium">
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