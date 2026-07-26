import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Badge from "@/components/ui/Badge";

describe("Badge", () => {
  it("renders its children", () => {
    render(<Badge>statute</Badge>);
    expect(screen.getByText("statute")).toBeInTheDocument();
  });

  it("applies statute variant classes", () => {
    render(<Badge variant="statute">Statute</Badge>);
    expect(screen.getByText("Statute")).toHaveClass("bg-blue-50", "text-blue-700");
  });

  it("applies judgment variant classes", () => {
    render(<Badge variant="judgment">Judgment</Badge>);
    expect(screen.getByText("Judgment")).toHaveClass("bg-orange-50", "text-orange-700");
  });

  it("applies sro variant classes", () => {
    render(<Badge variant="sro">SRO</Badge>);
    expect(screen.getByText("SRO")).toHaveClass("bg-violet-50", "text-violet-700");
  });

  it("falls back to default variant classes when no variant is given", () => {
    render(<Badge>Plain</Badge>);
    expect(screen.getByText("Plain")).toHaveClass("bg-gray-100", "text-gray-600");
  });

  it("merges a custom className", () => {
    render(<Badge className="extra-class">X</Badge>);
    expect(screen.getByText("X")).toHaveClass("extra-class");
  });
});
