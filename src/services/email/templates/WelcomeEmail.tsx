import * as React from "react";
import { Text, Section, Row, Column } from "@react-email/components";
import { Layout } from "./components/Layout";
import { Button } from "./components/Button";

interface WelcomeEmailProps {
  name?: string;
  businessName?: string;
  link?: string;
  primaryColor?: string;
  logoUrl?: string | null;
  message?: string;
  previewText?: string;
  heading?: string;
  benefit1Title?: string;
  benefit1Description?: string;
  benefit2Title?: string;
  benefit2Description?: string;
  buttonText?: string;
  trackingId?: string;
}

export const WelcomeEmail = ({
  name = "{{name}}",
  businessName = "CarniApp",
  link = "https://carniapp.com",
  primaryColor = "#7c3aed",
  logoUrl,
  message,
  previewText,
  heading,
  benefit1Title = "Calidad Premium",
  benefit1Description = "Seleccionamos los mejores cortes para ti.",
  benefit2Title = "Envío Rápido",
  benefit2Description = "Directo a tu puerta en el menor tiempo.",
  buttonText = "Comenzar ahora",
  trackingId,
}: WelcomeEmailProps) => {
  return (
    <Layout
      previewText={previewText || `¡Bienvenido a ${businessName}!`}
      heading={heading || `¡Hola, ${name}!`}
      businessName={businessName}
      primaryColor={primaryColor}
      logoUrl={logoUrl ?? undefined}
      trackingId={trackingId}
    >
      {message ? (
        <Text style={paragraph}>{message}</Text>
      ) : (
        <Text style={paragraph}>
          Estamos encantados de tenerte con nosotros en <strong>{businessName}</strong>. 
          Nuestra misión es brindarte la mejor calidad y servicio directamente a tu mesa.
        </Text>
      )}
      
      <Section style={benefitSection}>
        <Row>
          <Column style={benefitItem}>
            <Text style={benefitTitle}>{benefit1Title}</Text>
            <Text style={benefitText}>{benefit1Description}</Text>
          </Column>
          <Column style={benefitItem}>
            <Text style={benefitTitle}>{benefit2Title}</Text>
            <Text style={benefitText}>{benefit2Description}</Text>
          </Column>
        </Row>
      </Section>

      <Section style={buttonContainer}>
        <Button href={link} primaryColor={primaryColor}>
          {buttonText}
        </Button>
      </Section>

      <Text style={paragraph}>
        Si tienes alguna pregunta, no dudes en responder a este correo. ¡Estamos aquí para ayudarte!
      </Text>
    </Layout>
  );
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#484848",
  textAlign: "center" as const,
};

const benefitSection = {
  margin: "30px 0",
};

const benefitItem = {
  padding: "0 10px",
  textAlign: "center" as const,
};

const benefitTitle = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#333",
  margin: "10px 0 5px",
};

const benefitText = {
  fontSize: "14px",
  color: "#666",
  margin: "0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

export default WelcomeEmail;
