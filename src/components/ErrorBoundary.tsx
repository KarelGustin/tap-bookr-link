import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ Error caught by boundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Er is een fout opgetreden</h1>
            <p className="text-gray-700 mb-4">
              {this.state.error?.message || 'Er is een onverwachte fout opgetreden.'}
            </p>
            <div className="bg-gray-100 p-4 rounded mb-4">
              <p className="text-sm text-gray-600 mb-2">Mogelijke oorzaken:</p>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>Firebase configuratie ontbreekt (check .env bestand)</li>
                <li>Firebase package niet geïnstalleerd (run: npm install)</li>
                <li>JavaScript error in de applicatie</li>
              </ul>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Pagina herladen
            </button>
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-4">
                <summary className="text-sm text-gray-600 cursor-pointer">Technische details</summary>
                <pre className="mt-2 text-xs bg-gray-800 text-green-400 p-2 rounded overflow-auto max-h-40">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
