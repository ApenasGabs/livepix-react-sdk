import '@testing-library/jest-dom';

// Polyfill para permitir teste de redirecionamento (window.location.href) no JSDOM sem erro de navegação não implementada
try {
  if (typeof window !== 'undefined' && window.location) {
    const symbols = Object.getOwnPropertySymbols(window.location);
    const sym = symbols.find((s) => s.toString() === 'Symbol(impl)') || symbols[0];
    if (sym) {
      const locImpl = (window.location as unknown as Record<symbol, unknown>)[sym] as Record<string, unknown> | undefined;
      if (locImpl) {
        const proto = Object.getPrototypeOf(locImpl) as Record<string, unknown> | null;
        if (proto) {
          proto._locationObjectSetterNavigate = function (newURL: unknown) {
            if (this && (this as Record<string, unknown>)._relevantDocument) {
              ((this as Record<string, unknown>)._relevantDocument as Record<string, unknown>)._URL = newURL;
            }
          };
        }
      }
    }
  }
} catch {
  // Ignora se não estiver em ambiente JSDOM
}

// Mock global para import.meta.env
(global as Record<string, unknown>).import = {
  meta: {
    env: {
      VITE_LIVEPIX_CLIENT_ID: 'test-client-id',
      VITE_LIVEPIX_CLIENT_SECRET: 'test-client-secret'
    }
  }
};
