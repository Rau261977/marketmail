import * as React from "react";
import { Html } from "@react-email/html";
import { Head } from "@react-email/head";
import { Preview } from "@react-email/preview";
import { Body } from "@react-email/body";
import { Container } from "@react-email/container";
import { Section } from "@react-email/section";
import { Img } from "@react-email/img";
import { Heading } from "@react-email/heading";
import { Hr } from "@react-email/hr";
import { Text } from "@react-email/text";
import { Link } from "@react-email/link";
import { Tailwind } from "@react-email/tailwind";

interface LayoutProps {
  children: React.ReactNode;
  previewText?: string;
  heading?: string;
  businessName?: string;
  primaryColor?: string;
  logoUrl?: string;
  trackingId?: string;
}

export const Layout = ({
  children,
  previewText,
  heading,
  businessName = "CarniApp",
  primaryColor = "#7c3aed", // violet-600
  logoUrl = "https://carniapp.com/logo.png",
  trackingId,
}: LayoutProps) => {
  // Ensure NEXT_PUBLIC_APP_URL is set to your production domain in Vercel.
  // Emails sent to external clients need an absolute URL to reach your server.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  
  return (
    <Html>
      <Head />
      <Preview>{previewText || ""}</Preview>
      <Tailwind>
        <Body style={main}>
          <Container style={container}>
            <Section style={logoContainer}>
                <Img
                  src={logoUrl}
                  width="120"
                  alt={businessName}
                  style={logo}
                />
            </Section>
            
            <Section style={content}>
              {heading && (
                <Heading style={h1}>{heading}</Heading>
              )}
              {children}
            </Section>

            <Hr style={hr} />
            
            <Section style={footer}>
              <Text style={footerText}>
                © {new Date().getFullYear()} {businessName}. Todos los derechos reservados.
              </Text>
              <Text style={footerText}>
                Este correo fue enviado a través de <Link href="https://carniapp.com" style={footerLink}>CarniApp</Link>.
              </Text>
              <Text style={footerText}>
                Si ya no deseas recibir estos correos, puedes <Link href="{{unsubscribe_url}}" style={footerLink}>darte de baja aquí</Link>.
              </Text>
            </Section>

            {/* Tracking Pixel */}
            {trackingId && (
              <Img
                src={`${appUrl}/api/t/${trackingId}`}
                width="1"
                height="1"
                alt=""
                style={{ opacity: 0, height: '1px', width: '1px' }}
              />
            )}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  borderRadius: "8px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
};

const logoContainer = {
  padding: "32px 48px",
};

const logo = {
  margin: "0 auto",
  display: "block",
};

const content = {
  padding: "0 48px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer = {
  padding: "0 48px",
};

const footerText = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
  margin: "4px 0",
};

const footerLink = {
  color: "#8898aa",
  textDecoration: "underline",
};
