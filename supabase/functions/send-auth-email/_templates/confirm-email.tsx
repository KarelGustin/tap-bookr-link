import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Hr,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface ConfirmEmailProps {
  userName: string;
  confirmUrl: string;
  token: string;
}

export const ConfirmEmail = ({
  userName,
  confirmUrl,
  token,
}: ConfirmEmailProps) => (
  <Html>
    <Head />
    <Preview>Bevestig je TapBookr account om te beginnen</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welkom bij TapBookr! 🎉</Heading>
        
        <Text style={text}>
          Hallo {userName},
        </Text>
        
        <Text style={text}>
          Bedankt voor je aanmelding bij TapBookr! Om je account te activeren en te beginnen met het bouwen van je professionele booking pagina, bevestig je e-mailadres door op de onderstaande knop te klikken:
        </Text>

        <Section style={buttonContainer}>
          <Link
            href={confirmUrl}
            target="_blank"
            style={button}
          >
            Bevestig je account
          </Link>
        </Section>

        <Text style={text}>
          Of kopieer en plak deze bevestigingscode:
        </Text>
        
        <Section style={codeContainer}>
          <Text style={code}>{token}</Text>
        </Section>

        <Hr style={hr} />

        <Text style={text}>
          <strong>Wat je kunt verwachten:</strong>
        </Text>
        
        <Text style={listText}>
          • Je eigen professionele booking pagina in 8 eenvoudige stappen<br />
          • Geen technische kennis vereist<br />
          • Direct meer vertrouwen van potentiële klanten<br />
          • Meer boekingen binnen 24 uur
        </Text>

        <Hr style={hr} />

        <Text style={footer}>
          Als je je niet hebt aangemeld bij TapBookr, kun je deze e-mail veilig negeren.
        </Text>

        <Text style={footer}>
          Deze link vervalt over 24 uur.
        </Text>

        <Text style={branding}>
          Veel succes met je nieuwe booking pagina!<br />
          Het TapBookr team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ConfirmEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '8px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  maxWidth: '580px',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '40px 20px 20px',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 20px',
};

const listText = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 20px',
  paddingLeft: '16px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#10b981',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
  transition: 'background-color 0.2s',
};

const codeContainer = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: '8px',
  margin: '24px 20px',
  padding: '16px',
  textAlign: 'center' as const,
};

const code = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: 'bold',
  letterSpacing: '2px',
  margin: '0',
  fontFamily: 'Monaco, Consolas, "Courier New", monospace',
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '32px 20px',
};

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 20px',
};

const branding = {
  color: '#1a1a1a',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '32px 20px 0',
  fontWeight: '500',
};