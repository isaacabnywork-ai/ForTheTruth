/**
 * Lightweight, dependency-free Google Identity Services (GIS) OAuth 2.0 utility
 * optimized for React 19 and Next.js 15 App Router.
 */

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (notification?: unknown) => void;
          renderButton: (
            parent: HTMLElement,
            options: { theme?: string; size?: string; shape?: string; width?: string }
          ) => void;
        };
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => { requestAccessToken: () => void };
        };
      };
    };
  }
}

let scriptLoaded = false;
let scriptLoadingPromise: Promise<void> | null = null;

/**
 * Dynamically loads the official Google Identity Services library from accounts.google.com
 */
export function loadGoogleAuthScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (scriptLoaded && window.google?.accounts) return Promise.resolve();

  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    script.onerror = () => {
      scriptLoadingPromise = null;
      reject(new Error("Failed to load Google Sign-In script"));
    };
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

export interface GoogleUserProfile {
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  verified: boolean;
}

/**
 * Triggers an interactive Google OAuth 2.0 popup dialog on explicit button clicks,
 * retrieves verified Google account details and official profile picture from Google servers.
 */
export async function initiateGoogleOAuthPopup(clientId?: string): Promise<GoogleUserProfile> {
  const finalClientId = clientId || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!finalClientId) {
    throw new Error("MISSING_CLIENT_ID");
  }

  await loadGoogleAuthScript();

  if (!window.google?.accounts?.oauth2) {
    throw new Error("Google OAuth 2.0 services failed to initialize.");
  }

  return new Promise<GoogleUserProfile>((resolve, reject) => {
    try {
      const client = window.google!.accounts.oauth2.initTokenClient({
        client_id: finalClientId,
        scope: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
        callback: async (response) => {
          if (response.error || !response.access_token) {
            reject(new Error(response.error || "Failed to obtain OAuth access token from Google"));
            return;
          }
          try {
            const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
              headers: { Authorization: `Bearer ${response.access_token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch Google user profile from Google servers");
            const data = await res.json();
            resolve({
              email: data.email,
              firstName: data.given_name || data.name?.split(" ")[0] || "Google Reader",
              lastName: data.family_name || (data.name?.split(" ").slice(1).join(" ") ?? ""),
              avatarUrl: data.picture,
              verified: Boolean(data.email_verified),
            });
          } catch (fetchErr) {
            reject(fetchErr);
          }
        },
      });
      client.requestAccessToken();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Triggers Google One-Tap floating background authentication dialog for returning readers.
 */
export async function initiateGoogleOneTap(clientId?: string): Promise<string> {
  const finalClientId = clientId || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!finalClientId) {
    throw new Error("MISSING_CLIENT_ID");
  }

  await loadGoogleAuthScript();

  if (!window.google?.accounts?.id) {
    throw new Error("Google Sign-In One-Tap could not be initialized.");
  }

  return new Promise<string>((resolve, reject) => {
    try {
      window.google!.accounts.id.initialize({
        client_id: finalClientId,
        callback: (response) => {
          if (response.credential) {
            resolve(response.credential);
          } else {
            reject(new Error("No valid credential received from Google."));
          }
        },
        cancel_on_tap_outside: true,
      });

      window.google!.accounts.id.prompt();
    } catch (err) {
      reject(err);
    }
  });
}
