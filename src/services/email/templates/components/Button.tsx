import { Button as ReactEmailButton } from "@react-email/button";
import * as React from "react";

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  primaryColor?: string;
}

export const Button = ({ href, children, primaryColor = "#000000" }: ButtonProps) => (
  <ReactEmailButton
    style={{
      backgroundColor: primaryColor,
      borderRadius: "10px",
      color: "#000",
      fontSize: "16px",
      fontWeight: "600",
      textDecoration: "none",
      textAlign: "center" as const,
      display: "block",
      padding: "12px 20px",
      margin: "20px 0",
    }}
    className="mob-btn"
    href={href}
  >
    {children}
  </ReactEmailButton>
);
