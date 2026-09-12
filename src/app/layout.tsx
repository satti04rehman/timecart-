import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { Toaster } from "sonner";
import { StoreProvider } from "@/providers/store-provider";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TIME CART — Where Time Meets Style",
    template: "%s | TIME CART",
  },
  description:
    "TIME CART — a premium online watch destination. Discover authentic watches from trusted brands, designed for every moment.",
  keywords: [
    "watches",
    "luxury watches",
    "men's watches",
    "women's watches",
    "Casio",
    "Seiko",
    "wear a watch",
    "TimeCart",
  ],
  openGraph: {
    title: "TIME CART — Where Time Meets Style",
    description:
      "Discover authentic watches from trusted brands, designed for every moment.",
    type: "website",
  },
  metadataBase: new URL("https://timecart.example.com"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background font-sans text-foreground">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-obsidian focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-ivory focus:shadow-lg"
        >
          Skip to content
        </a>
        <StoreProvider>{children}</StoreProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#111111",
              color: "#f7f5f0",
              borderRadius: "8px",
              border: "1px solid #e7e5e0",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}