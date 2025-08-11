import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { OnboardingLayout } from '../OnboardingLayout';
import { Check, Copy, ExternalLink, Edit, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Step5PreviewProps {
  onPublish: () => void;
  onSaveDraft: () => void;
  onEditPage: () => void;
  onBack: () => void;
  profileData: {
    handle: string;
    name?: string;
    bookingUrl: string;
  };
  canPublish: boolean;
  isPublishing: boolean;
}

export const Step5Preview = ({ 
  onPublish, 
  onSaveDraft, 
  onEditPage, 
  onBack, 
  profileData,
  canPublish,
  isPublishing 
}: Step5PreviewProps) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const handlePublish = async () => {
    if (!agreedToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the Terms & Privacy to publish your page.",
        variant: "destructive",
      });
      return;
    }

    await onPublish();
    setShowSuccess(true);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://TapBookr.com/${profileData.handle}`);
    toast({
      title: "Link copied!",
      description: "Your Bookr link has been copied to clipboard.",
    });
  };

  const shareLink = `https://TapBookr.com/${profileData.handle}`;

  if (showSuccess) {
    return (
      <OnboardingLayout
        currentStep={5}
        totalSteps={5}
        title="Your Bookr is live! 🎉"
        subtitle="Congratulations! Your professional booking page is ready."
      >
        <div className="space-y-6 text-center">
          {/* Confetti effect placeholder */}
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-background" />
          </div>

          {/* Share section */}
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Your Bookr page:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-left bg-background p-2 rounded border text-sm">
                  {shareLink}
                </code>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={copyLink}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline"
                className="h-12"
                onClick={() => window.open(shareLink, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Page
              </Button>
              <Button 
                className="h-12"
                onClick={onEditPage}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Page
              </Button>
            </div>
          </div>

          <p className="text-muted-foreground">
            Share your link and start getting bookings!
          </p>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout
      currentStep={5}
      totalSteps={5}
      title="Preview & Publish"
      subtitle="Review your page and go live when ready."
      onBack={onBack}
    >
      <div className="space-y-8">
        {/* Mobile preview */}
        <div className="mx-auto max-w-sm">
          <div className="bg-background border-2 border-border rounded-[2rem] p-1">
            <div className="bg-muted/30 rounded-[1.5rem] p-6 min-h-[400px]">
              {/* Mock preview content */}
              <div className="space-y-4">
                <div className="h-20 bg-gradient-to-r from-primary to-accent rounded-lg"></div>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-muted rounded-full"></div>
                  <div>
                    <div className="font-semibold">{profileData.name || 'Your Name'}</div>
                     <div className="text-sm text-muted-foreground">
                       TapBookr.com/{profileData.handle}
                     </div>
                  </div>
                </div>

                <div className="h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-medium">
                  Book Now
                </div>

                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="aspect-square bg-muted rounded-lg"></div>
                  <div className="aspect-square bg-muted rounded-lg"></div>
                  <div className="aspect-square bg-muted rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Ready to launch</h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Check className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium">Handle locked</div>
                <div className="text-sm text-muted-foreground">
                  TapBookr.com/{profileData.handle}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Check className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium">Booking link set</div>
                <div className="text-sm text-muted-foreground truncate">
                  {new URL(profileData.bookingUrl).hostname}
                </div>
              </div>
            </div>

            {profileData.name ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Check className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium">Name set</div>
                  <div className="text-sm text-muted-foreground">
                    {profileData.name}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="w-5 h-5 rounded-full border-2 border-orange-500"></div>
                <div>
                  <div className="font-medium text-orange-700">Name missing</div>
                  <div className="text-sm text-orange-600">
                    Recommended for professional appearance
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Terms agreement */}
        <div className="flex items-start space-x-2">
          <Checkbox 
            id="terms" 
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(!!checked)}
            className="mt-1"
          />
          <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
            I agree to the{' '}
            <a href="/terms" className="text-primary hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </Label>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handlePublish}
            disabled={!canPublish || !agreedToTerms || isPublishing}
            className="w-full h-12 text-base rounded-lg"
            size="lg"
          >
            {isPublishing ? 'Publishing...' : 'Publish My Bookr'}
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline"
              onClick={onSaveDraft}
              className="h-10"
            >
              Save as Draft
            </Button>
            <Button 
              variant="outline"
              onClick={onEditPage}
              className="h-10"
            >
              Go to Edit Page
            </Button>
          </div>
        </div>

        {!canPublish && (
          <p className="text-center text-sm text-orange-600">
            Complete required fields to publish
          </p>
        )}
      </div>
    </OnboardingLayout>
  );
};