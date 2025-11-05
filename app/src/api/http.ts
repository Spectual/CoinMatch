const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token, headers = {} } = options;
  const requestHeaders: HeadersInit = {
    Accept: 'application/json',
    ...headers
  };

  let requestBody: BodyInit | undefined;

  if (body instanceof FormData) {
    requestBody = body;
  } else if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
    requestBody = JSON.stringify(body);
  }

  if (token) {
    requestHeaders['X-Session-Token'] = token;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: requestBody
  });

  if (!response.ok) {
    let errorMessage = `${response.status} ${response.statusText}`;
    try {
      const data = await response.json();
      errorMessage = data?.detail ?? data?.error ?? errorMessage;
    } catch (_err) {
      // ignore JSON parse errors for error payloads
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export { API_BASE_URL };

