"use client";

import React, { useEffect, useRef, useState } from "react";
import { Copy, Mail, MoreVertical, Pencil, Trash2 } from "lucide-react";
import clsx from "clsx";
import type { User } from "@/lib/api";

type UserActionsMenuProps = {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onCopy: (message: string) => void;
};

export default function UserActionsMenu({
  user,
  onEdit,
  onDelete,
  onCopy,
}: UserActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const run = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <div ref={rootRef} className="relative inline-block text-left">
      <button
        type="button"
        aria-label={`Actions pour ${user.name} ${user.surname}`}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="btn-ghost !p-2"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div
          className={clsx(
            "absolute right-0 z-30 mt-1 w-52 origin-top-right",
            "rounded-xl border border-slate-200 bg-white py-1 shadow-lg",
          )}
          role="menu"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => run(() => onEdit(user))}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            <Pencil className="h-4 w-4 text-slate-400" />
            Modifier le compte
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() =>
              run(() => {
                void navigator.clipboard.writeText(user.email);
                onCopy("E-mail copié");
              })
            }
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            <Mail className="h-4 w-4 text-slate-400" />
            Copier l&apos;e-mail
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() =>
              run(() => {
                void navigator.clipboard.writeText(String(user.id));
                onCopy("ID copié");
              })
            }
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            <Copy className="h-4 w-4 text-slate-400" />
            Copier l&apos;ID
          </button>
          <div className="my-1 border-t border-slate-100" />
          <button
            type="button"
            role="menuitem"
            onClick={() => run(() => onDelete(user))}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer le compte
          </button>
        </div>
      )}
    </div>
  );
}
