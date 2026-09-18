import type { ReactNode } from "react";

export function AdminPage({ children }: { children: ReactNode }) {
  return <main className="admin-page"><div className="admin-container">{children}</div></main>;
}

export function AdminPageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <header className="admin-page-header"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>{action}</header>;
}

export function AdminList({ children, empty }: { children: ReactNode; empty?: ReactNode }) {
  return <section className="admin-list">{children || empty}</section>;
}

export function AdminStatus({ active, labels = { active: "Active", inactive: "Hidden" } }: { active: boolean; labels?: { active: string; inactive: string } }) {
  return <span className={active ? "status status-live" : "status"}>{active ? labels.active : labels.inactive}</span>;
}
