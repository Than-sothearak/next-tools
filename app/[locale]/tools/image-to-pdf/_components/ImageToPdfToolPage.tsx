"use client";
import { useEffect, useRef, useState } from "react";
import { Camera, LoaderCircle } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";
import type { ToolControlsProps } from "@/components/tool-runner";
import { imageAsPngBytes } from "../../_components/imageProcessing";
import { enhanceDocument } from "./enhanceDocument";

function Controls({ options, update, addFiles, openFilePicker }: ToolControlsProps) {
  const [activeTab, setActiveTab] = useState<"camera" | "files">("camera");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState("");
  const [capturedCount, setCapturedCount] = useState(0);
  const [captureFlash, setCaptureFlash] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const captureInProgress = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scanFrameRef = useRef<HTMLDivElement>(null);
  const paperRatio = options.paper === "letter" ? 8.5 / 11 : 210 / 297;
  const frameRatio =
    options.orientation === "landscape" ? 1 / paperRatio : paperRatio;
  const scanFrameStyle =
    options.paper === "fit"
      ? { width: "88%", height: "86%" }
      : {
          height: "86%",
          width: "auto",
          maxWidth: "88%",
          aspectRatio: frameRatio,
        };

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      void videoRef.current.play().catch(() => {
        setCameraError("Could not start the camera preview. Please try again.");
      });
    }
    return () => stream?.getTracks().forEach((track) => track.stop());
  }, [stream]);

  const openCamera = async () => {
    setActiveTab("camera");
    setCameraError("");
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera access is not available in this browser.");
      }
      const camera = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 3840 },
          height: { ideal: 2160 },
          frameRate: { ideal: 30 },
        },
      });
      setStream(camera);
    } catch {
      setCameraError(
        "Camera access was blocked. Allow camera permission and try again.",
      );
    }
  };

  const chooseFiles = () => {
    setActiveTab("files");
    setStream(null);
    openFilePicker();
  };

  const capturePage = async () => {
    if (captureInProgress.current) return;
    const video = videoRef.current;
    if (!video?.videoWidth || !video.videoHeight) {
      setCameraError("The camera is still starting. Please try again.");
      return;
    }

    captureInProgress.current = true;
    setCapturing(true);
    let still: ImageBitmap | null = null;
    try {
      setCameraError("");
      setCaptureFlash(true);
      window.setTimeout(() => setCaptureFlash(false), 240);

      let source: CanvasImageSource = video;
      let sourceWidth = video.videoWidth;
      let sourceHeight = video.videoHeight;
      const captureWindow = window as Window & {
        ImageCapture?: new (track: MediaStreamTrack) => {
          takePhoto: () => Promise<Blob>;
        };
      };
      const track = stream?.getVideoTracks()[0];
      if (track && captureWindow.ImageCapture) {
        try {
          const photo = await new captureWindow.ImageCapture(track).takePhoto();
          still = await createImageBitmap(photo);
          source = still;
          sourceWidth = still.width;
          sourceHeight = still.height;
        } catch {
          // Fall back to the highest resolution available in the live stream.
        }
      }

      const canvas = document.createElement("canvas");
      let sourceX = 0;
      let sourceY = 0;
      let cropWidth = video.videoWidth;
      let cropHeight = video.videoHeight;
      if (options.paper !== "fit") {
        const videoRect = video.getBoundingClientRect();
        const frameRect = scanFrameRef.current?.getBoundingClientRect();
        if (frameRect && videoRect.width && videoRect.height) {
          const scale = Math.max(
            videoRect.width / video.videoWidth,
            videoRect.height / video.videoHeight,
          );
          const renderedWidth = video.videoWidth * scale;
          const renderedHeight = video.videoHeight * scale;
          const offsetX = (videoRect.width - renderedWidth) / 2;
          const offsetY = (videoRect.height - renderedHeight) / 2;
          sourceX =
            (frameRect.left - videoRect.left - offsetX) / scale;
          sourceY =
            (frameRect.top - videoRect.top - offsetY) / scale;
          cropWidth = frameRect.width / scale;
          cropHeight = frameRect.height / scale;

          sourceX = Math.max(0, Math.min(video.videoWidth - 1, sourceX));
          sourceY = Math.max(0, Math.min(video.videoHeight - 1, sourceY));
          cropWidth = Math.min(cropWidth, video.videoWidth - sourceX);
          cropHeight = Math.min(cropHeight, video.videoHeight - sourceY);
        }
      }

      const scaleToStillX = sourceWidth / video.videoWidth;
      const scaleToStillY = sourceHeight / video.videoHeight;
      sourceX *= scaleToStillX;
      sourceY *= scaleToStillY;
      cropWidth *= scaleToStillX;
      cropHeight *= scaleToStillY;

      if (options.paper !== "fit") {
        const paperRatio = options.paper === "letter" ? 8.5 / 11 : 210 / 297;
        const targetRatio =
          options.orientation === "landscape" ? 1 / paperRatio : paperRatio;
        const frameRatio = cropWidth / cropHeight;
        if (frameRatio > targetRatio) {
          const targetWidth = cropHeight * targetRatio;
          sourceX += (cropWidth - targetWidth) / 2;
          cropWidth = targetWidth;
        } else {
          const targetHeight = cropWidth / targetRatio;
          sourceY += (cropHeight - targetHeight) / 2;
          cropHeight = targetHeight;
        }
      }

      canvas.width = Math.round(cropWidth);
      canvas.height = Math.round(cropHeight);
      const context = canvas.getContext("2d");
      if (!context) {
        still?.close();
        setCameraError("Could not capture this page. Please try again.");
        return;
      }
      context.drawImage(
        source,
        sourceX,
        sourceY,
        cropWidth,
        cropHeight,
        0,
        0,
        canvas.width,
        canvas.height,
      );
      still?.close();
      still = null;
      let enhancementWarning = "";
      if (options.scanMode !== "original") {
        try {
          await enhanceDocument(canvas, options.scanMode === "grayscale" ? "grayscale" : "color");
        } catch {
          enhancementWarning = "Scan enhancement was unavailable. The original capture was kept.";
        }
      }
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.98);
      });
      if (!blob) throw new Error("Could not capture this page. Please try again.");
      addFiles([
        new File([blob], `scan-${Date.now()}.jpg`, {
          type: "image/jpeg",
          lastModified: Date.now(),
        }),
      ]);
      setCapturedCount((count) => count + 1);
      setCameraError(enhancementWarning);
    } catch (cause) {
      setCameraError(cause instanceof Error ? cause.message : "Could not capture this page. Please try again.");
    } finally {
      still?.close();
      captureInProgress.current = false;
      setCapturing(false);
    }
  };

  return (
    <div
      className={
        stream
          ? "fixed inset-0 z-[60] flex h-[100dvh] flex-col gap-4 overflow-hidden bg-[#0b1411] p-4 text-white sm:static sm:mb-5 sm:h-auto sm:overflow-visible sm:rounded-lg sm:bg-[#fafbfc] sm:p-4 sm:text-inherit"
          : "mb-5 grid gap-4 rounded-lg bg-[#fafbfc] p-4"
      }
      style={stream ? { paddingBottom: "max(1rem, env(safe-area-inset-bottom))" } : undefined}
    >
      <div className="flex shrink-0 items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Scan pages for your PDF</h2>
          <p className="mt-1 text-xs text-[#aeb9b4] sm:text-[#737b87]">
            Capture several pages or choose images from your device.
          </p>
        </div>
        {stream && (
          <button
            className="rounded-full border border-white/30 px-3 py-2 text-sm font-medium text-white"
            type="button"
            disabled={capturing}
            onClick={() => setStream(null)}
          >
            Done
          </button>
        )}
      </div>

      <div className="grid shrink-0 grid-cols-2 rounded-lg bg-black/5 p-1 sm:max-w-sm">
        <button
          className={`rounded-md px-4 py-2 text-sm font-semibold ${activeTab === "camera" ? "bg-[#1d2724] text-white" : "text-[#59616b]"}`}
          type="button"
          disabled={capturing}
          role="tab"
          aria-selected={activeTab === "camera"}
          onClick={() => void openCamera()}
        >
          Camera
        </button>
        <button
          className={`rounded-md px-4 py-2 text-sm font-semibold ${activeTab === "files" ? "bg-[#1d2724] text-white" : "text-[#59616b]"}`}
          type="button"
          disabled={capturing}
          role="tab"
          aria-selected={activeTab === "files"}
          onClick={chooseFiles}
        >
          Choose file
        </button>
      </div>

      {activeTab === "camera" && stream ? (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl bg-black sm:mx-auto sm:w-full sm:max-w-xl sm:flex-initial sm:aspect-[4/3]">
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover sm:static sm:aspect-[4/3]"
              autoPlay
              muted
              playsInline
            />
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div
              ref={scanFrameRef}
              className="relative rounded-lg border border-white/50"
                style={scanFrameStyle}
              >
                <span className="scanner-corner scanner-corner-top-left" />
                <span className="scanner-corner scanner-corner-top-right" />
                <span className="scanner-corner scanner-corner-bottom-left" />
                <span className="scanner-corner scanner-corner-bottom-right" />
                <span className="scanner-sweep" />
              </div>
            </div>
            {captureFlash && <span className="camera-flash" />}
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white">
              {options.paper === "fit"
                ? "Align the page inside the frame"
                : `Align ${String(options.paper).toUpperCase()} paper inside the frame`}
            </span>
          </div>
          <div className="grid shrink-0 grid-cols-2 items-end justify-items-center gap-x-3 gap-y-2 sm:flex sm:justify-center sm:gap-5">
            <label className="grid gap-1 text-xs text-white/80">
              Paper size
              <select
                disabled={capturing}
                className="rounded-lg border border-white/20 bg-[#17221e] px-3 py-2 text-sm text-white"
                value={String(options.paper ?? "a4")}
                onChange={(event) => update("paper", event.target.value)}
              >
                <option value="a4">A4</option>
                <option value="letter">Letter</option>
                <option value="fit">Fit photo</option>
              </select>
            </label>
            <label className="grid gap-1 text-xs text-white/80">
              Orientation
              <select
                disabled={capturing}
                className="rounded-lg border border-white/20 bg-[#17221e] px-3 py-2 text-sm text-white"
                value={String(options.orientation ?? "portrait")}
                onChange={(event) => update("orientation", event.target.value)}
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </label>
            <label className="grid gap-1 text-xs text-white/80">
              Scan quality
              <select
                disabled={capturing}
                className="rounded-lg border border-white/20 bg-[#17221e] px-3 py-2 text-sm text-white"
                value={String(options.scanMode ?? "color")}
                onChange={(event) => update("scanMode", event.target.value)}
              >
                <option value="color">Color enhance</option>
                <option value="grayscale">Grayscale</option>
                <option value="original">Original</option>
              </select>
            </label>
            <button
              className={`camera-shutter col-span-2 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border-4 border-white bg-[#8cf4d0] text-[#10221b] shadow-lg sm:col-span-1 ${captureFlash ? "camera-shutter-active" : ""}`}
              type="button"
              disabled={capturing}
              aria-busy={capturing}
              aria-label={capturing ? "Processing scan" : "Capture page"}
              onClick={capturePage}
            >
              {capturing ? <LoaderCircle size={25} className="animate-spin" /> : <Camera size={25} />}
            </button>
            <span role="status" className="text-xs text-white/80">
              {capturing ? "Processing scan…" : capturedCount > 0
                ? `${capturedCount} ${capturedCount === 1 ? "page" : "pages"} captured`
                : "Tap to capture a page"}
            </span>
          </div>
          {cameraError && (
            <p role="alert" className="shrink-0 text-center text-sm text-red-200">
              {cameraError}
            </p>
          )}
        </div>
      ) : activeTab === "camera" ? (
        <div className="grid justify-items-center gap-3 rounded-xl bg-[#f0f5f2] p-6 text-center">
          <Camera size={28} className="text-[#356859]" />
          <p className="text-sm text-[#59616b]">
            Use your phone’s rear camera to capture each page.
          </p>
          <button className="btn btn-primary" type="button" onClick={() => void openCamera()}>
            Open camera
          </button>
          {cameraError && (
            <p role="alert" className="text-sm text-red-700">
              {cameraError}
            </p>
          )}
        </div>
      ) : (
        <div className="grid justify-items-center gap-3 rounded-xl border border-dashed border-[#cbd0d7] bg-white p-6 text-center">
          <p className="text-sm text-[#59616b]">
            Select JPG, PNG, or WebP images from your device.
          </p>
          <button className="btn" type="button" onClick={openFilePicker}>
            Choose images
          </button>
        </div>
      )}

      {!stream && (
        <div className="grid gap-3 border-t border-[#e8ecea] pt-4 sm:grid-cols-2">
          <label className="text-sm">
            Paper size
            <select
              className="field mt-1"
              value={String(options.paper ?? "fit")}
              onChange={(event) => update("paper", event.target.value)}
            >
              <option value="fit">Fit image</option>
              <option value="a4">A4</option>
              <option value="letter">Letter</option>
            </select>
          </label>
          <label className="text-sm">
            Orientation
            <select
              className="field mt-1"
              value={String(options.orientation ?? "portrait")}
              onChange={(event) => update("orientation", event.target.value)}
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </label>
          <label className="text-sm">
            Margin
            <select
              className="field mt-1"
              value={String(options.margin ?? "none")}
              onChange={(event) => update("margin", event.target.value)}
            >
              <option value="none">None</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
            </select>
          </label>
        </div>
      )}
    </div>
  );
}
export function ImageToPdfToolPage({ locale }: { locale: Locale }) {
  return (
    <ToolPage
      slug="image-to-pdf"
      locale={locale}
      config={{
        accept: "image/jpeg,image/png,image/webp",
        acceptedLabel: "JPG, PNG, WebP · up to 50 MB",
        actionLabel: { en: "Create PDF", km: "បង្កើត PDF" },
        multiple: true,
        hideUploader: true,
        controls: Controls,
        reorderFiles: true,
        initialOptions: {
          paper: "a4",
          orientation: "portrait",
          margin: "none",
          scanMode: "color",
        },
        shareDownloads: true,
        process: async (files, _text, options, save) => {
          if (!files.length)
            throw new Error("Please select at least one file.");
          const pdf = await PDFDocument.create();
          const margin =
            options.margin === "none"
              ? 0
              : options.margin === "medium"
                ? 48
                : 24;
          for (const file of files) {
            const bytes = await file.arrayBuffer();
            const image =
              file.type === "image/jpeg"
                ? await pdf.embedJpg(bytes)
                : file.type === "image/png"
                  ? await pdf.embedPng(bytes)
                  : await pdf.embedPng(await imageAsPngBytes(file));
            let width = image.width;
            let height = image.height;
            if (options.paper === "a4") {
              width = 595.28;
              height = 841.89;
            } else if (options.paper === "letter") {
              width = 612;
              height = 792;
            }
            if (options.orientation === "landscape" && options.paper !== "fit")
              [width, height] = [height, width];
            const page = pdf.addPage([width, height]);
            const scale = Math.min(
              (width - margin * 2) / image.width,
              (height - margin * 2) / image.height,
            );
            const drawWidth = image.width * scale;
            const drawHeight = image.height * scale;
            page.drawImage(image, {
              x: (width - drawWidth) / 2,
              y: (height - drawHeight) / 2,
              width: drawWidth,
              height: drawHeight,
            });
          }
          save(
            new Blob([new Uint8Array(await pdf.save()).buffer as ArrayBuffer], {
              type: "application/pdf",
            }),
            "images.pdf",
          );
        },
      }}
    />
  );
}
