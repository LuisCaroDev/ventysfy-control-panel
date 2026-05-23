export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const prefix = path.startsWith('/v1') ? '/api/proxy' : '';
  const url = `${prefix}${path.startsWith('/') ? path : `/${path}`}`;

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new ApiError(errorData?.message || `API error: ${response.status}`, response.status);
  }

  return response.json();
}
