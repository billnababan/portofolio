export const person = {
  name: "Bill Jeferson Nababan",
  shortName: "Bill Jeferson",
  location: "Batam, Indonesia",
  email: "billnbbn@gmail.com",
  // TODO(owner): this number is public on the page (spam-scraping risk). Remove it here to hide it.
  // Non-breaking space/hyphens keep the number on one line.
  phone: { display: "+62\u00a0895\u20113834\u201118428", href: "tel:+62895383418428" },
  cv: { href: "/images/CV_BillJeferson.pdf", size: "143 KB" },
};

export const social = [
  { label: "GitHub", href: "https://github.com/billnababan" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/bill-jeferson-nababan-4878a9244/" },
  { label: "Instagram", href: "https://www.instagram.com/bill_jeferson/" },
];

// Page order = nav order. Ids must match the <section id>s.
export const sections = [
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "about", label: "About" },
  { id: "certifications", label: "Certifications" },
  { id: "contact", label: "Contact" },
];
