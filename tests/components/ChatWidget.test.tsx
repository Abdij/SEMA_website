import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ChatWidget } from "@/components/ChatWidget";
const answer = { reply: "Use the request form.", actions: [{ label: "Request data", href: "/en/data-request" }] };
function open() { fireEvent.click(screen.getByRole("button", { name: "Open SEMA FAQ" })); }
function send() { fireEvent.change(screen.getByLabelText("Your message"), { target: { value: "request data" } }); fireEvent.click(screen.getByRole("button", { name: "Send message" })); }
beforeEach(() => sessionStorage.clear());
afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });
describe("FAQ widget", () => {
  it("focuses the input, explains privacy and closes with Escape", () => {
    render(<ChatWidget />); open();
    expect(screen.getByLabelText("Your message")).toHaveFocus();
    expect(screen.getByText(/No AI/)).toBeInTheDocument();
    fireEvent.keyDown(screen.getByLabelText("Your message"), { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open SEMA FAQ" })).toHaveFocus();
  });
  it("restores tab history and deletes it on request", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(Response.json(answer));
    const view = render(<ChatWidget />); open(); send();
    expect(await screen.findByRole("link", { name: "Request data" })).toHaveAttribute("href", "/en/data-request");
    view.unmount(); render(<ChatWidget />); open();
    expect(screen.getByText("Use the request form.", { exact: false })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Delete conversation" }));
    expect(screen.queryByText("Use the request form.", { exact: false })).not.toBeInTheDocument();
    await waitFor(() => expect(sessionStorage.getItem("sema_faq_history_v1")).toBeNull());
  });
  it("keeps failed input for retry without duplicate conversation turns", async () => {
    const fetch = vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network unavailable")).mockResolvedValueOnce(Response.json(answer));
    render(<ChatWidget />); open(); send();
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByLabelText("Your message")).toHaveValue("request data");
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    await screen.findByRole("link", { name: "Request data" });
    expect(screen.getAllByText("request data", { exact: false }).filter(element => element.classList.contains("chat-widget-bubble"))).toHaveLength(1);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it("stops a stalled request and preserves the question", async () => {
    vi.useFakeTimers();
    vi.spyOn(global, "fetch").mockImplementation((_url, options) => new Promise((_resolve, reject) => options?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")))));
    render(<ChatWidget />); open(); send();
    await act(async () => { await vi.advanceTimersByTimeAsync(15000); });
    expect(screen.getByRole("alert")).toHaveTextContent("timed out");
    expect(screen.getByLabelText("Your message")).toHaveValue("request data");
    expect(screen.getByRole("button", { name: "Send message" })).toBeEnabled();
  });
  it("ignores unsafe links in tampered browser history", () => {
    sessionStorage.setItem("sema_faq_history_v1", JSON.stringify([{ role: "assistant", content: "bad", actions: [{ label: "bad", href: "javascript:alert(1)" }] }]));
    render(<ChatWidget />); open(); expect(screen.queryByText("bad")).not.toBeInTheDocument();
  });
});
