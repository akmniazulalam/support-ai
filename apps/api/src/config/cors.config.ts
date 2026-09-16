const DEFAULT_DEVELOPMENT_ORIGINS = ['http://localhost:3000'];
const ALLOWED_METHODS = ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'];
const ALLOWED_HEADERS = ['Accept', 'Authorization', 'Content-Type'];

export interface CorsConfiguration {
  origin: string | string[] | false;
  credentials: false;
  methods: string[];
  allowedHeaders: string[];
  maxAge: number;
}

/**
 * CORS is an allowlist for browser reads, not an authorization mechanism.
 * The public chat session token is explicitly supplied in a header or body,
 * and no browser credentials/cookies are accepted by this API.
 */
export function getCorsConfiguration(
  configuredOrigins = process.env.CORS_ALLOWED_ORIGINS,
  nodeEnvironment = process.env.NODE_ENV,
): CorsConfiguration {
  const origins = parseConfiguredOrigins(configuredOrigins);

  if (origins.length === 0) {
    return {
      origin:
        nodeEnvironment === 'production' ? false : DEFAULT_DEVELOPMENT_ORIGINS,
      credentials: false,
      methods: ALLOWED_METHODS,
      allowedHeaders: ALLOWED_HEADERS,
      maxAge: 600,
    };
  }

  if (origins.includes('*')) {
    return {
      origin: '*',
      credentials: false,
      methods: ALLOWED_METHODS,
      allowedHeaders: ALLOWED_HEADERS,
      maxAge: 600,
    };
  }

  return {
    origin: origins,
    credentials: false,
    methods: ALLOWED_METHODS,
    allowedHeaders: ALLOWED_HEADERS,
    maxAge: 600,
  };
}

function parseConfiguredOrigins(value: string | undefined): string[] {
  const origins = (value ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  if (origins.includes('*') && origins.length > 1) {
    throw new Error(
      'CORS_ALLOWED_ORIGINS must use either "*" or a comma-separated origin allowlist, not both.',
    );
  }

  return origins;
}
