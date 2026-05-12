"use client";

import { useState } from "react";
import Link from "next/link";

type NotifRole = "admin" | "recruiter" | "candidate";
type NotifType = "info" | "success" | "warning" | "system";

interface Notification {
  id: number;
  role: NotifRole;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  link?: string;
}

const ALL_NOTIFICATIONS: Notification[] = [
  { id: 1, role: "recruiter", type: "success", title: "HIGH-MATCH CANDIDATE DETECTED", body: "Candidate #ETH-2847 scored 94/100 for the Senior Pilot (B787) position. Review the XAI report now.", time: "2 MIN AGO", read: false, link: "/dashboard/candidates" },
  { id: 2, role: "candidate", type: "info", title: "CV PROCESSING COMPLETE", body: "Your CV has been parsed and embedded. Your AI match score for Flight Operations Officer is ready to view.", time: "14 MIN AGO", read: false, link: "/candidate/feedback" },
  { id: 3, role: "admin", type: "system", title: "SYSTEM BACKUP COMPLETED", body: "Nightly encrypted backup completed successfully. 0 errors. 14,823 records secured in-country.", time: "1 HR AGO", read: false, link: "/admin/logs" },
  { id: 4, role: "recruiter", type: "warning", title: "POSTING DEADLINE APPROACHING", body: "The Flight Dispatcher (ADD) posting closes in 48 hours. 12 unreviewed applications remain.", time: "2 HR AGO", read: true, link: "/dashboard/jobs" },
  { id: 5, role: "candidate", type: "success", title: "INTERVIEW INVITATION RECEIVED", body: "Congratulations. You have been shortlisted for an interview for the In-Flight Services role on 30 Apr 2026.", time: "3 HR AGO", read: true, link: "/candidate/applications" },
  { id: 6, role: "admin", type: "warning", title: "UNUSUAL LOGIN DETECTED", body: "Admin account accessed from an unrecognized IP address (196.188.x.x). Verify this was authorized.", time: "5 HR AGO", read: false, link: "/admin/logs" },
  { id: 7, role: "recruiter", type: "info", title: "EXAM BATCH SCORED", body: "35 candidates completed the Technical Exam for Maintenance Engineer roles. Results are now available.", time: "6 HR AGO", read: true, link: "/dashboard/candidates" },
  { id: 8, role: "candidate", type: "warning", title: "EXAM DEADLINE REMINDER", body: "Your assigned technical exam for the Maintenance Engineer role expires in 24 hours. Complete it now.", time: "8 HR AGO", read: true, link: "/candidate/exams" },
  { id: 9, role: "admin", type: "info", title: "NEW RECRUITER ACCOUNT CREATED", body: "A new recruiter account (recruit2@eaa.et) was created by admin@eaa.et and is pending email verification.", time: "1 DAY AGO", read: true, link: "/admin/users" },
  { id: 10, role: "recruiter", type: "success", title: "SHORTLIST APPROVED", body: "The shortlist for Senior Pilot (B787) has been reviewed and approved by the HR Director.", time: "2 DAYS AGO", read: true, link: "/dashboard/pipeline" },
];

const TYPE_META: Record<NotifType, { color: string; label: string; icon: React.ReactNode }> = {
  success: {
    color: "var(--c-accent)",
    label: "SUCCESS",
    icon: <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="var(--c-accent)" strokeWidth="1.5" strokeLinecap="square" /></svg>,
  },
  info: {
    color: "#60A5FA",
    label: "INFO",
    icon: <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4" stroke="#60A5FA" strokeWidth="1.2" /><path d="M5 4v3M5 2.5v.5" stroke="#60A5FA" strokeWidth="1.2" strokeLinecap="square" /></svg>,
  },
  warning: {
    color: "var(--c-warn)",
    label: "WARNING",
    icon: <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1L9 9H1L5 1Z" stroke="var(--c-warn)" strokeWidth="1.2" strokeLinecap="square" /><path d="M5 4v2M5 7.5v.5" stroke="var(--c-warn)" strokeWidth="1.2" strokeLinecap="square" /></svg>,
  },
  system: {
    color: "var(--c-text-sub)",
    label: "SYSTEM",
    icon: <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="1" y="1" width="8" height="8" stroke="var(--c-text-sub)" strokeWidth="1.2" /><path d="M3 5h4M5 3v4" stroke="var(--c-text-sub)" strokeWidth="1.2" strokeLinecap="square" /></svg>,
  },
};

const ROLES: { key: NotifRole | "all"; label: string }[] = [
  { key: "all", label: "ALL" },
  { key: "admin", label: "ADMIN" },
  { key: "recruiter", label: "RECRUITER" },
  { key: "candidate", label: "CANDIDATE" },
];

