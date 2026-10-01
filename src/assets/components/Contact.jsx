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

// Fields sit on the fixed dark form card, so colours don't follow the theme.
const fieldClass = (hasError) =>
  `mt-2 block w-full rounded-xl border bg-night-2 px-4 py-3 text-base text-snow transition-colors focus:border-accent ${
    hasError ? "border-red-300" : "border-night-line hover:border-night-muted"
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
    <section id="contact" aria-labelledby="contact-title" className="px-2 pt-2 sm:px-4 sm:pt-4">
      <div className="rounded-[2rem] bg-accent py-20 text-on-accent md:py-28">
        <div className="container-page grid grid-cols-1 gap-x-10 gap-y-14 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
            <h2 id="contact-title" className="section-title">
              Contact
            </h2>
            <p className="mt-6 text-[clamp(1.375rem,1.15rem_+_0.9vw,1.875rem)] font-semibold leading-tight tracking-tight">
              Need an API, a database or the app around them? Send me a message.
            </p>

            <dl className="mt-10 space-y-5">
              <div>
                <dt className="text-sm font-medium">Email</dt>
                <dd className="mt-1">
                  <a href={`mailto:${person.email}`} className="text-lg font-semibold underline decoration-2 underline-offset-[5px] hover:decoration-[3px]">
                    {person.email}
                  </a>
                </dd>
              </div>
              {person.phone && (
                <div>
                  <dt className="text-sm font-medium">Phone</dt>
                  <dd className="mt-1">
                    <a href={person.phone.href} className="num text-lg font-semibold underline decoration-2 underline-offset-[5px] hover:decoration-[3px]">
                      {person.phone.display}
                    </a>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium">Location</dt>
                <dd className="mt-1 text-lg font-semibold">{person.location}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium">Elsewhere</dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {social.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      className="inline-flex min-h-[40px] items-center rounded-full border-2 border-on-accent px-4 font-semibold transition-colors hover:bg-on-accent hover:text-accent"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
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
            className="rounded-[1.5rem] bg-night p-6 text-snow shadow-[12px_12px_0_0_rgb(34_40_44/0.25)] sm:p-8 lg:col-span-7"
            data-reveal
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="font-medium">
                  Name
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
                <label htmlFor="email" className="font-medium">
                  Email
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
            </div>

            <div className="mt-6">
              <label htmlFor="message" className="font-medium">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
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

            {/* Honeypot for bots (Web3Forms convention). Hidden from people and assistive tech. */}
            <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} aria-hidden="true" />

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <button type="submit" className="btn-primary group min-w-[11rem]" disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : "Send message"}
                {status !== "sending" && <ArrowUpRight size={18} className="nudge" />}
              </button>

              <div role="status" aria-live="polite" className="font-medium text-ok">
                {status === "sent" && "Message sent. Thank you."}
              </div>
            </div>
            <div role="alert" className="mt-4 text-red-300">
              {status === "failed" && (
                <>
                  The message could not be sent. Try again, or email{" "}
                  <a href={`mailto:${person.email}`} className="link-night">
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
