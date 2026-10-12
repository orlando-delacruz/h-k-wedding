import React from 'react'

/**
 * Keeps one broken section from blanking the whole invitation.
 * The public invitation and RSVP stay usable, and the guest gets a real explanation
 * plus a retry instead of an empty screen.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error) {
    console.error('[section error]', error)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <section className="sec">
        <div className="gate-panel" data-reveal="in">
          <div className="gate-badge" aria-hidden="true">!</div>
          <h3>This part could not be displayed</h3>
          <p>
            The rest of the invitation still works. Reloading usually fixes it, and your
            RSVP is already recorded.
          </p>
          <div className="gate-actions">
            <button className="btn btn-gold" onClick={() => window.location.reload()}>
              Reload the page
            </button>
            <button
              className="btn btn-outline"
              onClick={() => this.setState({ error: null })}
            >
              Try again
            </button>
          </div>
        </div>
      </section>
    )
  }
}
