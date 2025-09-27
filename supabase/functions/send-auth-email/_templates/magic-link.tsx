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
} from 'https://esm.sh/@react-email/components@0.0.22';
import * as React from 'https://esm.sh/react@18.3.1';

interface MagicLinkEmailProps {
  userName: string;
  loginUrl: string;
  token: string;
}

export const MagicLinkEmail = ({
  userName,
  loginUrl,
  token,
}: MagicLinkEmailProps) => (
  <Html>
    <Head />
    <Preview>Log in bij TapBookr met deze magische link</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welkom terug bij TapBookr! 👋</Heading>
        
        <Text style={text}>
          Hallo {userName},
        </Text>
        
        <Text style={text}>
          Klik op de onderstaande knop om veilig in te loggen bij je TapBookr account:
        </Text>

        <Section style={buttonContainer}>
          <Link
            href={loginUrl}
            target="_blank"
            style={button}
          >
            Inloggen bij TapBookr
          </Link>
        </Section>

        <Text style={text}>
          Of kopieer en plak deze tijdelijke inlogcode:
        </Text>
        
        <Section style={codeContainer}>
          <Text style={code}>{token}</Text>
        </Section>

        <Hr style={hr} />

        <Text style={footer}>
          Als je niet hebt geprobeerd in te loggen, kun je deze e-mail veilig negeren.
        </Text>

        <Text style={footer}>
          Deze link vervalt over 1 uur om je account veilig te houden.
        </Text>

        <Text style={branding}>
          Met vriendelijke groet,<br />
          Het TapBookr team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default MagicLinkEmail;

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

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#6E56CF',
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
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
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