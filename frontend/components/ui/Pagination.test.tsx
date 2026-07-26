import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Pagination from "@/components/ui/Pagination";

// next/navigation and next-intl are mocked globally in vitest.setup.ts;
// the translator is a key-echo, so aria-labels are "previous" / "next".

describe("Pagination", () => {
  it("renders all page numbers when totalPages <= 7", () => {
    render(<Pagination page={1} totalPages={5} onPageChange={() => {}} />);
    for (let p = 1; p <= 5; p++) {
      expect(screen.getByRole("button", { name: String(p) })).toBeInTheDocument();
    }
  });

  it("renders nothing when there is a single page", () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} onPageChange={() => {}} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("marks the current page with aria-current", () => {
    render(<Pagination page={3} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByRole("button", { name: "3" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("button", { name: "2" })).not.toHaveAttribute("aria-current");
  });

  it("disables the previous button on the first page", () => {
    render(<Pagination page={1} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByRole("button", { name: "previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "next" })).toBeEnabled();
  });

  it("disables the next button on the last page", () => {
    render(<Pagination page={5} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByRole("button", { name: "next" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "previous" })).toBeEnabled();
  });

  it("calls onPageChange with the clicked page number", () => {
    const onPageChange = vi.fn();
    render(<Pagination page={1} totalPages={5} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole("button", { name: "4" }));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it("does not call onPageChange when clicking the current page", () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} totalPages={5} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("collapses long ranges with ellipses", () => {
    render(<Pagination page={5} totalPages={20} onPageChange={() => {}} />);
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "20" })).toBeInTheDocument();
    expect(screen.getAllByText("…").length).toBe(2);
    expect(screen.queryByRole("button", { name: "10" })).not.toBeInTheDocument();
  });
});
