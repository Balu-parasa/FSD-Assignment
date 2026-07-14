const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
type ApiResponse<T> = { success: boolean; message: string; data: T };

let refreshPromise: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;
  try {
    const refreshResponse = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (refreshResponse.ok) {
      const refreshBody = (await refreshResponse.json()) as ApiResponse<{ accessToken: string }>;
      const newAccessToken = refreshBody.data.accessToken;
      localStorage.setItem('accessToken', newAccessToken);
      return newAccessToken;
    }
  } catch {}
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  return null;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  let token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      ...headers,
      ...init.headers,
    },
  });

  if (response.status === 401 && path !== '/auth/login' && path !== '/auth/refresh') {
    if (typeof window !== 'undefined') {
      if (!refreshPromise) {
        refreshPromise = performRefresh().finally(() => {
          refreshPromise = null;
        });
      }
      const newAccessToken = await refreshPromise;
      if (newAccessToken) {
        response = await fetch(`${baseUrl}${path}`, {
          ...init,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${newAccessToken}`,
            ...init.headers,
          },
        });
      }
    }
  }

  const body = (await response.json()) as ApiResponse<T>;
  if (!response.ok) throw new Error(body.message);
  return body.data;
}
