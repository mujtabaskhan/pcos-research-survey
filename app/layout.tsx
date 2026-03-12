import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PCOS Research Survey",
  description:
    "A research survey on PCOS awareness, nutrition, supplementation, and lifestyle interventions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@310;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
