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
      cost: "€9/maand"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Vergelijk & kies
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Zie hoe TapBookr zich verhoudt tot alternatieven. Spoiler: we zijn sneller en goedkoper.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          {alternatives.map((alt, index) => (
            <Card key={index} className={`border border-gray-200 bg-white rounded-2xl ${
              alt.name === "TapBookr" 
                ? "border-primary ring-2 ring-primary/20" 
                : ""
            }`}>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className={`text-xl font-bold mb-2 ${
                    alt.name === "TapBookr" ? "text-primary" : "text-gray-900"
                  }`}>
                    {alt.name}
                  </h3>
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                    <span>Tijd: <strong>{alt.time}</strong></span>
                    <span>Kosten: <strong>{alt.cost}</strong></span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Voordelen
                    </h4>
                    <ul className="space-y-1">
                      {alt.pros.map((pro, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-600" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                      <X className="w-4 h-4" />
                      Nadelen
                    </h4>
                    <ul className="space-y-1">
                      {alt.cons.map((con, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-center gap-2">
                          <X className="w-3 h-3 text-red-600" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {alt.name === "TapBookr" && (
                  <div className="mt-6 text-center">
                    <Button asChild className="w-full bg-primary text-gray-900 font-semibold">
                      <Link to="/onboarding">Start gratis nu</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Results showcase */}
        {/* <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Real results from real businesses</h3>
            <p className="text-lg text-gray-600">See the transformation</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="bg-red-100 rounded-2xl p-6 mb-4">
                <h4 className="font-bold text-red-800 mb-2">Before: Instagram Bio Link</h4>
                <div className="bg-white rounded-xl p-4 text-sm text-gray-600">
                  <p>• Tiny, hard to read</p>
                  <p>• No booking integration</p>
                  <p>• Looks unprofessional</p>
                  <p>• Hard to track results</p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-2xl p-6 mb-4">
                <h4 className="font-bold text-green-800 mb-2">After: TapBookr Page</h4>
                <div className="bg-white rounded-xl p-4 text-sm text-gray-600">
                  <p>• Professional mobile page</p>
                  <p>• One-tap booking</p>
                  <p>• WhatsApp integration</p>
                  <p>• Track views & clicks</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <Button asChild size="lg" className="bg-primary text-gray-900 font-semibold">
              <Link to="/onboarding">Create your page in 60 seconds</Link>
            </Button>
          </div>
        </div> */}
      </div>
    </section>
  );
};
