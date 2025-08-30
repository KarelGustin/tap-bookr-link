import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const FAQ = () => {
  const faqs = [
    {
      question: "Kan ik Salonized/Treatwell/Calendly gebruiken?",
      answer: "Ja—plak je link en Bookr integreert het of opent het in een nieuw tabblad als integratie wordt geblokkeerd."
    },
    {
      question: "Heb ik een website nodig?", 
      answer: "Nee—Bookr is je website. Het creëert een professionele landingspagina die om je boekingssysteem heen wordt gebouwd."
    },
    {
      question: "Hoe snel kan ik live gaan?",
      answer: "Binnen 5 minuten. Claim gewoon je handle, voeg je gegevens toe en publiceer je pagina."
    },
    {
      question: "Welke boekingssystemen ondersteunen jullie?",
      answer: "We ondersteunen alle grote boekingsplatforms inclusief Salonized, Treatwell, Calendly en elk systeem met een openbare boekingslink."
    },
    {
      question: "Kan ik het ontwerp aanpassen?",
      answer: "Ja! Kies uit verschillende kleurenschema's, upload je logo, voeg je foto's toe en pas je content aan om bij je merk te passen."
    },
    {
      question: "Is er een mobiele app?",
      answer: "Bookr werkt perfect in elke webbrowser en is geoptimaliseerd voor mobiel. Je klanten kunnen direct vanaf hun telefoon boeken."
    }
  ];

  return (
    <section id="faq" className="py-24 bg-step-blue/10">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Heb je vragen?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Alles wat je moet weten over Bookr.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-6">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-gray-200 rounded-2xl px-8 py-4 bg-white"
              >
                <AccordionTrigger className="text-left text-xl font-bold py-6 text-gray-900 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6 leading-relaxed text-lg">
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