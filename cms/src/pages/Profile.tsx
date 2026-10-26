import { useQuery } from "@tanstack/react-query";
import { ErrorBlock, PageHeader, Spinner } from "../components/ui/Bits";
import { FormCard } from "../components/ui/FormCard";
import { TextField } from "../components/ui/Form";
import { Icon } from "../components/ui/Icon";
import { ChipsInput, MoveButtons, StringList, move } from "../components/ui/Lists";
import { MediaField } from "../components/ui/MediaPicker";
import { useSettingForm } from "../hooks/useSettingForm";
import { useUnsaved } from "../hooks/useUnsaved";
import { api } from "../lib/api";
import type { Settings } from "../lib/types";

export const useSettings = () => useQuery({ queryKey: ["settings"], queryFn: () => api.get<{ settings: Settings; updatedAt: Record<string, string> }>("/settings") });

const SECTIONS = [
  ["profile", "Profile"],
  ["hero", "Hero"],
  ["story", "Story"],
  ["marquee", "Marquee"],
  ["sections", "Section titles"],
  ["contact", "Contact"],
  ["social", "Social links"],
] as const;

export function Profile() {
  const q = useSettings();
  return (
    <>
      <PageHeader eyebrow="content" title="Profile & texts" description="Everything on the page that is not a project, skill or certificate. Each block saves on its own; Publish puts the saved changes live." />
      {q.isPending && <Spinner />}
      {q.isError && <ErrorBlock error={q.error} retry={() => q.refetch()} />}
      {q.data && (
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[180px_minmax(0,1fr)]">
          <nav aria-label="Blocks on this page" className="hidden xl:block">
            <ul className="sticky top-24 flex flex-col gap-0.5">
              {SECTIONS.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} className="block rounded-lg px-3 py-2 text-[13.5px] text-mute transition-colors hover:bg-raised hover:text-fg">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <Forms s={q.data.settings} />
        </div>
      )}
    </>
  );
}

