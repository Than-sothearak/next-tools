"use client";

import Image from "next/image";
import { useRef, type PointerEvent } from "react";
import type { Locale } from "@/lib/i18n";
import { changeCrop, clamp, drawCrop, pixelCrop, type Bounds, type Crop, type Handle } from "./geometry";

const handles = [
  ["nw", 0, 0], ["n", 50, 0], ["ne", 100, 0], ["e", 100, 50],
  ["se", 100, 100], ["s", 50, 100], ["sw", 0, 100], ["w", 0, 50],
] as const;

export function ImageCropEditor({ src, bounds, crop, onChange, locale }: {
  src: string;
  bounds: Bounds;
  crop: Crop;
  onChange: (crop: Crop) => void;
  locale: Locale;
}) {
  const surface = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ pointerId: number; handle: Handle | "draw"; start: { x: number; y: number }; crop: Crop } | null>(null);
  const km = locale === "km";
  const pixels = pixelCrop(crop);

  function point(event: PointerEvent) {
    const rect = surface.current!.getBoundingClientRect();
    return { x: clamp((event.clientX - rect.left) / rect.width * bounds.width, 0, bounds.width), y: clamp((event.clientY - rect.top) / rect.height * bounds.height, 0, bounds.height) };
  }

  function start(event: PointerEvent, handle: Handle | "draw") {
    if (event.button !== 0 || gesture.current) return;
    event.preventDefault();
    event.stopPropagation();
    surface.current!.setPointerCapture(event.pointerId);
    gesture.current = { pointerId: event.pointerId, handle, start: point(event), crop };
  }

  function move(event: PointerEvent) {
    const active = gesture.current;
    if (!active || active.pointerId !== event.pointerId) return;
    const end = point(event);
    onChange(active.handle === "draw" ? drawCrop(active.start, end, bounds) : changeCrop(active.crop, active.handle, end.x - active.start.x, end.y - active.start.y, bounds));
  }

  return (
    <section className="grid gap-4" aria-label={km ? "កាត់រូបភាព" : "Image crop editor"}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">{km ? "កាត់រូបភាព" : "Crop your image"}</h2>
          <p className="mt-1 text-sm text-[#737b87]">{km ? "អូសជ្រុងដើម្បីកាត់ ឬអូសផ្ទៃដែលបានជ្រើសដើម្បីផ្លាស់ទី។" : "Drag the edges or corners to crop. Drag inside to move, or outside to draw a new selection."}</p>
        </div>
        <button type="button" className="btn text-sm" onClick={() => onChange({ x: 0, y: 0, ...bounds })}>{km ? "កំណត់ឡើងវិញ" : "Reset crop"}</button>
      </div>
      <div className="flex justify-center rounded-xl bg-[#20262b] p-5 sm:p-8">
        <div
          ref={surface}
          className="relative touch-none select-none"
          style={{ width: `min(100%, ${bounds.width}px, ${60 * bounds.width / bounds.height}vh)`, aspectRatio: `${bounds.width} / ${bounds.height}`, cursor: "crosshair" }}
          onPointerDown={(event) => start(event, "draw")}
          onPointerMove={move}
          onPointerUp={(event) => {
            if (gesture.current?.pointerId !== event.pointerId) return;
            move(event);
            gesture.current = null;
            event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onPointerCancel={() => { gesture.current = null; }}
          onLostPointerCapture={() => { gesture.current = null; }}
        >
          <Image src={src} alt={km ? "រូបភាពដើម" : "Original image to crop"} fill unoptimized draggable={false} className="pointer-events-none object-contain" />
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div style={{ position: "absolute", left: `${crop.x / bounds.width * 100}%`, top: `${crop.y / bounds.height * 100}%`, width: `${crop.width / bounds.width * 100}%`, height: `${crop.height / bounds.height * 100}%`, boxShadow: "0 0 0 9999px rgb(0 0 0 / 55%)" }} />
          </div>
          <div
            className="absolute border-2 border-white outline-none focus-visible:ring-4 focus-visible:ring-emerald-400"
            style={{ left: `${crop.x / bounds.width * 100}%`, top: `${crop.y / bounds.height * 100}%`, width: `${crop.width / bounds.width * 100}%`, height: `${crop.height / bounds.height * 100}%`, cursor: "move" }}
            role="group"
            tabIndex={0}
            aria-label={km ? "តំបន់កាត់រូបភាព" : "Crop selection. Use arrow keys to move; hold Shift for larger steps."}
            onPointerDown={(event) => start(event, "move")}
            onKeyDown={(event) => {
              const step = event.shiftKey ? 10 : 1;
              const delta: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
              if (!delta[event.key]) return;
              event.preventDefault();
              onChange(changeCrop(crop, "move", ...delta[event.key], bounds));
            }}
          >
            {[1, 2].map((line) => <div key={line} className="pointer-events-none absolute inset-0" aria-hidden="true"><span className="absolute inset-y-0 border-l border-white/40" style={{ left: `${line * 100 / 3}%` }} /><span className="absolute inset-x-0 border-t border-white/40" style={{ top: `${line * 100 / 3}%` }} /></div>)}
            {handles.map(([handle, left, top]) => <span key={handle} aria-hidden="true" className="absolute z-10 flex h-7 w-7 items-center justify-center" style={{ left: `${left}%`, top: `${top}%`, transform: "translate(-50%, -50%)", cursor: `${handle}-resize` }} onPointerDown={(event) => start(event, handle)}><span className="h-3 w-3 border border-[#265d50] bg-white shadow-sm" /></span>)}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(["x", "y", "width", "height"] as const).map((key) => (
          <label key={key} className="text-sm">
            {{ x: km ? "ទីតាំង X" : "Left (px)", y: km ? "ទីតាំង Y" : "Top (px)", width: km ? "ទទឹងកាត់ (px)" : "Crop width (px)", height: km ? "កម្ពស់កាត់ (px)" : "Crop height (px)" }[key]}
            <input type="number" className="field mt-1" min={key === "x" || key === "y" ? 0 : 1} max={key === "x" ? bounds.width - pixels.width : key === "y" ? bounds.height - pixels.height : key === "width" ? bounds.width - pixels.x : bounds.height - pixels.y} value={pixels[key]} onChange={(event) => {
              const value = event.target.valueAsNumber;
              if (!Number.isFinite(value)) return;
              const next = { ...pixels };
              next[key] = clamp(Math.round(value), key === "x" || key === "y" ? 0 : 1, Number(event.target.max));
              onChange(next);
            }} />
          </label>
        ))}
      </div>
      <p className="text-xs text-[#737b87]">{km ? "រូបភាពដើម" : "Original"}: {bounds.width} × {bounds.height} px · {km ? "តំបន់កាត់" : "Selection"}: {pixels.width} × {pixels.height} px</p>
    </section>
  );
}
