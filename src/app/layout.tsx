import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MedLens — AI Clinical Intelligence Pipeline",
  description:
    "An AI clinical intelligence system that transforms medical documents into structured, traceable patient records with reference-range analysis and non-diagnostic summaries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className="min-h-screen bg-[#F8FAFC] text-[#1F2937] antialiased selection:bg-[#0EA5E9] selection:text-white">
        {children}
      </body>
    </html>
  );
}
