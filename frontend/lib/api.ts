const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000";

export function getApiBaseUrl() {
  // NEXT_PUBLIC_API_BASE_URL should be set locally in frontend/.env.local
  // and in Vercel production to the Render backend URL.
  return (process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, "");
}
