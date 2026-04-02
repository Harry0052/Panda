"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Home } from "lucide-react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="text-6xl">🐼</div>
            <h2 className="text-2xl font-bold text-[#2F2F2F]">Oops! Panda tripped over a bamboo stalk</h2>
            <p className="text-[#6B7280]">
              Something went wrong, but don&apos;t worry — your progress is safe!
            </p>
            {this.state.error && (
              <p className="text-xs text-[#6B7280] bg-[#F0EDE6] rounded-xl p-3 font-mono break-all">
                {this.state.error.message}
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="bg-[#4F7C57] hover:bg-[#3d6345] text-white rounded-2xl px-6 py-5"
              >
                <RefreshCw size={16} className="mr-2" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = "/"}
                className="border-[#E5E2DA] rounded-2xl px-6 py-5"
              >
                <Home size={16} className="mr-2" />
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
