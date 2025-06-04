import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service
    console.error('Uncaught error:', error);
    console.error('Error info:', errorInfo);
    
    // Update state with error info
    this.setState({
      error,
      errorInfo
    });
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Application Error
            </h1>
            
            <div className="mb-4">
              <p className="text-gray-600 font-medium mb-2">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              
              {this.state.errorInfo && (
                <div className="mt-4 p-3 bg-gray-50 rounded text-sm font-mono overflow-auto">
                  <p className="text-gray-500 mb-1">Component Stack:</p>
                  <pre className="text-gray-600 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600 transition-colors"
              >
                Reload Page
              </button>
              
              <button
                onClick={() => {
                  console.error('Error details:', {
                    error: this.state.error,
                    errorInfo: this.state.errorInfo
                  });
                }}
                className="flex-1 bg-gray-100 text-gray-600 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
              >
                Show Details
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 