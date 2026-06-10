"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Copy, Mail, MoreVertical, Pencil, Trash2 } from "lucide-react";
import clsx from "clsx";
import type { User } from "@/lib/api";

const MENU_WIDTH = 208;
const MENU_HEIGHT_ESTIMATE = 196;

type UserActionsMenuProps = {
  user: User;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onCopy: (message: string) => void;
};

export default function UserActionsMenu({
  user,
  canEdit = true,
  canDelete = true,
  onEdit,
  onDelete,
  onCopy,
}: UserActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{
    top: number;
    left: number;
    openUp: boolean;
  } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    const btn = buttonRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp =
      spaceBelow < MENU_HEIGHT_ESTIMATE &&
      rect.top > MENU_HEIGHT_ESTIMATE;

    setMenuPos({
      top: openUp ? rect.top - 8 : rect.bottom + 4,
      left: Math.max(8, rect.right - MENU_WIDTH),
      openUp,
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const handleReposition = () => updatePosition();

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open]);

  const run = (action: () => void) => {
    setOpen(false);
    action();
  };

  const menu =
    open && menuPos ? (
      <div
        ref={menuRef}
        className={clsx(
          "fixed z-[200] w-52 rounded-xl border border-slate-200 bg-white py-1 shadow-xl",
          menuPos.openUp && "-translate-y-full",
        )}
        style={{ top: menuPos.top, left: menuPos.left }}
        role="menu"
      >
        {canEdit && (
          <button
            type="button"
            role="menuitem"
            onClick={() => run(() => onEdit(user))}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            <Pencil className="h-4 w-4 text-slate-400" />
            Modifier le compte
          </button>
        )}
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
        {canDelete && (
          <>
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
          </>
        )}
      </div>
    ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Actions pour ${user.name} ${user.surname}`}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="btn-ghost !p-2"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {typeof document !== "undefined" && menu
        ? createPortal(menu, document.body)
        : null}
    </>
  );
}
