import { createClient } from "@/lib/supabase/client";

export interface CustomerSession {
  email: string;
  name: string;
}

function nameFromMetadata(user: {
  user_metadata?: {
    full_name?: string;
    name?: string;
  };
  email?: string;
}): string {
  const meta = user.user_metadata;
  const metaName = meta?.full_name || meta?.name;
  if (metaName) return metaName;
  if (user.email) return user.email.split("@")[0];
  return "Customer";
}

/**
 * Resolves the currently signed-in customer.
 * Prefers a real Supabase session, then falls back to the
 * local demo session used when Supabase isn't configured.
 */
export async function getCustomer(): Promise<CustomerSession | null> {
  try {
    const client = createClient();
    const { data, error } = await client.auth.getUser();
    if (!error && data?.user) {
      return {
        email: data.user.email ?? "",
        name: nameFromMetadata(data.user),
      };
    }
  } catch {
    // Supabase not configured — fall through to local session.
  }

  try {
    const raw = localStorage.getItem("tc-session");
    if (raw) {
      const session = JSON.parse(raw) as { email?: string; name?: string };
      if (session.email) {
        return {
          email: session.email,
          name: session.name || session.email.split("@")[0],
        };
      }
    }
  } catch {
    // Ignore malformed local sessions.
  }

  return null;
}

/**
 * Signs the customer out of both Supabase and any local demo session.
 */
export async function signOutCustomer(): Promise<void> {
  try {
    await createClient().auth.signOut();
  } catch {
    // Supabase not configured — local cleanup below still runs.
  }

  clearLocalCustomerData();
}

/**
 * Removes every TimeCart local key (session, profile, cart, wishlist,
 * orders, addresses, search history). Used when signing out of a demo
 * session and when an account is deleted.
 */
export function clearLocalCustomerData(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      keys.push(window.localStorage.key(i) ?? "");
    }
    keys
      .filter((key) => key.startsWith("tc-"))
      .forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Ignore storage failures.
  }
}