import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, ExternalLink, Receipt, AlertCircle } from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';
import { useToast } from '@/hooks/use-toast';

interface PaidInvoice {
  id: string;
  amount: number;
  currency: string;
  stripe_invoice_id: string;
  hosted_invoice_url: string | null;
  invoice_pdf_url: string | null;
  paid_at: string;
  created_at: string;
  due_date: string | null;
}

interface PaidInvoicesSectionProps {
  profileId: string;
}

export function PaidInvoicesSection({ profileId }: PaidInvoicesSectionProps) {
  const [invoices, setInvoices] = useState<PaidInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadPaidInvoices = async () => {
      try {
        setIsLoading(true);
        
        // Fetch only paid invoices for this profile from Firestore
        const invoicesRef = collection(db, 'profiles', profileId, 'invoices');
        const q = query(
          invoicesRef,
          where('status', '==', 'paid'),
          orderBy('paid_at', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const error = null;

        if (error) {
          console.error('Error loading invoices:', error);
          // toast({
          //   title: "Fout bij laden facturen",
          //   description: "Kon facturen niet laden. Probeer het opnieuw.",
          //   variant: "destructive",
          // });
          return;
        }

        setInvoices(data || []);
      } catch (error) {
        console.error('Error in loadPaidInvoices:', error);
        toast({
          title: "Fout bij laden facturen",
          description: "Er is een onverwachte fout opgetreden.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (profileId) {
      loadPaidInvoices();
    }
  }, [profileId, toast]);

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Stripe amounts are in cents
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDownload = (invoice: PaidInvoice) => {
    if (invoice.hosted_invoice_url) {
      window.open(invoice.hosted_invoice_url, '_blank');
    } else if (invoice.invoice_pdf_url) {
      window.open(invoice.invoice_pdf_url, '_blank');
    } else {
      toast({
        title: "Factuur niet beschikbaar",
        description: "Deze factuur heeft geen download link.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 bg-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Betaalde Facturen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            <span className="ml-2 text-muted-foreground">Facturen laden...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (invoices.length === 0) {
    return (
      <Card className="border-0 bg-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Betaalde Facturen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Geen betaalde facturen gevonden</p>
            <p className="text-sm text-muted-foreground mt-1">
              Betaalde facturen verschijnen hier automatisch na betaling
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-muted/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="w-5 h-5" />
          Betaalde Facturen ({invoices.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className="flex items-center justify-between p-4 bg-background rounded-lg border"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium">
                  TapBookr Factuur #{invoice.stripe_invoice_id?.slice(-8) || invoice.id.slice(-8)}
                </h4>
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                  Betaald
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Betaald op: {formatDate(invoice.paid_at)}
              </p>
              {invoice.due_date && (
                <p className="text-sm text-muted-foreground">
                  Vervaldatum was: {formatDate(invoice.due_date)}
                </p>
              )}
              <p className="font-semibold text-lg">
                {formatAmount(invoice.amount, invoice.currency)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {(invoice.hosted_invoice_url || invoice.invoice_pdf_url) ? (
                <Button
                  onClick={() => handleDownload(invoice)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  Niet beschikbaar
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}