export default function NotificationsPage() {
  const [activeRole, setActiveRole] = useState<NotifRole | "all">("all");
  const [showUnread, setShowUnread] = useState(false);
  const [notifications, setNotifications] = useState(ALL_NOTIFICATIONS);

  const filtered = notifications.filter(
    (n) =>
      (activeRole === "all" || n.role === activeRole) &&
      (!showUnread || !n.read)
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markRead(id: number) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  function dismiss(id: number) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div className="relative min-h-screen bg-[var(--c-bg)]">
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="relative z-10 max-w-[860px] mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p className="font-ibm-mono text-[10px] text-[var(--c-accent)] tracking-[2px] mb-2">[SYSTEM] // NOTIFICATION CENTER</p>
            <h1 className="font-grotesk text-[29px] font-bold text-[var(--c-text)] tracking-[-0.5px]">NOTIFICATIONS</h1>
            <p className="font-ibm-mono text-[10px] text-[var(--c-text-dim)] tracking-[1px] mt-1">
              {unreadCount > 0 ? `${unreadCount} UNREAD NOTIFICATION${unreadCount > 1 ? "S" : ""}` : "ALL CAUGHT UP"}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowUnread((v) => !v)}
              className={`flex items-center gap-2 px-3 h-[34px] border transition-colors font-ibm-mono text-[9px] tracking-[1px] ${showUnread ? "border-[var(--c-accent)] text-[var(--c-accent)] bg-[var(--c-accent)]/08" : "border-[var(--c-border)] text-[var(--c-text-muted)] hover:border-[var(--c-accent)] hover:text-[var(--c-accent)]"}`}
            >
              <div className={`w-[5px] h-[5px] rounded-full ${showUnread ? "bg-[var(--c-accent)]" : "bg-[var(--c-text-dim)]"}`} />
              UNREAD ONLY
            </button>
            <button
              onClick={markAllRead}
              className="px-3 h-[34px] border border-[var(--c-border)] hover:border-[var(--c-accent)] transition-colors font-ibm-mono text-[9px] text-[var(--c-text-muted)] hover:text-[var(--c-accent)] tracking-[1px]"
            >
              MARK ALL READ
            </button>
          </div>
        </div>

        {/* Role filter tabs */}
        <div className="flex items-center gap-0 border border-[var(--c-border-soft)] w-fit mb-6">
          {ROLES.map((r) => {
            const count = ALL_NOTIFICATIONS.filter((n) => r.key === "all" || n.role === r.key).length;
            return (
              <button
                key={r.key}
                onClick={() => setActiveRole(r.key)}
                className={`flex items-center gap-2 px-4 py-[8px] font-ibm-mono text-[9px] tracking-[1.5px] transition-colors border-r border-[var(--c-border-soft)] last:border-r-0 ${activeRole === r.key ? "bg-[var(--c-accent)] text-[var(--c-text)] font-bold" : "text-[var(--c-text-muted)] hover:text-[var(--c-text)]"}`}
              >
                {r.label}
                <span className={`text-[8px] px-1.5 py-0.5 ${activeRole === r.key ? "bg-[var(--c-bg)]/15 text-[var(--c-text)]" : "bg-[var(--c-bg-muted)] text-[var(--c-text-dim)]"}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Notification list */}
        <div className="flex flex-col gap-[2px]">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 border border-[var(--c-border-soft)] bg-[var(--c-bg-elev)]">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M16 4a6 6 0 0 1 6 6v7l3 3H7l3-3V10a6 6 0 0 1 6-6z" stroke="var(--c-border)" strokeWidth="1.4" /><path d="M13 28a3 3 0 0 0 6 0" stroke="var(--c-border)" strokeWidth="1.4" /></svg>
              <span className="font-ibm-mono text-[10px] text-[var(--c-text-faint)] tracking-[1.5px]">NO NOTIFICATIONS</span>
            </div>
          ) : (
            filtered.map((n) => {
              const meta = TYPE_META[n.type];
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-4 px-5 py-5 border transition-colors group ${!n.read ? "border-[var(--c-border)] bg-[var(--c-bg-elev)]" : "border-[var(--c-border-soft)] bg-[var(--c-bg)]"} hover:border-[var(--c-accent)]/30`}
                >
                  {/* Unread dot */}
                  <div className="flex items-center justify-center w-[8px] mt-[6px] shrink-0">
                    {!n.read && <div className="w-[6px] h-[6px] rounded-full bg-[var(--c-accent)]" />}
                  </div>

                  {/* Type icon */}
                  <div className="flex items-center justify-center w-[28px] h-[28px] border shrink-0 mt-[2px]" style={{ borderColor: meta.color + "30", background: meta.color + "08" }}>
                    {meta.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-ibm-mono text-[8px] tracking-[1px]" style={{ color: meta.color }}>{meta.label}</span>
                      <span className="font-ibm-mono text-[8px] text-[var(--c-border)]">//</span>
                      <span className="font-ibm-mono text-[8px] text-[var(--c-text-faint)] tracking-[1px] uppercase">{n.role}</span>
                    </div>
                    <h3 className={`font-grotesk text-[14px] font-bold tracking-[-0.2px] mb-1 ${!n.read ? "text-[var(--c-text)]" : "text-[#666]"}`}>{n.title}</h3>
                    <p className="font-ibm-mono text-[10px] text-[var(--c-text-muted)] tracking-[0.3px] leading-[1.7]">{n.body}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="font-ibm-mono text-[8px] text-[var(--c-text-faint)] tracking-[1px]">{n.time}</span>
                      {n.link && (
                        <Link href={n.link} onClick={() => markRead(n.id)} className="font-ibm-mono text-[8px] text-[var(--c-accent)]/60 hover:text-[var(--c-accent)] tracking-[1px] transition-colors">
                          VIEW DETAILS /
                        </Link>
                      )}
                      {!n.read && (
                        <button onClick={() => markRead(n.id)} className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] hover:text-[var(--c-text)] tracking-[1px] transition-colors">
                          MARK READ
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dismiss */}
                  <button
                    onClick={() => dismiss(n.id)}
                    className="text-[var(--c-text-faint)] hover:text-[var(--c-warn)] transition-colors opacity-0 group-hover:opacity-100 mt-1 shrink-0"
                    aria-label="Dismiss notification"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
                    </svg>
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--c-border-soft)]">
          <p className="font-ibm-mono text-[9px] text-[var(--c-border)] tracking-[0.5px]">
            NOTIFICATION LOGS RETAINED FOR 90 DAYS // COMPLIANT WITH PROCLAMATION NO. 1329/2023
          </p>
        </div>
      </div>
    </div>
  );
}
