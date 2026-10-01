import { useRef, useState } from "react";
import { ArrowUpRight } from "./Icons";
import { person, social } from "../../data/site";

// Web3Forms access keys are public by design. Restrict this one to the
// production domain in the Web3Forms dashboard.
const WEB3FORMS_KEY = "585659b1-8cdb-48dc-94e7-7ce98b392c96";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Enter your name.";
  if (!values.email.trim()) errors.email = "Enter your email address.";
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = "Enter an email address like name@example.com.";
  if (!values.message.trim()) errors.message = "Write a message.";
  return errors;
}

// Underlined fields, gravity-style: no boxes, just a line that turns yellow on focus.
const fieldClass = (hasError) =>
  `mt-1 block w-full border-0 border-b-2 bg-transparent px-0 py-3 text-lg text-text transition-colors focus:border-accent focus:outline-none focus:ring-0 focus-visible:outline-none ${
    hasError ? "border-red-300" : "border-line hover:border-muted"
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
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: "New message from billjeferson.vercel.app",
          ...values,
          botcheck: data.get("botcheck") ? true : "",
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("failed");
    }
  };

  const describedBy = (name) => (errors[name] ? `${name}-error` : undefined);

  return (
    <section id="contact" aria-labelledby="contact-title" className="px-2 pb-2 sm:px-4 sm:pb-4">
      <div className="rounded-[2rem] bg-raised py-24 md:py-32">
        <div className="container-page grid grid-cols-1 gap-x-12 gap-y-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 id="contact-title" className="text-mega font-bold">
              contact<span className="text-accent">.</span>
            </h2>
            <p className="mt-8 max-w-[28ch] text-statement font-light">
              Need an API, a database or the app around them? Send me a message.
            </p>
            <a
              href={`mailto:${person.email}`}
              className="group mt-10 inline-flex items-center gap-3 text-[clamp(1.25rem,1rem_+_1.2vw,2rem)] font-medium underline decoration-accent decoration-2 underline-offset-8 transition-colors hover:text-accent"
            >
              {person.email}
              <ArrowUpRight size={24} className="nudge" />
            </a>

            <dl className="mt-12 grid gap-6 sm:grid-cols-2">
              {person.phone && (
                <div>
                  <dt className="meta">phone</dt>
                  <dd className="mt-1">
                    <a href={person.phone.href} className="num link">
                      {person.phone.display}
                    </a>
                  </dd>
                </div>
              )}
              <div>
                <dt className="meta">based in</dt>
                <dd className="mt-1">{person.location}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="meta">elsewhere</dt>
                <dd className="mt-1 flex flex-wrap gap-x-5 gap-y-1">
                  {social.map((s) => (
                    <a key={s.label} href={s.href} className="link" target="_blank" rel="noopener noreferrer">
                      {s.label}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ))}
                </dd>
              </div>
            </dl>
          </div>

          <form
            ref={formRef}
            onSubmit={onSubmit}
            noValidate
            aria-labelledby="contact-title"
            toolname="send_message"
            tooldescription="Send a message to Bill Jeferson Nababan. Requires the sender's name, email address and message."
            className="lg:col-span-5 lg:col-start-8 lg:pt-6"
            data-reveal
          >
            <div className="space-y-8">
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
                  message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
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

            {/* Honeypot for bots (Web3Forms convention). Hidden from people and assistive tech. */}
            <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} aria-hidden="true" />

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
              <button type="submit" className="btn-accent group min-w-[11rem]" disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : "Send message"}
                {status !== "sending" && <ArrowUpRight size={18} className="nudge" />}
              </button>

              <div role="status" aria-live="polite" className="font-medium text-accent">
                {status === "sent" && "Message sent. Thank you."}
              </div>
            </div>
            <div role="alert" className="mt-4 text-red-300">
              {status === "failed" && (
                <>
                  The message could not be sent. Try again, or email{" "}
                  <a href={`mailto:${person.email}`} className="link">
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
