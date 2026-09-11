import { AdminTable } from "@/components/admin/admin-table";

export default function AdminReviewsPage() {
  const reviews = [
    { author: "Ahmed R.", product: "Casio A168", rating: 5, text: "Great everyday watch, exactly as pictured.", verified: true },
    { author: "Fatima S.", product: "Seiko Presage", rating: 5, text: "Stunning dial. Delivery was fast too.", verified: true },
    { author: "Bilal K.", product: "G-Shock GA-2100", rating: 4, text: "Solid watch, battery-wise. Love the octagon face.", verified: true },
    { author: "Mariam T.", product: "Titan Regalia", rating: 5, text: "Elegant and lightweight. Highly recommend.", verified: true },
    { author: "Umar A.", product: "Orient Kamasu", rating: 5, text: "Real automatic for the price. Amazing value.", verified: true },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl text-ivory">Reviews</h1>
        <p className="mt-1 text-sm text-ivory/50">
          Customer reviews and ratings across products.
        </p>
      </div>
      <AdminTable
        columns={["Customer", "Product", "Rating", "Review", "Verified"]}
        rows={reviews.map((r) => [
          r.author,
          r.product,
          `${r.rating}★`,
          r.text,
          r.verified ? "✓ Verified Purchase" : "—",
        ])}
      />
    </div>
  );
}