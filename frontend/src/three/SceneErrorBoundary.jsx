import { Component } from 'react'

export default class SceneErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    if (import.meta.env.DEV) console.error('FITMATE 3D scene failed to render:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fm-scene-error" role="alert">
          <span>3D EXPERIENCE UNAVAILABLE</span>
          <strong>This scene could not be loaded.</strong>
          <p>You can continue using FITMATE without the 3D view.</p>
          <button type="button" onClick={() => this.setState({ hasError: false })}>Try again</button>
        </div>
      )
    }
    return this.props.children
  }
}
