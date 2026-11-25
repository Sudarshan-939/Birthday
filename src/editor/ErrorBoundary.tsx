import React from 'react';
/** Catches a crashing piece; tries again whenever its props change. */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode; resetKey?: any }, { err: any }> {
  state = { err: null as any };
  static getDerivedStateFromError(err: any) { return { err }; }
  componentDidUpdate(prev: any) { if (this.state.err && prev.resetKey !== this.props.resetKey) this.setState({ err: null }); }
  componentDidCatch(e: any) { console.warn('piece error', e); }
  render() { return this.state.err ? <div className="pc-hint">This piece couldn't show with these settings. Check its fields on the right.</div> : this.props.children; }
}
