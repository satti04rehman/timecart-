import { AdminTable } from "@/components/admin/admin-table";

export default function AdminContactSubmissionsPage() {
  const inquiries = [
    { name: "Ali Hassan", email: "ali@example.com", subject: "Order Status", message: "When will TC-220191 be dispatched?", date: "Sep 10", read: true },
    { name: "Sara Khan", email: "sara@example.com", subject: "Bank Transfer", message: "I transferred the deposit. How to share the slip?", date: "Sep 10", read: false },
    { name: "Hamza Ali", email: "hamza@example.com", subject: "Product Question", message: "Is the Seiko Presage available in blue?", date: "Sep 09", read: false },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl text-ivory">Inquiries</h1>
        <p className="mt-1 text-sm text-ivory/50">
          Messages sent through the contact form.
        </p>
      </div>
      <AdminTable
        columns={["Customer", "Subject", "Message", "Date", "Status"]}
        rows={inquiries.map((i) => [
          `${i.name} (${i.email})`,
          i.subject,
          i.message,
          i.date,
          i.read ? (
            <span key={i.name} className="rounded-full bg-soft-gray px-2.5 py-1 text-xs font-semibold text-text-gray">
              Read
            </span>
          ) : (
            <span key={i.name} className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
              New
            </span>
          ),
        ])}
      />
    </div>
  );
}