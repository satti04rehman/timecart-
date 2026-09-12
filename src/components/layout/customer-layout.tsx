import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 pb-16 outline-none md:pb-0">
        {children}
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}