import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import SearchBar from "@/components/search/SearchBar";

// next-intl is mocked globally (key-echo): placeholder = "placeholder",
// submit button label = "startSearching".

describe("SearchBar", () => {
  it("calls onSearch with the typed query on submit", () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    fireEvent.change(screen.getByPlaceholderText("placeholder"), {
      target: { value: "দণ্ডবিধি ৩০২ ধারা" },
    });
    fireEvent.click(screen.getByRole("button", { name: "startSearching" }));
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith("দণ্ডবিধি ৩০২ ধারা");
  });

  it("does not submit when the query is empty", () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    fireEvent.click(screen.getByRole("button", { name: "startSearching" }));
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("does not submit when the query is only whitespace", () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    fireEvent.change(screen.getByPlaceholderText("placeholder"), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByRole("button", { name: "startSearching" }));
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("pre-fills the input from defaultValue and submits it", () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} defaultValue="penal code" />);
    expect(screen.getByDisplayValue("penal code")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "startSearching" }));
    expect(onSearch).toHaveBeenCalledWith("penal code");
  });
});
