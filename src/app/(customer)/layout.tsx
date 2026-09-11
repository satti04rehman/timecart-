import CustomerLayout from "@/components/layout/customer-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <CustomerLayout>{children}</CustomerLayout>;
}