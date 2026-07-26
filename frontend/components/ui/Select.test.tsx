import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Select from "@/components/ui/Select";

const options = [
  { value: "statute", label: "Statutes" },
  { value: "judgment", label: "Judgments" },
  { value: "sro", label: "SROs" },
];

describe("Select", () => {
  it("renders all options from the options prop", () => {
    render(<Select options={options} onChange={() => {}} value="statute" />);
    expect(screen.getByRole("option", { name: "Statutes" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Judgments" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "SROs" })).toBeInTheDocument();
  });

  it("renders children as options when no options prop is given", () => {
    render(
      <Select onChange={() => {}} value="a">
        <option value="a">Alpha</option>
        <option value="b">Beta</option>
      </Select>
    );
    expect(screen.getByRole("option", { name: "Alpha" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Beta" })).toBeInTheDocument();
  });

  it("calls onChange with the selected value", () => {
    const seen: string[] = [];
    const onChange = vi.fn((e: React.ChangeEvent<HTMLSelectElement>) => {
      // Capture at call time: React resets a controlled select after render.
      seen.push(e.target.value);
    });
    render(<Select options={options} onChange={onChange} value="statute" />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "judgment" } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(seen).toEqual(["judgment"]);
  });

  it("renders a label when provided", () => {
    render(<Select label="Court" options={options} onChange={() => {}} value="sro" />);
    expect(screen.getByText("Court")).toBeInTheDocument();
  });

  it("shows the error message when error is set", () => {
    render(
      <Select error="Required field" options={options} onChange={() => {}} value="sro" />
    );
    expect(screen.getByText("Required field")).toBeInTheDocument();
  });
});
