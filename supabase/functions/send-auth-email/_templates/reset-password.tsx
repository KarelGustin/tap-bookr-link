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

interface ResetPasswordEmailProps {
  userName: string;
  resetUrl: string;
  token: string;
}

export const ResetPasswordEmail = ({
  userName,
  resetUrl,
  token,
}: ResetPasswordEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset je TapBookr wachtwoord</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Wachtwoord Reset 🔐</Heading>
        
        <Text style={text}>
          Hallo {userName},
        </Text>
        
        <Text style={text}>
          We hebben een verzoek ontvangen om je TapBookr wachtwoord te resetten. Klik op de onderstaande knop om een nieuw wachtwoord in te stellen:
        </Text>

        <Section style={buttonContainer}>
          <Link
            href={resetUrl}
            target="_blank"
            style={button}
          >
            Nieuw wachtwoord instellen
          </Link>
        </Section>

        <Text style={text}>
          Of kopieer en plak deze resetcode:
        </Text>
        
        <Section style={codeContainer}>
          <Text style={code}>{token}</Text>
        </Section>

        <Hr style={hr} />

        <Text style={warningText}>
          <strong>Belangrijk:</strong> Als je geen wachtwoord reset hebt aangevraagd, kun je deze e-mail veilig negeren. Je account blijft veilig.
        </Text>

        <Text style={footer}>
          Deze link vervalt over 1 uur om je account veilig te houden.
        </Text>

        <Text style={footer}>
          Voor vragen over je account kun je altijd contact met ons opnemen.
        </Text>

        <Text style={branding}>
          Met vriendelijke groet,<br />
          Het TapBookr team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ResetPasswordEmail;

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

const warningText = {
  color: '#dc2626',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 20px',
  backgroundColor: '#fef2f2',
  padding: '16px',
  borderRadius: '8px',
  border: '1px solid #fecaca',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#dc2626',
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
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
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