import * as React from "react";
import { Text } from "@react-email/text";
import { Section } from "@react-email/section";
import { Row } from "@react-email/row";
import { Column } from "@react-email/column";
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
  unsubscribeUrl?: string;
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
  unsubscribeUrl,
}: WelcomeEmailProps) => {
  const replacePlaceholders = (text: string | undefined) => {
    if (!text) return text;
    return text
      .replace(/{{nombre}}/g, name)
      .replace(/{{name}}/g, name);
  };

  const finalHeading = replacePlaceholders(heading) || `¡Hola, ${name}!`;
  const finalMessage = replacePlaceholders(message);
  const finalPreviewText = replacePlaceholders(previewText) || `¡Bienvenido a ${businessName}!`;
  const b1Title = replacePlaceholders(benefit1Title);
  const b1Desc = replacePlaceholders(benefit1Description);
  const b2Title = replacePlaceholders(benefit2Title);
  const b2Desc = replacePlaceholders(benefit2Description);

  return (
    <Layout
      previewText={finalPreviewText}
      heading={finalHeading}
      businessName={businessName}
      primaryColor={primaryColor}
      logoUrl={logoUrl ?? undefined}
      trackingId={trackingId}
      unsubscribeUrl={unsubscribeUrl}
    >
      {finalMessage ? (
        finalMessage.split('\n').map((line, i) => (
          <Text key={i} style={paragraph} className="mob-font-p">{line || <br />}</Text>
        ))
      ) : (
        <Text style={paragraph} className="mob-font-p">
          Estamos encantados de tenerte con nosotros en <strong>{businessName}</strong>. 
          Nuestra misión es brindarte la mejor calidad y servicio directamente a tu mesa.
        </Text>
      )}
      
      <Section style={benefitSection}>
        <Row>
          <Column style={benefitItem}>
            <Text style={benefitTitle} className="mob-font-benefit-title">{b1Title || benefit1Title}</Text>
            <Text style={benefitText} className="mob-font-benefit-text">{b1Desc || benefit1Description}</Text>
          </Column>
          <Column style={benefitItem}>
            <Text style={benefitTitle} className="mob-font-benefit-title">{b2Title || benefit2Title}</Text>
            <Text style={benefitText} className="mob-font-benefit-text">{b2Desc || benefit2Description}</Text>
          </Column>
        </Row>
      </Section>

      <Section style={buttonContainer}>
        <Button 
          href={trackingId 
            ? `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/c/${trackingId}?to=${encodeURIComponent(link)}` 
            : link
          } 
          primaryColor={primaryColor}
        >
          {buttonText}
        </Button>
      </Section>

      <Text style={paragraph} className="mob-font-p">
        Si tienes alguna pregunta, no dudes en responder a este correo. ¡Estamos aquí para ayudarte!
      </Text>
    </Layout>
  );
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#484848",
  textAlign: "left" as const,
};

const benefitSection = {
  margin: "30px 0",
  backgroundColor: "#f0f7ff",
  padding: "20px 10px",
  borderRadius: "12px",
  border: "1px solid #e0eeff",
};

const benefitItem = {
  padding: "10px",
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
