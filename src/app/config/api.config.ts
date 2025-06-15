export interface ApiConfig {
  baseUrl: string;
}

// Function to get API URL from environment or use default
export function getApiUrl(): string {
  // In server-side rendering context, we can access environment variables
  if (typeof process !== 'undefined' && process.env) {
    return process.env['API_URL'] || 'http://localhost:8000/api/v1';
  }
  
  // In browser environment, try to get from window object (injected by Docker)
  if (typeof window !== 'undefined' && (window as any)['env']) {
    return (window as any)['env']['API_URL'] || 'http://localhost:8000/api/v1';
  }
  
  // For development, use localhost
  return 'http://localhost:8000/api/v1';
}

export const API_CONFIG: ApiConfig = {
  baseUrl: getApiUrl()
};
