import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  label?: string
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Panel error:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="rounded-[var(--rlg)] border border-[rgba(239,68,68,0.25)] bg-[var(--s1)] p-6 text-center"
          role="alert"
        >
          <p className="mb-3 text-sm text-[var(--text2)]">
            {this.props.label || 'This section'} crashed unexpectedly.
          </p>
          <button
            type="button"
            className="act-btn act-btn-primary"
            onClick={() => this.setState({ hasError: false })}
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
