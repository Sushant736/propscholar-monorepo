export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    // credentials: 'include', // Uncomment if you need cookies
  });
  if (!res.ok) {
    let errorMsg = "Unknown error";
    try {
      const err = await res.json();
      errorMsg = err.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  return res.json();
}
