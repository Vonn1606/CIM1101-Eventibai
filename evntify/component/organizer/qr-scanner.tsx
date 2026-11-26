"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { CameraOff, RefreshCw, Video } from "lucide-react";

interface QrScannerProps {
  active: boolean;
  onScan: (code: string) => void;
}

type BarcodeDetectorLike = {
  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>>;
};

export default function QrScanner({ active, onScan }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastScannedRef = useRef<{ code: string; at: number }>({ code: "", at: 0 });
  const onScanRef = useRef(onScan);
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const [status, setStatus] = useState<"starting" | "ready" | "error">("starting");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    let stream: MediaStream | null = null;
    let rafId = 0;

    async function startCamera() {
      setStatus("starting");
      setErrorMsg(null);

      if (typeof window === "undefined") return;

      if (!window.isSecureContext) {
        setStatus("error");
        setErrorMsg("Camera access requires HTTPS (or localhost). Please use the manual ticket input below.");
        return;
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("error");
        setErrorMsg("Camera API is not supported in this browser. Please enter the ticket code manually.");
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        const video = videoRef.current;
        if (!video) return;

        video.srcObject = stream;
        await video.play();
        setStatus("ready");

        // Use native BarcodeDetector if available, otherwise jsQR via offscreen canvas
        const BarcodeDetectorCtor = (
          window as unknown as {
            BarcodeDetector?: new (opts: { formats: string[] }) => BarcodeDetectorLike;
          }
        ).BarcodeDetector;
        const detector = BarcodeDetectorCtor
          ? new BarcodeDetectorCtor({ formats: ["qr_code"] })
          : null;

        let lastFrameAt = 0;
        const scanFrame = async (now: number) => {
          if (cancelled) return;
          const v = videoRef.current;
          if (v && v.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA && now - lastFrameAt >= 150) {
            lastFrameAt = now;
            let rawValue: string | null = null;

            if (detector) {
              try {
                const results = await detector.detect(v);
                rawValue = results[0]?.rawValue ?? null;
              } catch {
                // Fall back to jsQR if BarcodeDetector fails on this frame
              }
            }

            if (!rawValue && v.videoWidth > 0 && v.videoHeight > 0) {
              const canvas = canvasRef.current ?? document.createElement("canvas");
              canvasRef.current = canvas;
              canvas.width = v.videoWidth;
              canvas.height = v.videoHeight;
              const ctx = canvas.getContext("2d", { willReadFrequently: true });
              if (ctx) {
                ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const decoded = jsQR(imgData.data, imgData.width, imgData.height, {
                  inversionAttempts: "dontInvert",
                });
                rawValue = decoded?.data ?? null;
              }
            }

            if (rawValue) {
              const trimmed = rawValue.trim();
              const prev = lastScannedRef.current;
              const ts = Date.now();
              if (trimmed && (trimmed !== prev.code || ts - prev.at > 2500)) {
                lastScannedRef.current = { code: trimmed, at: ts };
                onScanRef.current(trimmed);
              }
            }
          }
          rafId = requestAnimationFrame((t) => void scanFrame(t));
        };

        rafId = requestAnimationFrame((t) => void scanFrame(t));
      } catch (err: unknown) {
        if (cancelled) return;
        const name = err instanceof Error ? err.name : "";
        if (name === "NotAllowedError" || name === "PermissionDeniedError") {
          setErrorMsg("Camera permission was denied. Allow camera access or enter the ticket code manually.");
        } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
          setErrorMsg("No camera detected on this device. Please enter the ticket code manually.");
        } else {
          setErrorMsg("Unable to start camera. Please enter the ticket code manually.");
        }
        setStatus("error");
      }
    }

    void startCamera();

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [active, retryKey]);

  return (
    <div className="relative my-5 flex aspect-square w-64 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#651C32] bg-[#1E1B19]">
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className={`h-full w-full object-cover ${status === "ready" ? "opacity-100" : "opacity-0"}`}
      />

      {status === "starting" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FAF5F2] p-4 text-center">
          <Video size={32} className="animate-pulse text-[#651C32]" />
          <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-[#8A7B78]">
            Starting camera…
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FAF5F2] p-4 text-center">
          <CameraOff size={28} className="text-[#651C32]" />
          <p className="mt-2 text-[11px] font-medium leading-relaxed text-[#5A4B48]">
            {errorMsg}
          </p>
          <button
            type="button"
            onClick={() => setRetryKey((k) => k + 1)}
            className="mt-3 inline-flex items-center gap-1 rounded-lg bg-[#651C32] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#521325]"
          >
            <RefreshCw size={12} />
            Retry Camera
          </button>
        </div>
      )}

      {/* Visual Scanner corners */}
      <div className="pointer-events-none absolute left-2 top-2 h-4 w-4 border-l-2 border-t-2 border-[#651C32]" />
      <div className="pointer-events-none absolute right-2 top-2 h-4 w-4 border-r-2 border-t-2 border-[#651C32]" />
      <div className="pointer-events-none absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-[#651C32]" />
      <div className="pointer-events-none absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-[#651C32]" />
    </div>
  );
}
