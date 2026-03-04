import { Component } from 'react';

/**
 * Error boundary basado en clase de React.
 * Captura errores de renderizado en cualquier componente descendiente y muestra una UI de fallback.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info);
    }
    //producción, conectar un logger externo como sentry aquí
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-light flex items-center justify-center p-8">
          <div className="bg-surface border border-neutral-dark/10 shadow-md rounded-2xl p-8 max-w-md w-full text-center">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M12 9v4m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
              </svg>
            </div>
            <p className="text-xl font-heading font-semibold text-neutral-dark mb-2">
              Algo salió mal
            </p>
            <p className="text-sm text-neutral-dark/60 mb-6">
              {this.state.error?.message ?? 'Error inesperado en el componente.'}
            </p>
            <button
              className="bg-primary hover:bg-primary-hover text-white rounded-lg px-5 py-2 transition font-sans font-medium"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
