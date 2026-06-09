const ADMIN_TOKEN_KEY = "adminToken";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getAdminSessionToken(): string | null {
  if (!isBrowser()) {
    return null;
  }

  const sessionToken = window.sessionStorage.getItem(ADMIN_TOKEN_KEY);
  if (sessionToken) {
    return sessionToken;
  }

  // Migrate older persistent token to session storage once.
  const legacyToken = window.localStorage.getItem(ADMIN_TOKEN_KEY);
  if (legacyToken) {
    window.sessionStorage.setItem(ADMIN_TOKEN_KEY, legacyToken);
    window.localStorage.removeItem(ADMIN_TOKEN_KEY);
    return legacyToken;
  }

  return null;
}

export function setAdminSessionToken(token: string) {
  if (!isBrowser()) {
    return;
  }
  window.sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function clearAdminSessionToken() {
  if (!isBrowser()) {
    return;
  }
  window.sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
}
