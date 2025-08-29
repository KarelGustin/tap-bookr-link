import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Printer } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface SubscriptionData {
  id: string;
  status: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

interface InvoiceGeneratorProps {
  profile: Profile;
}

export function InvoiceGenerator({ profile }: InvoiceGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateInvoice = () => {
    setIsGenerating(true);
    
    // Create invoice content
    const invoiceContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Factuur - TapBookr</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
          .header { border-bottom: 2px solid #6E56CF; padding-bottom: 20px; margin-bottom: 30px; }
          .company-info { display: flex; justify-content: space-between; align-items: flex-start; }
          .logo { font-size: 24px; font-weight: bold; color: #6E56CF; }
          .invoice-info { text-align: right; }
          .customer-info { margin: 30px 0; }
          .invoice-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .invoice-table th { background-color: #f8f9fa; font-weight: bold; }
          .total-row { background-color: #f8f9fa; font-weight: bold; }
          .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          @media print { 
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-info">
            <div>
              <div class="logo">TapBookr</div>
              <p>
                TapBookr B.V.<br>
                Herengracht 124<br>
                1015 BT Amsterdam<br>
                Nederland<br>
                KvK: 12345678<br>
                BTW: NL123456789B01
              </p>
            </div>
            <div class="invoice-info">
              <h2>FACTUUR</h2>
              <p>
                <strong>Factuurnummer:</strong> TB-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${profile.id.slice(-8)}<br>
                <strong>Factuurdatum:</strong> ${new Date().toLocaleDateString('nl-NL')}<br>
                <strong>Vervaldatum:</strong> ${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL')}
              </p>
            </div>
          </div>
        </div>

        <div class="customer-info">
          <h3>Factuuradres:</h3>
          <p>
            ${profile.name || 'Naam niet ingevuld'}<br>
            ${profile.footer_address || 'Adres niet ingevuld'}<br>
            ${profile.footer_email || 'Email niet ingevuld'}
          </p>
        </div>

        <table class="invoice-table">
          <thead>
            <tr>
              <th>Omschrijving</th>
              <th>Periode</th>
              <th>Aantal</th>
              <th>Bedrag (excl. BTW)</th>
              <th>BTW (21%)</th>
              <th>Totaal (incl. BTW)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>TapBookr Pro Abonnement</td>
              <td>Maandelijks abonnement</td>
              <td>1</td>
              <td>€5,79</td>
              <td>€1,21</td>
              <td>€7,00</td>
            </tr>
            <tr class="total-row">
              <td colspan="5"><strong>Totaal te betalen</strong></td>
              <td><strong>€7,00</strong></td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>
            <strong>Betaalvoorwaarden:</strong> Betaling binnen 14 dagen na factuurdatum.<br>
            <strong>Betalingswijze:</strong> Automatische incasso via Stripe<br>
            <strong>IBAN:</strong> NL91 ABNA 0417 1643 00 (TapBookr B.V.)<br><br>
            
            Bij vragen over deze factuur kunt u contact opnemen via support@tapbookr.com<br>
            TapBookr B.V. is ingeschreven bij de Kamer van Koophandel onder nummer 12345678
          </p>
        </div>
      </body>
      </html>
    `;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(invoiceContent);
      printWindow.document.close();
      
      // Add print button to the invoice
      printWindow.document.body.innerHTML += `
        <div class="no-print" style="position: fixed; top: 20px; right: 20px; background: white; padding: 10px; border: 1px solid #ccc; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <button onclick="window.print()" style="padding: 8px 16px; background: #6E56CF; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 5px;">
            Printen / Opslaan als PDF
          </button>
          <button onclick="window.close()" style="padding: 8px 16px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Sluiten
          </button>
        </div>
      `;
    }

    setIsGenerating(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <Card className="border-0 bg-muted/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Maandelijkse Factuur</h4>
            <p className="text-sm text-muted-foreground">
              Maandelijks - €7,00
            </p>
          </div>
          <Button
            onClick={generateInvoice}
            disabled={isGenerating}
            variant="outline"
            size="sm"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2" />
                Genereren...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Print Factuur
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}