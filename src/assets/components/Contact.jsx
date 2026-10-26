import { useRef, useState } from "react";
import { ArrowUpRight } from "./Icons";
import { trackEvent } from "../../track.js";
import site from "../../content/site.json";

const { person, social, contact } = site;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Enter your name.";
  if (!values.email.trim()) errors.email = "Enter your email address.";
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = "Enter an email address like name@example.com.";
  if (!values.message.trim()) errors.message = "Write a message.";
  return errors;
}

// Underlined fields: no boxes, just a line that turns white on focus.
const fieldClass = (hasError) =>
  `mt-1 block w-full border-0 border-b bg-transparent px-0 py-2.5 text-lg text-fg transition-colors focus:border-fg focus:outline-none focus:ring-0 focus-visible:outline-none ${
    hasError ? "border-red-300" : "border-line hover:border-mute"
  }`;

const errorClass = "mt-2 text-sm text-red-300";

export default function Contact() {
  const formRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent | failed

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = formRef.current;
    const data = new FormData(form);
    const values = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      message: String(data.get("message") ?? ""),
    };

    const found = validate(values);
    setErrors(found);
    const firstInvalid = ["name", "email", "message"].find((k) => found[k]);
    if (firstInvalid) {
      form.elements[firstInvalid].focus();
      return;
    }

    setStatus("sending");
    try {
      // /api/* is rewritten to the CMS server by vercel.json; the message lands in the CMS inbox.
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, website: String(data.get("website") ?? ""), page: location.pathname }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      form.reset();
      setStatus("sent");
      trackEvent("contact_submit", "");
    } catch {
      setStatus("failed");
    }
  };

  const describedBy = (name) => (errors[name] ? `${name}-error` : undefined);

  return (
    <section id="contact" aria-labelledby="contact-title" className="px-3 pb-3">
      <div className="rounded-[20px] border border-line bg-card px-0 pb-20 pt-24 md:pb-24 md:pt-32">
        <div className="container-page">
          <p className="meta mb-7">{contact.eyebrow}</p>
          <h2 id="contact-title" className="condensed max-w-[12ch] text-[clamp(3.75rem,10vw,10rem)] font-extrabold leading-[0.84] tracking-[-0.04em]" data-reveal>
            {contact.title.replace(/\?$/, "")}
            <span className="text-faint">?</span>
          </h2>
          <p className="mb-16 mt-7 max-w-[620px] text-lead font-medium text-mute" data-reveal>
            {contact.lede} <span className="text-fg">{contact.ledeStrong}</span>
          </p>
        </div>
        <div className="container-page grid grid-cols-1 gap-x-16 gap-y-16 lg:grid-cols-2">
          <div className="flex flex-col gap-10" data-reveal>
            <a
              href={`mailto:${person.email}`}
              className="mail group inline-flex items-center gap-3 self-start pb-1.5 text-[clamp(1.5rem,3.2vw,2.875rem)] font-semibold tracking-[-0.02em]"
              data-track="email_click"
              data-label="contact"
            >
              {person.email}
              <ArrowUpRight size={28} className="nudge" />
            </a>

            <dl className="grid grid-cols-2 gap-7">
              {person.phone.display && (
                <div>
                  <dt className="meta mb-2">phone</dt>
                  <dd>
                    <a href={person.phone.href} className="num ul whitespace-nowrap text-[17px]" data-track="phone_click" data-label="contact">
                      {person.phone.display}
                    </a>
                  </dd>
                </div>
              )}
              <div>
                <dt className="meta mb-2">based in</dt>
                <dd className="text-[17px]">{person.location}</dd>
              </div>
              <div>
                <dt className="meta mb-2">elsewhere</dt>
                <dd className="flex flex-wrap gap-x-4 gap-y-1 text-[17px]">
                  {social.map((s) => (
                    <a key={s.label} href={s.href} className="ul" target="_blank" rel="noopener noreferrer" data-track="social_click" data-label={s.label}>
                      {s.label}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="meta mb-2">local time</dt>
                <dd className="text-[17px]">{person.timezone}</dd>
              </div>
            </dl>
          </div>

          <form ref={formRef} onSubmit={onSubmit} noValidate aria-labelledby="contact-title" className="self-end" data-reveal>
            <div className="space-y-7">
              <div>
                <label htmlFor="name" className="meta">
                  your name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  maxLength={120}
                  aria-invalid={errors.name ? "true" : undefined}
                  aria-describedby={describedBy("name")}
                  className={fieldClass(errors.name)}
                />
                {errors.name && (
                  <p id="name-error" className={errorClass}>
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="email" className="meta">
                  your email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  maxLength={190}
                  aria-invalid={errors.email ? "true" : undefined}
                  aria-describedby={describedBy("email")}
                  className={fieldClass(errors.email)}
                />
                {errors.email && (
                  <p id="email-error" className={errorClass}>
                    {errors.email}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="message" className="meta">
                  {contact.messageLabel}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  maxLength={5000}
                  aria-invalid={errors.message ? "true" : undefined}
                  aria-describedby={describedBy("message")}
                  className={`${fieldClass(errors.message)} resize-y`}
                />
                {errors.message && (
                  <p id="message-error" className={errorClass}>
                    {errors.message}
                  </p>
                )}
              </div>
            </div>

            {/* Honeypot for bots. Hidden from people and assistive tech; the server drops messages that fill it. */}
            <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
              <button type="submit" className="btn-solid group min-w-[11rem]" disabled={status === "sending"}>
                <span>{status === "sending" ? "Sending…" : "Send message"}</span>
                {status !== "sending" && <ArrowUpRight size={16} className="nudge" />}
              </button>

              <div role="status" aria-live="polite" className="font-medium text-fg">
                {status === "sent" && "Message sent. Thank you."}
              </div>
            </div>
            <div role="alert" className="mt-4 text-red-300">
              {status === "failed" && (
                <>
                  The message could not be sent. Try again, or email{" "}
                  <a href={`mailto:${person.email}`} className="ul">
                    {person.email}
                  </a>
                  .
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
