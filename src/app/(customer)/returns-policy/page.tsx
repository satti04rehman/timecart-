import {
  PolicyShell,
  PolicySection,
} from "@/components/static/policy-shell";

export default function ReturnsPage() {
  return (
    <PolicyShell
      eyebrow="Policies"
      title="Returns & Refunds"
      updated="September 2026"
    >
      <PolicySection heading="7-Day Returns">
        <p>
          We want you to love your watch. If it is not what you expected, you
          can return it within <strong>7 days</strong> of delivery for a
          refund or exchange.
        </p>
      </PolicySection>

      <PolicySection heading="Return Conditions">
        <p>
          To be eligible for a return, the watch must be unused, unworn, and
          in its original packaging with all tags and accessories intact. The
          protective films, if any, must remain in place.
        </p>
      </PolicySection>

      <PolicySection heading="How to Start a Return">
        <p>
          1. Contact our support team with your order number.<br />
          2. Our team verifies your order and confirms the pickup.<br />
          3. The watch is inspected on arrival at our facility.<br />
          4. Approved returns are refunded within 3–5 working days.
        </p>
      </PolicySection>

      <PolicySection heading="Refund Method">
        <p>
          COD orders are refunded via bank transfer to the account you
          provide. Bank transfer orders are refunded to the originating
          account. Warranty and after-sales issues are handled directly by the
          brand's authorized service center.
        </p>
      </PolicySection>
    </PolicyShell>
  );
}