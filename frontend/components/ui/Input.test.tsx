import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Input from "@/components/ui/Input";

describe("Input", () => {
  it("renders with value and calls onChange when typed into", () => {
    const onChange = vi.fn();
    render(<Input value="penal" onChange={onChange} />);
    const input = screen.getByDisplayValue("penal");
    fireEvent.change(input, { target: { value: "penal code" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("renders a label when provided", () => {
    render(<Input label="Email" onChange={() => {}} value="" />);
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("shows the error message when error is set", () => {
    render(<Input error="Email is required" onChange={() => {}} value="" />);
    expect(screen.getByText("Email is required")).toBeInTheDocument();
  });

  it("does not render an error paragraph when error is absent", () => {
    render(<Input onChange={() => {}} value="" />);
    expect(screen.queryByText("Email is required")).not.toBeInTheDocument();
  });

  it("defaults to dir=auto for Bengali/English input", () => {
    render(<Input placeholder="search" onChange={() => {}} value="" />);
    expect(screen.getByPlaceholderText("search")).toHaveAttribute("dir", "auto");
  });

  it("allows overriding dir via props passthrough", () => {
    render(<Input placeholder="search" dir="rtl" onChange={() => {}} value="" />);
    expect(screen.getByPlaceholderText("search")).toHaveAttribute("dir", "rtl");
  });
});
