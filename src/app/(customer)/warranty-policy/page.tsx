import {
  PolicyShell,
  PolicySection,
} from "@/components/static/policy-shell";

export default function WarrantyPage() {
  return (
    <PolicyShell
      eyebrow="Policies"
      title="Warranty & Aftercare"
      updated="September 2026"
    >
      <PolicySection heading="Manufacturer Warranty">
        <p>
          Every TimeCart purchase is brand new and covered by the
          manufacturer's warranty. Warranty periods vary by brand — typically
          1–5 years from the date of purchase — and are honored at the brand's
          authorized service centers.
        </p>
      </PolicySection>

      <PolicySection heading="What Is Covered">
        <p>
          Manufacturing defects in movement, case, glass and strap are
          covered. Our team assists with warranty registration, service center
          appointments and claim follow-ups throughout the warranty period.
        </p>
      </PolicySection>

      <PolicySection heading="What Is Not Covered">
        <p>
          The warranty does not cover physical damage, accidental drops,
          scratches, water ingress beyond the watch's stated water
          resistance, battery replacement, or normal wear and tear. Modifying
          the watch at unauthorized dealers voids the warranty.
        </p>
      </PolicySection>

      <PolicySection heading="After-Sales Support">
        <p>
          Need a strap adjustment, glass polish or annual service? Contact our
          support team and we will arrange professional service through our
          partner centers at fair pricing.
        </p>
      </PolicySection>
    </PolicyShell>
  );
}