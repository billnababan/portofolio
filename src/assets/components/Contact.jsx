import { useRef, useState } from "react";
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

const fieldClass = (hasError) =>
  `mt-2 block w-full rounded-md border bg-surface px-3 py-2.5 text-base text-ink placeholder:text-muted ${
    hasError ? "border-red-700 dark:border-red-400" : "border-line-strong"
  }`;

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
    <section id="contact" aria-labelledby="contact-title" className="section">
      <div className="container-page grid gap-x-8 gap-y-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 id="contact-title" className="section-title">
            Contact
          </h2>
          <p className="section-intro">Use the form, or email me directly.</p>

          <dl className="mt-8 space-y-5">
            <div>
              <dt className="eyebrow">Email</dt>
              <dd className="mt-1">
                <a href={`mailto:${person.email}`} className="link">
                  {person.email}
                </a>
              </dd>
            </div>
            {person.phone && (
              <div>
                <dt className="eyebrow">Phone</dt>
                <dd className="mt-1">
                  <a href={person.phone.href} className="link num">
                    {person.phone.display}
                  </a>
                </dd>
              </div>
            )}
            <div>
              <dt className="eyebrow">Location</dt>
              <dd className="mt-1">{person.location}</dd>
            </div>
            <div>
              <dt className="eyebrow">Elsewhere</dt>
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
          className="lg:col-span-7 lg:col-start-6"
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
                <p id="name-error" className="mt-2 text-sm text-red-700 dark:text-red-300">
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
                <p id="email-error" className="mt-2 text-sm text-red-700 dark:text-red-300">
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
              <p id="message-error" className="mt-2 text-sm text-red-700 dark:text-red-300">
                {errors.message}
              </p>
            )}
          </div>

          {/* Honeypot for bots (Web3Forms convention). Hidden from people and assistive tech. */}
          <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} aria-hidden="true" />

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <button type="submit" className="btn-primary min-w-[10rem]" disabled={status === "sending"}>
              {status === "sending" ? "Sending…" : "Send message"}
            </button>

            <div role="status" aria-live="polite" className="text-[0.9375rem]">
              {status === "sent" && "Thanks — your message was sent."}
            </div>
          </div>
          <div role="alert" className="mt-4 text-[0.9375rem] text-red-700 dark:text-red-300">
            {status === "failed" && (
              <>
                The message could not be sent. Please try again, or email{" "}
                <a href={`mailto:${person.email}`} className="link text-ink">
                  {person.email}
                </a>
                .
              </>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
