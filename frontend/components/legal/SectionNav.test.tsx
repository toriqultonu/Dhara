import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SectionNav from "@/components/legal/SectionNav";

const sections = [
  { id: 1, sectionNumber: "1", titleEn: "Short title", titleBn: "সংক্ষিপ্ত শিরোনাম" },
  { id: 2, sectionNumber: "2", titleEn: "Definitions", titleBn: "সংজ্ঞা" },
  { id: 3, sectionNumber: "302", titleEn: "", titleBn: "খুনের শাস্তি" },
];

describe("SectionNav", () => {
  it("renders an anchor link per section pointing at its section id", () => {
    render(<SectionNav sections={sections} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveAttribute("href", "#section-1");
    expect(links[1]).toHaveAttribute("href", "#section-2");
    expect(links[2]).toHaveAttribute("href", "#section-3");
  });

  it("shows the English title, falling back to Bengali when absent", () => {
    render(<SectionNav sections={sections} />);
    expect(screen.getByText("Short title")).toBeInTheDocument();
    expect(screen.getByText("Definitions")).toBeInTheDocument();
    expect(screen.getByText("খুনের শাস্তি")).toBeInTheDocument();
  });

  it("marks the first section active by default", () => {
    render(<SectionNav sections={sections} />);
    const links = screen.getAllByRole("link");
    expect(links[0].className).toContain("text-primary");
    expect(links[1].className).not.toContain("bg-blue-50");
  });

  it("renders nothing when there are no sections", () => {
    const { container } = render(<SectionNav sections={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the translated sections heading", () => {
    render(<SectionNav sections={sections} />);
    // key-echo translator from the global next-intl mock
    expect(screen.getByText("sections")).toBeInTheDocument();
  });
});
