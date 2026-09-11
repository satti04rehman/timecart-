import {
  PolicyShell,
  PolicySection,
} from "@/components/static/policy-shell";

export default function PrivacyPage() {
  return (
    <PolicyShell
      eyebrow="Policies"
      title="Privacy Policy"
      updated="September 2026"
    >
      <PolicySection heading="Information We Collect">
        <p>
          We collect the information you provide when you make a purchase or
          create an account — including your name, phone number, email
          address and delivery address. Payment information for bank
          transfers is never stored by us.
        </p>
      </PolicySection>

      <PolicySection heading="How We Use Your Information">
        <p>
          Your information is used to process orders, verify addresses,
          arrange delivery, send order updates, and provide customer
          support. With your consent we may send promotional emails, which
          you can opt out of anytime.
        </p>
      </PolicySection>

      <PolicySection heading="Data Protection">
        <p>
          Your personal data is stored securely and accessed only by
          authorized staff. We never sell or share your information with
          third parties, except as required to fulfill your order (e.g.
          courier partners).
        </p>
      </PolicySection>

      <PolicySection heading="Your Rights">
        <p>
          You may request a copy of your personal data, correct inaccuracies,
          or request deletion of your account and data at any time by
          contacting our support team.
        </p>
      </PolicySection>
    </PolicyShell>
  );
}