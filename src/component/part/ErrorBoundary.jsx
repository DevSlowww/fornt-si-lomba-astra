import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Anda bisa melaporkan error ini ke layanan pelaporan error
    console.log(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Anda bisa merender fallback UI
      return <h1>Terjadi Kesalahan. Silakan coba lagi nanti.</h1>;
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
