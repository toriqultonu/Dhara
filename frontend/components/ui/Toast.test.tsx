import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { ToastProvider, useToast } from "@/components/ui/Toast";

function Trigger({ message, variant }: { message: string; variant?: "success" | "error" }) {
  const { toast } = useToast();
  return <button onClick={() => toast(message, variant)}>show toast</button>;
}

describe("Toast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the toast message when toast() is called inside the provider", () => {
    render(
      <ToastProvider>
        <Trigger message="Document saved" />
      </ToastProvider>
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("show toast"));
    expect(screen.getByRole("status")).toHaveTextContent("Document saved");
  });

  it("auto-dismisses the toast after 4 seconds", () => {
    render(
      <ToastProvider>
        <Trigger message="Temporary" />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText("show toast"));
    expect(screen.getByRole("status")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3999);
    });
    expect(screen.getByRole("status")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("dismisses immediately when the close button is clicked", () => {
    render(
      <ToastProvider>
        <Trigger message="Closable" />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText("show toast"));
    fireEvent.click(screen.getByRole("button", { name: "✕" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("stacks multiple toasts", () => {
    render(
      <ToastProvider>
        <Trigger message="First" />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText("show toast"));
    fireEvent.click(screen.getByText("show toast"));
    expect(screen.getAllByRole("status")).toHaveLength(2);
  });
});
