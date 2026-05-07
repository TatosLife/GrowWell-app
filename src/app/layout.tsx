import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import AuthGate from "@/components/AuthGate";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "GrowWell Marketing",
  description: "Internal operations platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <AuthGate>
            <AppShell>{children}</AppShell>
          </AuthGate>
        </StoreProvider>
      </body>
    </html>
  );
}
