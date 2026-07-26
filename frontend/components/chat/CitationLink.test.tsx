import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CitationLink from "@/components/chat/CitationLink";
import type { Citation } from "@/lib/types";

function makeCitation(overrides: Partial<Citation> = {}): Citation {
  return {
    sourceType: "statute",
    sourceId: 5,
    title: "The Evidence Act, 1872",
    snippet: "Relevancy of facts",
    ...overrides,
  };
}

describe("CitationLink", () => {
  it("links to statutes for statute citations", () => {
    render(<CitationLink citation={makeCitation({ sourceType: "statute", sourceId: 5 })} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/statutes/5");
  });

  it("links to judgments for judgment citations", () => {
    render(
      <CitationLink citation={makeCitation({ sourceType: "judgment", sourceId: 9 })} />
    );
    expect(screen.getByRole("link")).toHaveAttribute("href", "/judgments/9");
  });

  it("falls back to # for unknown source types", () => {
    render(<CitationLink citation={makeCitation({ sourceType: "sro" })} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "#");
  });

  it("renders the citation title", () => {
    render(<CitationLink citation={makeCitation()} />);
    expect(screen.getByRole("link")).toHaveTextContent("The Evidence Act, 1872");
  });

  it("renders the section number with a section sign when present", () => {
    render(<CitationLink citation={makeCitation({ sectionNumber: "115" })} />);
    expect(screen.getByText("§115")).toBeInTheDocument();
  });

  it("renders the index marker when index is given", () => {
    render(<CitationLink citation={makeCitation()} index={3} />);
    expect(screen.getByText("[3]")).toBeInTheDocument();
  });
});
