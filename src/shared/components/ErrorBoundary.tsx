import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { uiMessages } from '../../utils/uiMessages';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onReset?: () => void;
  resetKey?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  isChunkError: boolean;
}

function isChunkLoadError(error: Error): boolean {
  const msg = error.message || '';
  return (
    error.name === 'ChunkLoadError' ||
    msg.includes('Loading chunk') ||
    msg.includes('dynamically imported module') ||
    msg.includes('Failed to fetch dynamically imported module')
  );
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare props: Readonly<ErrorBoundaryProps>;
  declare state: ErrorBoundaryState;
  declare setState: (state: Partial<ErrorBoundaryState>) => void;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, isChunkError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      isChunkError: isChunkLoadError(error)
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  componentDidUpdate(prevProps: Readonly<ErrorBoundaryProps>) {
    if (this.props.resetKey !== prevProps.resetKey && this.state.hasError) {
      this.setState({ hasError: false, isChunkError: false });
    }
  }

  private handleRetry = () => {
    if (this.state.isChunkError) {
      window.location.reload();
      return;
    }
    this.setState({ hasError: false, isChunkError: false });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const eb = uiMessages.errorBoundary;
      const title = this.state.isChunkError ? eb.chunkTitle : eb.genericTitle;
      const description = this.state.isChunkError ? eb.chunkDescription : eb.genericDescription;
      const buttonLabel = this.state.isChunkError ? eb.chunkAction : eb.genericAction;

      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] bg-background px-4" role="alert" aria-live="assertive">
          <div className="max-w-md w-full text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-danger-500 mx-auto" />
            <h2 className="font-bold text-foreground" style={{ fontSize: 'var(--text-heading-lg)' }}>{title}</h2>
            <p className="text-sm text-muted">{description}</p>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:ring-offset-neutral-800 transition-colors duration-200"
              aria-label={buttonLabel}
            >
              <RefreshCw className="w-4 h-4" />
              {buttonLabel}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
