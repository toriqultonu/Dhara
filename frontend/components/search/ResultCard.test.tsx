import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ResultCard from "@/components/search/ResultCard";
import type { SearchResult } from "@/lib/types";

function makeResult(overrides: Partial<SearchResult> = {}): SearchResult {
  return {
    sourceType: "statute",
    sourceId: 42,
    title: "The Penal Code, 1860 — Section 302",
    snippet: "Whoever commits murder shall be punished with death...",
    score: 0.87,
    metadata: {},
    ...overrides,
  };
}

describe("ResultCard", () => {
  it("renders the title and snippet", () => {
    render(<ResultCard result={makeResult()} />);
    expect(screen.getByText("The Penal Code, 1860 — Section 302")).toBeInTheDocument();
    expect(
      screen.getByText("Whoever commits murder shall be punished with death...")
    ).toBeInTheDocument();
  });

  it("links to the statute page for statute results", () => {
    render(<ResultCard result={makeResult({ sourceType: "statute", sourceId: 42 })} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/statutes/42");
  });

  it("links to the judgment page for judgment results", () => {
    render(<ResultCard result={makeResult({ sourceType: "judgment", sourceId: 7 })} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/judgments/7");
  });

  it("uses # for unknown source types", () => {
    render(<ResultCard result={makeResult({ sourceType: "sro", sourceId: 3 })} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "#");
  });

  it("shows a badge matching the source type", () => {
    render(<ResultCard result={makeResult({ sourceType: "judgment" })} />);
    expect(screen.getByText("judgment")).toHaveClass("bg-orange-50", "text-orange-700");
  });

  it("renders the relevance percentage from the score", () => {
    render(<ResultCard result={makeResult({ score: 0.87 })} />);
    expect(screen.getByText("87%")).toBeInTheDocument();
  });
});
