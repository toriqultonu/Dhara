import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Button from "@/components/ui/Button";

describe("Button", () => {
  it("renders its children", () => {
    render(<Button>Save changes</Button>);
    expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument();
  });

  it("applies primary variant classes by default", () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-primary", "text-white");
  });

  it("applies accent variant classes", () => {
    render(<Button variant="accent">Go</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-accent", "text-primary");
    expect(button).not.toHaveClass("bg-primary");
  });

  it("applies outline variant classes", () => {
    render(<Button variant="outline">Go</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("border-primary", "text-primary");
    expect(button).not.toHaveClass("bg-primary");
  });

  it("adds w-full when full is set", () => {
    render(<Button full>Wide</Button>);
    expect(screen.getByRole("button")).toHaveClass("w-full");
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Blocked
      </Button>
    );
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
