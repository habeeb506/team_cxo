import { Component } from 'react';

import Alert from './ui/Alert.jsx';
import Button from './ui/Button.jsx';

/**
 * Catches render-time errors anywhere below it in the tree so one
 * broken component (a future dashboard widget, a report chart) can't
 * blank the entire app. Wraps the app once in App.jsx; features don't
 * need their own error boundaries unless they want finer-grained
 * fallback UI.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-md space-y-3">
            <Alert variant="error" title="Something went wrong">
              An unexpected error occurred. Try reloading the page.
            </Alert>
            <Button onClick={this.handleReset}>Try again</Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
