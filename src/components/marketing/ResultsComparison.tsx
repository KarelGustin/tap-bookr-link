import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { Link } from "react-router-dom";

export const ResultsComparison = () => {
  const alternatives = [
    {
      name: "DIY Website Bouwer",
      pros: ["Volledige controle", "Aangepast ontwerp"],
      cons: ["Duurt weken", "Vereist vaardigheden", "Dure hosting", "Mobiele problemen"],
      time: "2-4 weken",
      cost: "€200-500"
    },
    {
      name: "Boekingslink in Bio",
      pros: ["Snelle setup", "Gratis"],
      cons: ["Beperkte aanpassing", "Geen boekingsintegratie", "Ziet onprofessioneel uit", "Moeilijk te volgen", "Geen context, alleen prijzen"],
      time: "5 minuten",
      cost: "€0"
    },
    {
      name: "TapBookr",
      pros: ["Live in minuten", "Mobiel geoptimaliseerd", "Boekingsintegratie", "Professionele uitstraling", "WhatsApp-eerst"],
      cons: ["Beperkt tot één pagina"],
      time: "5 minuten",
      cost: "€7/maand"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-blue-500 to-cyan-500">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Vergelijk & kies
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Zie hoe TapBookr zich verhoudt tot alternatieven. Spoiler: we zijn sneller en goedkoper.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          {alternatives.map((alt, index) => (
            <Card key={index} className={`border border-gray-200 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105 group ${
              alt.name === "TapBookr" 
                ? "border-tapbookr-green ring-2 ring-tapbookr-green/20 relative" 
                : ""
            }`}>
              {alt.name === "TapBookr" && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-tapbookr-green text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Aanbevolen
                  </div>
                </div>
              )}
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className={`text-2xl font-bold mb-3 ${
                    alt.name === "TapBookr" ? "text-tapbookr-green" : "text-gray-900"
                  }`}>
                    {alt.name}
                  </h3>
                  <div className="flex items-center justify-center gap-4 text-base font-medium">
                    <span className="text-gray-600">Tijd: <strong className="text-gray-900">{alt.time}</strong></span>
                    <span className="text-gray-600">Kosten: <strong className="text-gray-900">{alt.cost}</strong></span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-tapbookr-green mb-3 flex items-center gap-2 text-lg">
                      <Check className="w-5 h-5" />
                      Voordelen
                    </h4>
                    <ul className="space-y-2">
                      {alt.pros.map((pro, i) => (
                        <li key={i} className="text-gray-700 flex items-start gap-3 text-base">
                          <Check className="w-4 h-4 text-tapbookr-green mt-0.5 flex-shrink-0" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-red-700 mb-3 flex items-center gap-2 text-lg">
                      <X className="w-5 h-5" />
                      Nadelen
                    </h4>
                    <ul className="space-y-2">
                      {alt.cons.map((con, i) => (
                        <li key={i} className="text-gray-700 flex items-start gap-3 text-base">
                          <X className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {alt.name === "TapBookr" && (
                  <div className="mt-8 text-center">
                    <Button asChild variant="tapbookr" size="lg" className="w-full font-semibold hover:scale-105 transition-transform duration-200">
                      <Link to="/onboarding">Start gratis nu</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Results showcase */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 max-w-4xl mx-auto shadow-lg">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">Échte resultaten van échte bedrijven</h3>
            <p className="text-xl text-gray-600">Zie de transformatie</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center group">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8 mb-4 hover:scale-105 transition-transform duration-300">
                <h4 className="font-bold text-red-800 mb-4 text-xl">Vóór: Instagram Bio Link</h4>
                <div className="bg-white rounded-xl p-6 text-gray-700 shadow-sm border border-red-100">
                  <ul className="space-y-2 text-left">
                    <li className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" />
                      Klein, moeilijk te lezen
                    </li>
                    <li className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" />
                      Geen boekingsintegratie
                    </li>
                    <li className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" />
                      Ziet er onprofessioneel uit
                    </li>
                    <li className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" />
                      Moeilijk resultaten te volgen
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="text-center group">
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-4 hover:scale-105 transition-transform duration-300">
                <h4 className="font-bold text-green-800 mb-4 text-xl">Ná: TapBookr Pagina</h4>
                <div className="bg-white rounded-xl p-6 text-gray-700 shadow-sm border border-green-100">
                  <ul className="space-y-2 text-left">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Professionele mobiele pagina
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Één-tap boeken
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      WhatsApp integratie
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Volg bezoeken & clicks
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" variant="tapbookr" className="font-semibold hover:scale-105 transition-transform duration-200 text-lg px-8">
              <Link to="/onboarding">Maak je pagina in 60 seconden</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