function Forms({ s }: { s: Settings }) {
  const profile = useSettingForm("profile", s.profile, "Profile");
  const hero = useSettingForm("hero", s.hero, "Hero");
  const story = useSettingForm("story", s.story, "Story");
  const marquee = useSettingForm("marquee", s.marquee, "Marquee");
  const sections = useSettingForm("sections", s.sections, "Section titles");
  const contact = useSettingForm("contact", s.contact, "Contact");
  const social = useSettingForm("social", s.social, "Social links");
  useUnsaved([profile, hero, story, marquee, sections, contact, social].some((f) => f.dirty));

  const p = profile.draft!;
  const h = hero.draft!;
  const st = story.draft!;
  const sec = sections.draft!;
  const c = contact.draft!;

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <FormCard id="profile" title="Profile" description="Your name, role and how to reach you. Used in the hero, the contact block, the footer and the search result." dirty={profile.dirty} saving={profile.saving} onSave={profile.save} onReset={profile.reset}>
        <div className="grid gap-5 md:grid-cols-2">
          <TextField label="Full name" value={p.name} onChange={(v) => profile.set({ name: v })} error={profile.errors.name} max={120} />
          <TextField label="Short name" value={p.shortName} onChange={(v) => profile.set({ shortName: v })} error={profile.errors.shortName} max={40} help="The giant name in the hero." />
          <TextField label="Role" value={p.role} onChange={(v) => profile.set({ role: v })} error={profile.errors.role} max={60} />
          <TextField label="Location" value={p.location} onChange={(v) => profile.set({ location: v })} error={profile.errors.location} max={80} />
          <TextField label="Availability" value={p.availability} onChange={(v) => profile.set({ availability: v })} error={profile.errors.availability} max={80} help="Small line at the top of the hero." />
          <TextField label="Email" type="email" value={p.email} onChange={(v) => profile.set({ email: v })} error={profile.errors.email} />
          <TextField label="Phone (as shown)" value={p.phoneDisplay} onChange={(v) => profile.set({ phoneDisplay: v })} error={profile.errors.phoneDisplay} help="Leave empty to hide the phone number." />
          <TextField label="Phone link" mono value={p.phoneHref} onChange={(v) => profile.set({ phoneHref: v })} error={profile.errors.phoneHref} placeholder="tel:+62…" />
          <TextField label="Local time" value={p.timezone} onChange={(v) => profile.set({ timezone: v })} error={profile.errors.timezone} />
        </div>
        <MediaField label="CV (PDF)" kind="file" value={p.cvMediaId} onChange={(id) => profile.set({ cvMediaId: id })} error={profile.errors.cvMediaId} help="Downloaded from “Download CV”. Upload a new PDF here, or replace the file in Media to keep the same link." />
      </FormCard>

      <FormCard id="hero" title="Hero" description="The first screen: portrait and the two small lines around the name." dirty={hero.dirty} saving={hero.saving} onSave={hero.save} onReset={hero.reset}>
        <MediaField label="Portrait" value={h.imageId} onChange={(id) => hero.set({ imageId: id })} error={hero.errors.imageId} help="A cut-out PNG with a transparent background works best: the name passes behind it." />
        <TextField label="Portrait alt text" value={h.imageAlt} onChange={(v) => hero.set({ imageAlt: v })} error={hero.errors.imageAlt} max={200} />
        <div className="grid gap-5 md:grid-cols-2">
          <TextField label="Tagline, first line" value={h.taglineTop} onChange={(v) => hero.set({ taglineTop: v })} error={hero.errors.taglineTop} max={60} />
          <TextField label="Tagline, second line" value={h.taglineBottom} onChange={(v) => hero.set({ taglineBottom: v })} error={hero.errors.taglineBottom} max={60} help="Shown brighter than the first line." />
        </div>
      </FormCard>

      <FormCard id="story" title="Story" description="“The short version”: the roles struck out one by one, the one that lights up, and the paragraphs beside them." dirty={story.dirty} saving={story.saving} onSave={story.save} onReset={story.reset}>
        <div className="grid gap-5 md:grid-cols-2">
          <ChipsInput label="Struck-out words" value={st.struck} onChange={(v) => story.set({ struck: v })} max={3} error={story.errors.struck} help="In order. Press Enter after each." />
          <TextField label="Word that lights up" value={st.now} onChange={(v) => story.set({ now: v })} error={story.errors.now} max={20} />
        </div>
        <TextField label="Lede" multiline rows={2} value={st.lede} onChange={(v) => story.set({ lede: v })} error={story.errors.lede} max={240} help="The bold sentence." />
        <StringList label="Paragraphs" itemLabel="paragraph" multiline value={st.paragraphs} onChange={(v) => story.set({ paragraphs: v })} addLabel="Add paragraph" max={4} error={story.errors.paragraphs} />
      </FormCard>

      <FormCard id="marquee" title="Marquee" description="The words that scroll under the hero." dirty={marquee.dirty} saving={marquee.saving} onSave={marquee.save} onReset={marquee.reset}>
        <ChipsInput label="Words" value={marquee.draft!} onChange={(v) => marquee.replace(v)} max={16} error={Object.values(marquee.errors)[0]} />
      </FormCard>

      <FormCard id="sections" title="Section titles" description="Big titles and the small notes beside them." dirty={sections.dirty} saving={sections.saving} onSave={sections.save} onReset={sections.reset}>
        {(
          [
            ["workTitle", "workNote", "Case studies"],
            ["moreTitle", "moreNote", "More work"],
            ["skillsTitle", "skillsNote", "Skills"],
            ["certificationsTitle", "certificationsNote", "Certifications"],
          ] as const
        ).map(([t, n, name]) => (
          <div key={t} className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
            <TextField label={`${name} — title`} value={sec[t]} onChange={(v) => sections.set({ [t]: v })} error={sections.errors[t]} max={40} />
            <TextField label="Note" value={sec[n]} onChange={(v) => sections.set({ [n]: v })} error={sections.errors[n]} max={160} />
          </div>
        ))}
      </FormCard>

      <FormCard id="contact" title="Contact" description="The closing block. The lede ends with the bold part, e.g. “… — let’s talk.”" dirty={contact.dirty} saving={contact.saving} onSave={contact.save} onReset={contact.reset}>
        <div className="grid gap-5 md:grid-cols-2">
          <TextField label="Small label" value={c.eyebrow} onChange={(v) => contact.set({ eyebrow: v })} error={contact.errors.eyebrow} max={40} />
          <TextField label="Title" value={c.title} onChange={(v) => contact.set({ title: v })} error={contact.errors.title} max={60} />
        </div>
        <TextField label="Lede" multiline rows={2} value={c.lede} onChange={(v) => contact.set({ lede: v })} error={contact.errors.lede} max={240} />
        <div className="grid gap-5 md:grid-cols-2">
          <TextField label="Bold ending" value={c.ledeStrong} onChange={(v) => contact.set({ ledeStrong: v })} error={contact.errors.ledeStrong} max={60} />
          <TextField label="Message field label" value={c.messageLabel} onChange={(v) => contact.set({ messageLabel: v })} error={contact.errors.messageLabel} max={80} />
        </div>
      </FormCard>

      <FormCard id="social" title="Social links" description="Shown in the hero, the contact block and the footer. GitHub, LinkedIn and Instagram get their icons." dirty={social.dirty} saving={social.saving} onSave={social.save} onReset={social.reset}>
        {social.draft!.map((link, i) => (
          <div key={i} className="flex items-end gap-3">
            <TextField className="w-40 shrink-0" label="Label" value={link.label} onChange={(v) => social.replace(social.draft!.map((l, j) => (j === i ? { ...l, label: v } : l)))} error={social.errors[`${i}.label`]} />
            <TextField className="flex-1" label="Link" mono value={link.href} onChange={(v) => social.replace(social.draft!.map((l, j) => (j === i ? { ...l, href: v } : l)))} error={social.errors[`${i}.href`]} />
            <span className="flex gap-1 pb-1.5">
              <MoveButtons index={i} length={social.draft!.length} onMove={(to) => social.replace(move(social.draft!, i, to))} label={link.label || "link"} />
              <button type="button" className="icon-btn h-8 w-8 hover:!border-bad hover:!text-bad" aria-label={`Remove ${link.label}`} onClick={() => social.replace(social.draft!.filter((_, j) => j !== i))}>
                <Icon name="trash" size={13} />
              </button>
            </span>
          </div>
        ))}
        <button type="button" className="btn-ghost self-start" onClick={() => social.replace([...social.draft!, { label: "", href: "https://" }])} disabled={social.draft!.length >= 8}>
          <Icon name="plus" size={14} />
          Add link
        </button>
      </FormCard>
    </div>
  );
}
