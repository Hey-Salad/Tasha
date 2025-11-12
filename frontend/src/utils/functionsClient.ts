const resolveFunctionsBase = (): string => {
  const explicitBase = process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL;
  if (explicitBase && explicitBase.trim().length > 0) {
    return explicitBase.replace(/\/$/, '');
  }

  return '/api';
};

/**
 * Absolute base URL for API handlers.
 * Defaults to the Next.js `/api` namespace but can be overridden (e.g. when pointing at a staging backend).
 */
export const FUNCTIONS_BASE_URL = resolveFunctionsBase();

/**
 * Build a full request URL for a Cloud Function path.
 */
export const buildFunctionsUrl = (path: string): string => {
  const normalizedPath = path.replace(/^\/+/, '');
  return `${FUNCTIONS_BASE_URL}/${normalizedPath}`;
};

/**
 * Safely parse a response as JSON, surfacing HTML/text errors clearly.
 */
export const parseJsonResponse = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get('content-type') ?? '';
  const textBody = await response.text();

  if (!contentType.includes('application/json')) {
    const snippet = textBody.slice(0, 200) || 'Unexpected non-JSON response';
    throw new Error(snippet);
  }

  const data = JSON.parse(textBody) as T;

  if (!response.ok) {
    const errorMessage =
      (typeof (data as any).error === 'string' && (data as any).error) ||
      (typeof (data as any).message === 'string' && (data as any).message) ||
      response.statusText;
    throw new Error(errorMessage);
  }

  return data;
};
