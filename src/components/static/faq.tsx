import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "How do I place an order?",
    a: "Browse our collection, add watches to your bag, and checkout with Cash on Delivery or Bank Transfer. Your order is confirmed instantly and our team calls you to verify delivery details.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Cash on Delivery (up to Rs. 60,000) and Bank Transfer. For orders above Rs. 60,000 paid by bank transfer, a 50% advance is required to confirm, with the balance payable on delivery.",
  },
  {
    q: "How long does delivery take?",
    a: "Orders placed before 4 PM are dispatched the same day and typically arrive within 3–5 working days, anywhere in Pakistan.",
  },
  {
    q: "Can I track my order?",
    a: "Yes. Use the Track Order page with your order number (e.g. TC-123456) to see real-time status from confirmation to delivery.",
  },
  {
    q: "What is your return policy?",
    a: "We offer a 7-day hassle-free return window after delivery for unworn watches in original packaging. Refunds follow your original payment method.",
  },
  {
    q: "Are the watches genuine?",
    a: "Absolutely. Every watch we sell is 100% authentic and covered by the manufacturer's warranty.",
  },
  {
    q: "Do you ship to all of Pakistan?",
    a: "Yes, we deliver nationwide through reliable courier partners. Delivery is free on orders above Rs. 10,000.",
  },
  {
    q: "What if a product is out of stock?",
    a: "Add the watch to your wishlist and we'll notify you as soon as it's back in stock.",
  },
];

export function FaqAccordion() {
  return (
    <Accordion type="single" collapsible className="rounded-xl border border-soft-gray bg-white px-5">
      {FAQS.map((f) => (
        <AccordionItem key={f.q} value={f.q}>
          <AccordionTrigger>{f.q}</AccordionTrigger>
          <AccordionContent>{f.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}