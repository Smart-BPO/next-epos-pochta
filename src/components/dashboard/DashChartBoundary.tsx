"use client";

import { Component, type ReactNode } from "react";
import { dashCardPad, dashSectionTitle } from "@/styles/dashboard";

type Props = {
  title: string;
  children: ReactNode;
};

type State = { failed: boolean };

/** Isolates chart crashes so overview (and dashboard chrome) stay up. */
export class DashChartBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.error("[dashboard:chart]", error);
  }

  render() {
    if (this.state.failed) {
      return (
        <section className={dashCardPad}>
          <h2 className={dashSectionTitle}>{this.props.title}</h2>
          <p className="m-0 mt-3 text-sm text-[var(--dash-muted)]">—</p>
        </section>
      );
    }
    return this.props.children;
  }
}
