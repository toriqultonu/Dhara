import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MessageBubble from "@/components/chat/MessageBubble";
import type { ChatMessage } from "@/lib/types";

const userMessage: ChatMessage = {
  id: "msg-user-1",
  role: "user",
  content: "What is the punishment for murder?",
  timestamp: new Date("2026-07-26T10:00:00Z"),
};

const aiMessage: ChatMessage = {
  id: "msg-ai-42ab",
  role: "assistant",
  content: "Under Section 302 of the Penal Code, murder is punishable by death.",
  citations: [
    {
      sourceType: "statute",
      sourceId: 11,
      title: "The Penal Code, 1860",
      sectionNumber: "302",
      snippet: "Punishment for murder",
    },
  ],
  timestamp: new Date("2026-07-26T10:00:05Z"),
};

describe("MessageBubble", () => {
  it("renders a plain bubble for user messages", () => {
    render(<MessageBubble message={userMessage} />);
    expect(screen.getByText("What is the punishment for murder?")).toBeInTheDocument();
    expect(screen.queryByText("Legal Analysis Memo")).not.toBeInTheDocument();
  });

  it("renders a legal memo card for assistant messages", () => {
    render(<MessageBubble message={aiMessage} />);
    expect(screen.getByText("Legal Analysis Memo")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Under Section 302 of the Penal Code, murder is punishable by death."
      )
    ).toBeInTheDocument();
  });

  it("derives the memo reference from the last 4 characters of the message id", () => {
    render(<MessageBubble message={aiMessage} />);
    expect(screen.getByText("REF-42AB")).toBeInTheDocument();
  });

  it("renders the citations section with linked sources", () => {
    render(<MessageBubble message={aiMessage} />);
    expect(screen.getByText("Sources & Citations")).toBeInTheDocument();
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/statutes/11");
    expect(link).toHaveTextContent("The Penal Code, 1860");
  });

  it("omits the citations section when there are no citations", () => {
    render(<MessageBubble message={{ ...aiMessage, citations: [] }} />);
    expect(screen.queryByText("Sources & Citations")).not.toBeInTheDocument();
  });
});
