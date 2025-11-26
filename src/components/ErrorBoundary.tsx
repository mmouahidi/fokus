import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo)
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '40px', background: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
                    <h1 style={{ color: '#ef4444', marginBottom: '20px' }}>Something went wrong</h1>
                    <div style={{ background: '#2a2a2a', padding: '20px', borderLeft: '4px solid #ef4444', marginBottom: '20px' }}>
                        <h2 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#f87171' }}>Error:</h2>
                        <pre style={{ color: '#fca5a5', overflow: 'auto' }}>
                            {this.state.error?.toString()}
                        </pre>
                    </div>
                    <div style={{ background: '#2a2a2a', padding: '20px', borderLeft: '4px solid #ef4444' }}>
                        <h2 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#f87171' }}>Stack Trace:</h2>
                        <pre style={{ color: '#cbd5e1', overflow: 'auto', fontSize: '12px' }}>
                            {this.state.error?.stack}
                        </pre>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        Reload Page
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
