"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";

type FormState = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setState("submitting");
    setMessage("");

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message || "Unable to submit the message.");
      }

      form.reset();
      setState("success");
      setMessage("Your message was submitted. SEMA will review and respond through the official contact channel.");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Unable to submit the message.");
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
          Email
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label>
          Phone
          <input name="phone" autoComplete="tel" />
        </label>
        <label>
          Enquiry type
          <select name="enquiryType" required defaultValue="">
            <option value="" disabled>
              Select type
            </option>
            <option>General enquiry</option>
            <option>Media request</option>
            <option>Partner coordination</option>
            <option>Publication or policy request</option>
            <option>Website feedback</option>
          </select>
        </label>
        <label>
          Subject
          <input name="subject" required />
        </label>
      </div>
      <label>
        Message
        <textarea name="message" rows={6} required />
      </label>
      <label className="check-row">
        <input name="consent" type="checkbox" required />
        I consent to SEMA processing this message for official response and record keeping.
      </label>
      <button className="button" type="submit" disabled={state === "submitting"}>
        <Send aria-hidden="true" size={18} />
        {state === "submitting" ? "Submitting" : "Submit message"}
      </button>
      {message ? <p className={`form-message ${state}`}>{message}</p> : null}
    </form>
  );
}
