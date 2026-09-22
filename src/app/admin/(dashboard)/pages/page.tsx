import { AdminTable } from "@/components/admin/admin-table";

export default function AdminPagesPage() {
  const pages = [
    { title: "Home", route: "/", status: "Published", updated: "Sep 01" },
    { title: "All Watches", route: "/watches", status: "Published", updated: "Sep 02" },
    { title: "About Us", route: "/about-us", status: "Published", updated: "Sep 03" },
    { title: "Contact", route: "/contact", status: "Published", updated: "Sep 03" },
    { title: "FAQ", route: "/faq", status: "Published", updated: "Sep 04" },
    { title: "Returns Policy", route: "/returns-policy", status: "Published", updated: "Sep 05" },
    { title: "Terms & Conditions", route: "/terms", status: "Published", updated: "Sep 05" },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl text-ivory">Pages</h1>
        <p className="mt-1 text-sm text-ivory/50">
          Storefront pages and their publishing status.
        </p>
      </div>
      <AdminTable
        columns={["Page", "Route", "Status", "Last Updated"]}
        rows={pages.map((p) => [
          p.title,
          <code key={p.title} className="text-xs">{p.route}</code>,
          <span key={p.title} className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            {p.status}
          </span>,
          p.updated,
        ])}
      />
    </div>
  );
}