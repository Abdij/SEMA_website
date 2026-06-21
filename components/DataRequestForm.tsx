"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";

type FormState = "idle" | "submitting" | "success" | "error";

export function DataRequestForm() {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/data-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { message?: string; requestRef?: string };

      if (!response.ok) {
        throw new Error(data.message || "Unable to submit the request.");
      }

      event.currentTarget.reset();
      setState("success");
      setMessage(
        data.requestRef
          ? `Your request was submitted. Reference: ${data.requestRef}.`
          : "Your request was submitted for review.",
      );
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Unable to submit the request.");
    }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <div className="form-grid">
        <label>
          Full name
          <input name="name" required autoComplete="name" />
        </label>
        <label>
          Organization
          <input name="organization" autoComplete="organization" />
        </label>
        <label>
          Role or title
          <input name="role" />
        </label>
        <label>
          Requester type
          <select name="requesterType" required defaultValue="">
            <option value="" disabled>
              Select type
            </option>
            <option>Government institution</option>
            <option>Federal Member State</option>
            <option>Mine action operator</option>
            <option>Humanitarian partner</option>
            <option>Donor</option>
            <option>Researcher</option>
            <option>Media</option>
            <option>Public</option>
          </select>
        </label>
        <label>
          Email
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label>
          Phone
          <input name="phone" autoComplete="tel" />
        </label>
        <label>
          Geographic area
          <input name="geography" placeholder="District, region, FMS, or national" />
        </label>
        <label>
          Time period
          <input name="timePeriod" placeholder="Example: 2022-2026" />
        </label>
        <label>
          Preferred format
          <select name="preferredFormat" required defaultValue="">
            <option value="" disabled>
              Select format
            </option>
            <option>PDF report</option>
            <option>Excel</option>
            <option>CSV</option>
            <option>Map</option>
            <option>Dashboard access</option>
            <option>Formal data-sharing agreement</option>
          </select>
        </label>
        <label>
          Deadline
          <input name="deadline" type="date" />
        </label>
      </div>
      <label>
        Data requested
        <textarea
          name="dataRequested"
          rows={5}
          required
          placeholder="Describe the data, indicators, geography, period, and level of detail requested."
        />
      </label>
      <label>
        Intended use
        <textarea
          name="intendedUse"
          rows={5}
          required
          placeholder="Explain how the data will be used and who will access it."
        />
      </label>
      <label className="check-row">
        <input name="terms" type="checkbox" required />
        I understand that sensitive, personal, security-related, or restricted operational data may be declined, aggregated, or shared only through an approved agreement.
      </label>
      <button className="button" type="submit" disabled={state === "submitting"}>
        <Send aria-hidden="true" size={18} />
        {state === "submitting" ? "Submitting" : "Submit data request"}
      </button>
      {message ? <p className={`form-message ${state}`}>{message}</p> : null}
    </form>
  );
}
