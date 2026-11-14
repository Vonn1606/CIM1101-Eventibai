"use client";

import { useState, useEffect, useTransition } from "react";
import { BadgeCheck, CalendarDays, CalendarPlus, CircleCheck, Clock, MapPin, QrCode, Ticket, X } from "lucide-react";
import type { PastEvent, UpcomingEvent } from "@/app/actions/registration";
import { cancelRegistration } from "@/app/actions/registration";

export function UpcomingCard({ e }: { e: UpcomingEvent }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState<string>("");
  const [cancelled, setCancelled] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (e.qrCode) {
      import("qrcode")
        .then((QRCode) =>
          QRCode.toDataURL(e.qrCode, {
            width: 256,
            margin: 1,
            color: { dark: "#1a1c1e", light: "#ffffff" },
          })
        )
        .then((url) => setQrUrl(url))
        .catch((err) => console.error("Error creating QR:", err));
    }
  }, [e.qrCode]);

  if (cancelled) return null;

  const handleCancel = () => {
    if (!window.confirm(`Cancel your registration for "${e.title}"?`)) return;
    startTransition(async () => {
      const res = await cancelRegistration(e.id);
      if (res.error) {
        setCancelError(res.error);
      } else {
        setCancelled(true);
      }
    });
  };

  return (
    <article className="overflow-hidden rounded-xl bg-white shadow-sm">
      <div className={`flex items-center justify-between px-4 py-3 text-white ${e.headerColor}`}>
        <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.5px] ${e.featured ? "text-mint" : ""}`}>
          <Ticket className="size-3.5" />
          {e.headerLabel}
        </span>
        {e.featured && (
          <span className="flex items-center gap-1.5 rounded-full bg-maroon px-2.5 py-1 text-[10px] font-bold tracking-[0.6px] shadow-sm">
            <i className="size-2 rounded-full bg-mint" />
            Registered
          </span>
        )}
      </div>
      <div className="flex flex-col gap-3 p-5">
        <div className="flex gap-3">
          <div className="flex-1">
            <p className="flex items-center gap-1 text-[11px] font-bold tracking-[0.44px] text-maroon">
              <CalendarDays className="size-3" />
              {e.date}
            </p>
            <h3 className="mt-[3px] text-lg font-bold leading-[25px]">{e.title}</h3>
            <p className="mt-[3px] text-[11px] leading-4 text-body">{e.description}</p>
          </div>
          <div className="flex h-[98px] w-[84px] shrink-0 flex-col items-center rounded-xl bg-surface-low p-2">
            <div className="grid size-16 place-items-center rounded-lg bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] overflow-hidden">
              {qrUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrUrl} alt="QR" className="size-14 object-contain" />
              ) : (
                <QrCode className="size-9 text-neutral-400" />
              )}
            </div>
            <span className="pt-1 font-mono text-[9px] text-muted truncate max-w-[76px]">{e.qrCode}</span>
          </div>
        </div>
        <div className="-mx-5 flex flex-wrap gap-x-5 gap-y-2 bg-surface-low/60 px-5 pb-2 pt-1 text-[11px] text-body">
          <span className="flex items-center gap-1">
            <MapPin className="size-3 text-muted" />
            {e.venue}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-3 text-muted" />
            {e.meta}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex gap-2">
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1 rounded-lg bg-maroon px-3 py-2 text-[11px] font-bold tracking-[0.44px] text-white hover:bg-maroon-light transition"
            >
              <QrCode className="size-3" />
              View ticket
            </button>
            <button className="flex items-center gap-1 rounded-lg bg-surface-high px-3 py-2 text-[11px] font-bold tracking-[0.44px] text-body hover:bg-surface-highest transition">
              <CalendarPlus className="size-3" />
              Add to calendar
            </button>
          </div>
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="text-[10px] font-bold tracking-[0.6px] text-danger hover:underline disabled:opacity-50"
            >
              {isPending ? "Cancelling…" : "Cancel registration"}
            </button>
            {cancelError && (
              <span className="text-[9px] text-danger">{cancelError}</span>
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl relative text-center">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500"
            >
              <X size={18} />
            </button>
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
              Speed-Gate Fast-Pass
            </span>
            <h3 className="font-extrabold text-base text-neutral-900 mb-1">{e.title}</h3>
            <p className="text-xs text-neutral-500 mb-4">{e.date} · {e.venue}</p>

            <div className="p-4 mx-auto w-fit rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 mb-4">
              {qrUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrUrl} alt={`QR for ${e.qrCode}`} className="w-48 h-48 object-contain" />
              ) : (
                <div className="w-48 h-48 grid place-items-center text-xs text-neutral-400">Loading QR...</div>
              )}
            </div>

            <p className="font-mono font-bold text-lg text-[#6c0c28] tracking-widest">{e.qrCode}</p>
            <p className="text-[11px] text-neutral-400 mt-1">Present this pass at the gate scanner</p>
          </div>
        </div>
      )}
    </article>
  );
}

export function PastCard({ e }: { e: PastEvent }) {
  const attended = e.status === "attended";
  return (
    <article className="overflow-hidden rounded-xl bg-surface-low opacity-90">
      <div className="flex items-center justify-between bg-surface-highest px-4 py-2">
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.5px] text-muted">
          <CircleCheck className="size-3.5" />
          Concluded
        </span>
        {!attended && (
          <span className="flex items-center gap-1 rounded-full bg-surface-mid px-2.5 py-0.5 text-[10px] font-bold tracking-[0.6px] text-muted">
            <i className="size-2 rounded-full bg-muted" />
            Event ended
          </span>
        )}
      </div>
      <div className="flex flex-col gap-3 p-5">
        <div className="flex gap-3">
          <div className="flex-1">
            <p className="flex items-center gap-1 text-[11px] font-bold tracking-[0.44px] text-muted line-through">
              <CalendarDays className="size-3" />
              {e.date}
            </p>
            <h3 className="mt-[3px] text-lg font-bold leading-[25px] text-muted">{e.title}</h3>
            <p className="mt-[3px] text-[11px] leading-4 text-muted">{e.description}</p>
          </div>
          {attended && (
            <div className="flex h-[63px] shrink-0 flex-col items-center rounded-xl bg-surface-highest/60 p-2 text-green">
              <BadgeCheck className="size-7" />
              <span className="pt-1 text-[10px] font-bold">Verified</span>
            </div>
          )}
        </div>
        <div className="-mx-5 flex flex-wrap gap-5 bg-surface-high/40 px-5 pb-2 pt-1 text-[11px] text-muted">
          <span className="flex items-center gap-1">
            <MapPin className="size-3" />
            {e.venue}
          </span>
          {attended && (
            <span className="flex items-center gap-1 font-bold text-green">
              <BadgeCheck className="size-3.5" />
              {e.meta}
            </span>
          )}
        </div>
        <p className="pt-1 text-right text-[10px] font-bold tracking-[0.6px] text-muted">{e.footer}</p>
      </div>
    </article>
  );
}

