import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";

// The real lib/navigation.ts wraps next-intl's createNavigation, which pulls
// in next/navigation — that needs a full Next.js App Router runtime that
// isn't present under plain Vitest/jsdom. The modal only renders a Link to
// /privacy, so a plain anchor stand-in is sufficient for this unit test.
vi.mock("@/lib/navigation", () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const { DashboardAccessModal } = await import("@/components/DashboardAccessModal");

function renderModal(props: Partial<React.ComponentProps<typeof DashboardAccessModal>> = {}) {
  const onCancel = vi.fn();
  const onSuccess = vi.fn();

  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <DashboardAccessModal
        dashboardId="123e4567-e89b-42d3-a456-426614174000"
        sourcePage="/dashboards"
        locale="en"
        onCancel={onCancel}
        onSuccess={onSuccess}
        {...props}
      />
    </NextIntlClientProvider>,
  );

  return { onCancel, onSuccess };
}

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  vi.restoreAllMocks();
});

describe("DashboardAccessModal", () => {
  it("renders the required title and explanation", () => {
    renderModal();
    expect(screen.getByRole("dialog", { name: /Access SEMA Mine Action Dashboard/i })).toBeInTheDocument();
    expect(screen.getByText(/SEMA collects limited information/i)).toBeInTheDocument();
  });

  it("shows validation errors when submitting an empty form", async () => {
    renderModal();
    fireEvent.click(screen.getByRole("button", { name: /Continue to Dashboard/i }));

    expect(await screen.findByText("Enter your organization name.")).toBeInTheDocument();
    expect(screen.getByText("Select at least one area of activity.")).toBeInTheDocument();
    expect(screen.getByText("You must consent before accessing the dashboard.")).toBeInTheDocument();
  });

  it("does not call the API when required fields are missing", async () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    renderModal();
    fireEvent.click(screen.getByRole("button", { name: /Continue to Dashboard/i }));
    await waitFor(() => expect(screen.getByText("Enter your organization name.")).toBeInTheDocument());
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("reveals the 'other' free-text field only when Other is selected", () => {
    renderModal();
    expect(screen.queryByPlaceholderText("Describe the activity")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: "Other" }));
    expect(screen.getByPlaceholderText("Describe the activity")).toBeInTheDocument();
  });

  it("calls onCancel when the Cancel button is clicked", () => {
    const { onCancel } = renderModal();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when Escape is pressed", () => {
    const { onCancel } = renderModal();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("submits a valid form and calls onSuccess with the trusted dashboard URL", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        accessId: "access-1",
        dashboardUrl: "https://app.powerbi.com/view?r=trusted",
        dashboardTitle: "Mine Action Overview",
      }),
    } as Response);

    const { onSuccess } = renderModal();

    fireEvent.change(screen.getByLabelText(/Organization name/i), {
      target: { value: "Example Humanitarian Org" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: "Mine action" }));
    fireEvent.click(screen.getByRole("checkbox", { name: /I understand and consent/i }));
    fireEvent.click(screen.getByRole("button", { name: /Continue to Dashboard/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/dashboard-access",
      expect.objectContaining({ method: "POST" }),
    );
    const call = onSuccess.mock.calls[0][0];
    expect(call.dashboardUrl).toBe("https://app.powerbi.com/view?r=trusted");
  });

  it("keeps the modal open and preserves entered data when the server errors", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Temporary server error." }),
    } as Response);

    const { onSuccess } = renderModal();

    fireEvent.change(screen.getByLabelText(/Organization name/i), {
      target: { value: "Example Humanitarian Org" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: "Mine action" }));
    fireEvent.click(screen.getByRole("checkbox", { name: /I understand and consent/i }));
    fireEvent.click(screen.getByRole("button", { name: /Continue to Dashboard/i }));

    expect(await screen.findByText("Temporary server error.")).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
    // Data the visitor already entered must still be in the form.
    expect(screen.getByLabelText(/Organization name/i)).toHaveValue("Example Humanitarian Org");
  });
});
