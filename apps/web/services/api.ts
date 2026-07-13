const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
type ApiResponse<T> = { success: boolean; message: string; data: T };
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  const body = (await response.json()) as ApiResponse<T>;
  if (!response.ok) throw new Error(body.message);
  return body.data;
}
