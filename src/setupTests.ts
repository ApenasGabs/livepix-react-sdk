import '@testing-library/jest-dom';

// Mock global para import.meta.env
(global as Record<string, unknown>).import = {
  meta: {
    env: {
      VITE_LIVEPIX_CLIENT_ID: 'test-client-id',
      VITE_LIVEPIX_CLIENT_SECRET: 'test-client-secret'
    }
  }
};
