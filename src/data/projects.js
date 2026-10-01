// Facts here come from the previous version of the site. Where a field is
// unknown it is left out (the UI then renders nothing) and marked TODO(owner).
//
// liveUrl: set ONLY when a deployed app exists at a different URL from the repo.
export const projects = [
  {
    id: "kpp-reminders",
    title: "Reminder app for Kalimantan Prima Persada",
    summary:
      "Reminder application built for Kalimantan Prima Persada so users can manage daily tasks and sign documents.",
    // TODO(owner): your role, and one line on the problem it solved / outcome.
    stack: ["React", "Express", "MySQL", "Tailwind CSS", "Material UI"],
    image: "project-kpp-reminders",
    alt: "Reminder app dashboard: counts of total, unread, pending and completed reminders, an urgent-items alert and a list of recent reminders.",
    sourceUrl: "https://github.com/billnababan/RemindersAppsKppPrima",
  },
  {
    id: "taskflow",
    title: "TaskFlow — task management system",
    summary:
      "Task management platform for teams: real-time updates over WebSocket, role-based access control, task assignment with deadline tracking, and email notifications.",
    // TODO(owner): this is the client repo of the same system as "Web-based project collaboration" below
    // (…Client vs …Server). Consider merging the two cards into one project with both repos.
    stack: ["React", "Express", "MySQL", "Tailwind CSS", "Socket.io"],
    image: "project-taskflow",
    alt: "Task detail page showing status, assignee, start and due dates, and a real-time team discussion thread.",
    sourceUrl: "https://github.com/billnababan/WebBasedProjecAndAssigmentClient",
  },
  {
    id: "trufflehog",
    title: "Trufflehog repository scanner",
    summary:
      "Web app that runs Trufflehog against a codebase to detect sensitive information committed to it.",
    stack: ["React", "Express", "MySQL", "Tailwind CSS", "Material UI"],
    image: "project-trufflehog",
    alt: "Landing page of the scanner with a “Check your repository” call to action and an explanation of what Trufflehog does.",
    sourceUrl: "https://github.com/billnababan/Client-Scan",
  },
  {
    id: "collaboration",
    title: "Web-based project collaboration",
    summary: "Management system for tasks and collaborative projects.",
    role: "Back-end developer — all server-side logic and the database architecture.",
    stack: ["Express", "MySQL", "React", "Tailwind CSS"],
    image: "project-collaboration",
    alt: "Manager dashboard listing tasks with their status and due dates.",
    sourceUrl: "https://github.com/billnababan/WebBasedProjecAndAssigmentServer",
  },
  {
    id: "minutes-archive",
    title: "Minutes archiving site (Next.js)",
    summary: "Website for archiving meeting minutes, built for the faculty in a project-based learning group.",
    role: "Back-end developer in a project-based learning team.",
    stack: ["Next.js", "JavaScript", "MySQL", "Tailwind CSS"],
    image: "project-nextjs",
    alt: "User management page listing users with add and delete actions.",
    sourceUrl: "https://github.com/billnababan/next-js-simpel-project",
  },
  {
    id: "edepot",
    title: "Depot in/out management",
    summary:
      "Depot management system that tracks containers in and out, with real-time stock monitoring and reporting, built on a full JavaScript stack.",
    // TODO(owner): no public repo is linked (the old link pointed to the repositories tab).
    // Add sourceUrl if there is one. Also confirm the screenshot (real container and customer data)
    // is cleared for publishing.
    stack: ["React", "JavaScript", "MySQL", "Tailwind CSS"],
    image: "project-edepot",
    alt: "Container in/out screen: search results for a container number and a gate-in photo timeline for that container.",
  },
];
