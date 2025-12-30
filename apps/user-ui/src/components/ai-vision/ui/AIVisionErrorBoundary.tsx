'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { PremiumButton } from './PremiumButton';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    showDetails: boolean;
}

export class AIVisionErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            showDetails: false,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({ errorInfo });

        // Log to error reporting service (if available)
        console.error('AI Vision Error:', error, errorInfo);

        // Call custom error handler
        this.props.onError?.(error, errorInfo);
    }

    handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            showDetails: false,
        });
    };

    toggleDetails = () => {
        this.setState(prev => ({ showDetails: !prev.showDetails }));
    };

    override render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[400px] flex items-center justify-center p-8">
                    <div className="max-w-lg w-full text-center">
                        {/* Icon */}
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                            <AlertTriangle className="w-10 h-10 text-red-400" />
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl font-bold text-[var(--av-pearl)] mb-3 font-serif">
                            Something Went Wrong
                        </h3>

                        {/* Description */}
                        <p className="text-[var(--av-silver)] mb-6 leading-relaxed">
                            We encountered an unexpected error in the AI Vision Studio.
                            This has been logged and we're working to fix it.
                        </p>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                            <PremiumButton
                                variant="primary"
                                onClick={this.handleRetry}
                                glow
                            >
                                <RefreshCw size={18} className="mr-2" />
                                Try Again
                            </PremiumButton>

                            <button
                                onClick={this.toggleDetails}
                                className="flex items-center justify-center gap-2 px-4 py-2 text-[var(--av-silver)] hover:text-[var(--av-pearl)] transition-colors"
                            >
                                {this.state.showDetails ? (
                                    <>
                                        <ChevronUp size={16} />
                                        Hide Details
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown size={16} />
                                        Show Details
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Error Details (Expandable) */}
                        {this.state.showDetails && this.state.error && (
                            <div className="text-left bg-[#0A0A0A] rounded-xl p-4 border border-white/10 overflow-auto max-h-[200px]">
                                <p className="text-red-400 font-mono text-sm mb-2">
                                    {this.state.error.name}: {this.state.error.message}
                                </p>
                                {this.state.errorInfo && (
                                    <pre className="text-[var(--av-ash)] font-mono text-xs whitespace-pre-wrap">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
