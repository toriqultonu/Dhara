import { describe, it, expect } from "vitest";
import { cn, truncateText, getBengaliNumeral } from "@/lib/utils";

describe("cn", () => {
  it("joins multiple class strings with spaces", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("filters out falsy values", () => {
    expect(cn("base", undefined, null, false, "active")).toBe("base active");
  });

  it("supports conditional classes", () => {
    const isActive = false;
    expect(cn("btn", isActive && "btn-active")).toBe("btn");
  });

  it("returns an empty string when everything is falsy", () => {
    expect(cn(undefined, null, false)).toBe("");
  });
});

describe("truncateText", () => {
  it("returns the text unchanged when within the limit", () => {
    expect(truncateText("short", 10)).toBe("short");
  });

  it("truncates and appends an ellipsis when over the limit", () => {
    expect(truncateText("abcdefghij", 5)).toBe("abcde...");
  });
});

describe("getBengaliNumeral", () => {
  it("converts western digits to Bengali numerals", () => {
    expect(getBengaliNumeral(302)).toBe("৩০২");
    expect(getBengaliNumeral(1860)).toBe("১৮৬০");
  });
});
