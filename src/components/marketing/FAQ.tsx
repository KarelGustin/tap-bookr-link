import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const FAQ = () => {
  const faqs = [
    {
      question: "Kan ik Salonized, Treatwell of Calendly gebruiken?",
      answer: "Ja — plak je boekingslink en TapBookr integreert het direct in je pagina. Werkt met elk platform dat een publieke boekingslink heeft."
    },
    {
      question: "Heb ik een aparte website nodig?",
      answer: "Nee — TapBookr ís je website. We bouwen een professionele pagina rondom je boekingssysteem. Eén link voor alles."
    },
    {
      question: "Hoe snel kan ik live gaan?",
      answer: "Binnen 5 minuten. Claim je handle, voeg je gegevens toe en publiceer. Je pagina is direct bereikbaar."
    },
    {
      question: "Welke boekingssystemen worden ondersteund?",
      answer: "Alle grote platforms: Salonized, Treatwell, Calendly, en elk systeem met een openbare boekingslink."
    },
    {
      question: "Kan ik het ontwerp aanpassen?",
      answer: "Ja. Kies je kleurenschema, upload je logo, voeg foto's toe en pas je content aan zodat het bij je merk past."
    },
    {
      question: "Wat kost het?",
      answer: "De eerste maand is slechts €1. Daarna €7 per maand. Geen verborgen kosten, geen langlopende contracten. Je kunt op elk moment opzeggen."
    }
  ];

  return (
    <section id="faq" className="py-24 md:py-32 bg-gray-50/50 relative">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-14 md:mb-16">
            <p className="text-[13px] font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 tracking-wide uppercase mb-4">
              FAQ
            </p>
            <h2 className="text-[34px] md:text-[44px] font-extrabold text-gray-950 leading-[1.1] tracking-[-0.03em]">
              Nog vragen?
            </h2>
          </div>
          
          {/* FAQ items */}
          <Accordion type="single" collapsible>
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-b border-gray-200/80 py-1"
              >
                <AccordionTrigger className="text-left text-[16px] font-semibold py-5 text-gray-950 hover:no-underline transition-colors [&[data-state=open]]:text-purple-600">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-[15px] text-gray-500 pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Bottom CTA within FAQ */}
          <div className="mt-14 text-center">
            <p className="text-[15px] text-gray-500 mb-5">Nog andere vragen? We helpen je graag.</p>
            <Button
              asChild
              className="bg-gray-950 text-white h-11 px-6 rounded-full text-[14px] font-medium hover:bg-gray-800 transition-colors"
            >
              <Link to="/onboarding">
                Probeer het zelf — €1 eerste maand
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
