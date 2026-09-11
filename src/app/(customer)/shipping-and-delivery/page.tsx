import {
  PolicyShell,
  PolicySection,
} from "@/components/static/policy-shell";

export default function ShippingPage() {
  return (
    <PolicyShell
      eyebrow="Policies"
      title="Shipping & Delivery"
      updated="September 2026"
    >
      <PolicySection heading="Delivery Time">
        <p>
          Orders placed before 4:00 PM (PKT) are dispatched the same working
          day. Standard delivery typically takes 3–5 working days to any city
          or town in Pakistan.
        </p>
        <p>
          During promotional periods or peak seasons, delivery may take up to
          an additional 2 working days. We will keep you informed via SMS and
          email.
        </p>
      </PolicySection>

      <PolicySection heading="Shipping Charges">
        <p>
          Delivery is <strong>free</strong> on all orders above Rs. 10,000.
          Orders under Rs. 10,000 carry a flat shipping fee of Rs. 199.
        </p>
      </PolicySection>

      <PolicySection heading="Order Verification">
        <p>
          For every order, our team calls the provided phone number to verify
          the delivery address before dispatch. Please keep your phone
          reachable.
        </p>
        <p>
          If we cannot reach you after multiple attempts, dispatch may be
          delayed. Bank transfer orders begin processing once the deposit is
          received and confirmed.
        </p>
      </PolicySection>

      <PolicySection heading="Tracking">
        <p>
          Track your order anytime using the{" "}
          <strong>Track Order</strong> page with your order number. Once
          dispatched you will also receive a courier tracking reference on
          your phone.
        </p>
      </PolicySection>
    </PolicyShell>
  );
}