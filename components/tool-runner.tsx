"use client";
import {
  useRef,
  useState,
  useEffect,
  ChangeEvent,
  DragEvent,
  type ReactNode,
  type ComponentType,
} from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Upload,
  Trash2,
  LockKeyhole,
  Download,
  Copy,
  Check,
  FileText,
  Eye,
  X,
} from "lucide-react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { tools, categoryLabel, getTool } from "@/lib/tools";
import { copy, Locale } from "@/lib/i18n";
import { Navbar, Footer, ToolGrid } from "@/components/site";
const isClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
export function ActionButton({
  onClick,
  children,
  disabled = false,
}: {
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  if (!isClerk)
    return (
      <button className="btn btn-primary" disabled={disabled} onClick={onClick}>
        {children}
      </button>
    );
  return (
    <AuthenticatedAction onClick={onClick} disabled={disabled}>
      {children}
    </AuthenticatedAction>
  );
}
function AuthenticatedAction({
  onClick,
  children,
  disabled,
}: {
  onClick: () => void;
  children: ReactNode;
  disabled: boolean;
}) {
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const pending = useRef(false);
  useEffect(() => {
    if (isSignedIn && pending.current) {
      pending.current = false;
      onClick();
    }
  }, [isSignedIn, onClick]);
  return (
    <button
      className="btn btn-primary"
      disabled={disabled}
      onClick={() => {
        if (isSignedIn) onClick();
        else {
          pending.current = true;
          openSignIn();
        }
      }}
    >
      {!isSignedIn && <LockKeyhole size={15} />} {children}
    </button>
  );
}
export type ToolOptions = Record<string, string | boolean>;
export type ToolProcessor = (
  files: File[],
  text: string,
  options: ToolOptions,
  save: (blob: Blob, name: string) => void,
  setResult: (value: string) => void,
) => Promise<void>;
export type ToolControlsProps = {
  locale: Locale;
  text: string;
  setText: (value: string) => void;
  options: ToolOptions;
  update: (key: string, value: string | boolean) => void;
  addFiles: (files: File[]) => void;
  openFilePicker: () => void;
};
export type ToolRunnerConfig = {
  accept: string;
  acceptedLabel: string;
  actionLabel: { en: string; km: string };
  process: ToolProcessor;
  controls?: ComponentType<ToolControlsProps>;
  multiple?: boolean;
  textInput?: boolean;
  hideUploader?: boolean;
  allowEmptyInput?: boolean;
  reorderFiles?: boolean;
  imagePreview?: boolean;
  initialOptions?: ToolOptions;
  shareDownloads?: boolean;
};

export function ToolPage({
  slug,
  locale,
  config,
}: {
  slug: string;
  locale: Locale;
  config?: ToolRunnerConfig;
}) {
  const tool = getTool(slug);
  if (!tool) return null;
  const t = copy[locale],
    Icon = tool.icon,
    related = tools
      .filter((x) => x.category === tool.category && x.slug !== tool.slug)
      .slice(0, 4);
  return (
    <>
      <Navbar locale={locale} />
      <main className="shell">
        <div className="pt-9">
          <div className="mb-4 text-xs text-[#737b87]">
            <Link href={`/${locale}`}>{t.home}</Link> /{" "}
            <Link href={`/${locale}/tools?category=${tool.category}`}>
              {categoryLabel[tool.category][locale]}
            </Link>{" "}
            / {tool.name[locale]}
          </div>
          <div className="mb-7 flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f0f5f2] text-[#356859]">
              <Icon size={23} />
            </span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {tool.name[locale]}
              </h1>
              <p className="mt-2 text-sm leading-6 text-[#737b87] sm:text-base">
                {tool.description[locale]}
              </p>
            </div>
          </div>
          {tool.comingSoon || !config ? (
            <div className="card flex min-h-[250px] flex-col items-center justify-center p-8 text-center">
              <span className="rounded-full bg-[#f5f6f7] px-3 py-1 text-xs font-semibold text-[#59616b]">
                {t.coming}
              </span>
              <h2 className="mt-4 text-xl font-semibold">
                {tool.name[locale]}
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#737b87]">
                {locale === "en"
                  ? "We’re preparing this tool. Check back soon."
                  : "យើងកំពុងរៀបចំឧបករណ៍នេះ។ សូមត្រឡប់មកពិនិត្យម្ដងទៀត។"}
              </p>
            </div>
          ) : (
            <ToolRunner locale={locale} config={config} />
          )}
        </div>
        <section className="mt-10 grid gap-6 border-t border-[#eceef0] py-8 md:grid-cols-2">
          <div>
            <h2 className="font-semibold">{t.how}</h2>
            <ol className="mt-3 grid gap-2 text-sm leading-6 text-[#737b87]">
              {[
                locale === "en"
                  ? "Upload or enter your content."
                  : "បង្ហោះឯកសារ ឬបញ្ចូលអត្ថបទ។",
                locale === "en"
                  ? "Configure the options you need."
                  : "កំណត់ជម្រើសដែលអ្នកត្រូវការ។",
                locale === "en"
                  ? "Click the action button to process."
                  : "ចុចប៊ូតុងដើម្បីដំណើរការ។",
                locale === "en"
                  ? "Download or copy your result."
                  : "ទាញយក ឬចម្លងលទ្ធផលរបស់អ្នក។",
              ].map((line, i) => (
                <li key={line} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f0f5f2] text-xs font-semibold text-[#356859]">
                    {i + 1}
                  </span>
                  {line}
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-xl border border-[#e8eeeb] bg-[#f8faf9] p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <LockKeyhole size={16} className="text-[#477566]" />
              {t.privacy}
            </div>
            <p className="mt-2 text-sm leading-6 text-[#737b87]">
              {t.privacyText}
            </p>
          </div>
        </section>
        {related.length > 0 && (
          <section className="border-t border-[#eceef0] py-8">
            <h2 className="mb-5 text-lg font-bold">{t.related}</h2>
            <ToolGrid items={related} locale={locale} />
          </section>
        )}
      </main>
      <Footer locale={locale} />
    </>
  );
}
function ToolRunner({
  locale,
  config,
}: {
  locale: Locale;
  config: ToolRunnerConfig;
}) {
  const t = copy[locale];
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloads, setDownloads] = useState<
    { name: string; url: string; blob: Blob }[]
  >([]);
  const [previewDownload, setPreviewDownload] = useState<
    (typeof downloads)[number] | null
  >(null);
  const [shareError, setShareError] = useState("");
  const [drag, setDrag] = useState(false);
  const [options, setOptions] = useState<ToolOptions>(
    () => config.initialOptions ?? {},
  );
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrls = useRef<string[]>([]);

  useEffect(
    () => () => objectUrls.current.forEach((url) => URL.revokeObjectURL(url)),
    [],
  );

  useEffect(() => {
    if (!previewDownload) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreviewDownload(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [previewDownload]);

  const update = (key: string, value: string | boolean) =>
    setOptions((current) => ({ ...current, [key]: value }));
  const addFiles = (incoming: FileList | File[] | null) => {
    if (!incoming) return;
    const incomingFiles = Array.from(incoming);
    setError("");
    setDownloads([]);
    setPreviewDownload(null);
    const accepted = incomingFiles.filter(
      (file) =>
        file.size <= 50 * 1024 * 1024 &&
        (config.accept === "*/*" ||
          config.accept.split(",").some((type) => file.type === type)),
    );
    if (accepted.length < incomingFiles.length)
      setError(
        locale === "km"
          ? "ទម្រង់ឯកសារមិនគាំទ្រ ឬឯកសារធំពេក (អតិបរមា 50 MB)។"
          : "Unsupported file format or file too large (50 MB max).",
      );
    if (accepted.length)
      setFiles((current) =>
        [...current, ...accepted].slice(0, config.multiple ? 30 : 1),
      );
  };
  const onInput = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(event.target.files);
    event.target.value = "";
  };
  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDrag(false);
    addFiles(event.dataTransfer.files);
  };
  const saveBlob = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    objectUrls.current.push(url);
    setDownloads((current) => [...current, { name, url, blob }]);
  };
  const shareDownload = async (download: (typeof downloads)[number]) => {
    const file = new File([download.blob], download.name, {
      type: download.blob.type || "application/pdf",
    });
    if (!navigator.share) {
      setShareError("File sharing is not available in this browser. Download the PDF instead.");
      return;
    }

    try {
      if (navigator.canShare && !navigator.canShare({ files: [file] })) {
        setShareError("This browser cannot share PDF files. Download the PDF instead.");
        return;
      }
      setShareError("");
      await navigator.share({ files: [file], title: download.name });
    } catch (cause) {
      if (cause instanceof Error && cause.name === "AbortError") return;
      setShareError("Could not share the PDF. You can still download it.");
    }
  };
  const run = async () => {
    setError("");
    setResult("");
    setDownloads([]);
    setPreviewDownload(null);
    setBusy(true);
    try {
      await config.process(files, text, options, saveBlob, setResult);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t.error);
    } finally {
      setBusy(false);
    }
  };
  const hasInput =
    files.length > 0 || text.length > 0 || Boolean(config.allowEmptyInput);
  const Controls = config.controls;

  return (
    <div className="card p-4 sm:p-6">
      <input
        ref={inputRef}
        className="hidden"
        type="file"
        multiple={Boolean(config.multiple)}
        accept={config.accept}
        onChange={onInput}
      />
      {!config.hideUploader && !config.textInput && (
        <div
          className="drop mb-5 flex min-h-[178px] flex-col items-center justify-center p-6 text-center"
          onDragOver={(event) => {
            event.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          style={drag ? { borderColor: "#477566", background: "#f2f8f5" } : {}}
        >
          <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#477566] shadow-sm">
            <Upload size={20} />
          </span>
          <div className="font-semibold">{t.drop}</div>
          <p className="mt-1 text-xs text-[#737b87]">{config.acceptedLabel}</p>
          <button
            className="btn mt-4 !px-4 !py-2 text-sm"
            onClick={() => inputRef.current?.click()}
          >
            {t.choose}
          </button>
        </div>
      )}
      {Controls && (
        <Controls
          locale={locale}
          text={text}
          setText={setText}
          options={options}
          update={update}
          addFiles={(files) => addFiles(files)}
          openFilePicker={() => inputRef.current?.click()}
        />
      )}
      {files.length > 0 && (
        <div className="mb-5 grid gap-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              draggable={Boolean(config.reorderFiles)}
              onDragStart={(event) =>
                event.dataTransfer.setData("text/plain", String(index))
              }
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                if (!config.reorderFiles) return;
                event.preventDefault();
                const from = Number(event.dataTransfer.getData("text/plain"));
                setFiles((current) => {
                  const ordered = [...current];
                  const [moved] = ordered.splice(from, 1);
                  ordered.splice(index, 0, moved);
                  return ordered;
                });
              }}
              className={`flex items-center justify-between rounded-lg border border-[#eceef0] px-3 py-2.5 ${config.reorderFiles ? "cursor-grab" : ""}`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <FileText size={17} className="shrink-0 text-[#839088]" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{file.name}</div>
                  <div className="text-xs text-[#737b87]">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              </div>
              <button
                className="rounded p-2 text-[#9299a2] hover:text-red-600"
                onClick={() =>
                  setFiles((current) => current.filter((_, i) => i !== index))
                }
                aria-label="Remove file"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <ActionButton
          onClick={run}
          disabled={busy || (!hasInput && files.length === 0)}
        >
          {busy ? t.processing : config.actionLabel[locale]}
        </ActionButton>
        {downloads.map((download, index) => {
          const isPdf =
            download.blob.type === "application/pdf" ||
            download.name.toLowerCase().endsWith(".pdf");
          return (
            <div className="flex flex-wrap gap-2" key={`${download.name}-${index}`}>
              {isPdf && (
                <button
                  className="btn"
                  type="button"
                  onClick={() => setPreviewDownload(download)}
                  aria-label={`${locale === "km" ? "មើលជាមុន" : "Preview"} ${download.name}`}
                >
                  <Eye size={16} />
                  {locale === "km" ? "មើលជាមុន" : "Preview"}
                </button>
              )}
              <a
                className="btn"
                href={download.url}
                download={download.name}
              >
                <Download size={16} />
                {t.download} {downloads.length > 1 ? index + 1 : ""}
              </a>
            </div>
          );
        })}
        {config.shareDownloads && downloads[0] && (
          <>
            <button
              className="btn"
              type="button"
              onClick={() => void shareDownload(downloads[0])}
            >
              {locale === "km" ? "ចែករំលែក / រក្សាទុក PDF" : "Share / Save PDF"}
            </button>
            <span className="text-xs text-[#737b87]">
              {locale === "km"
                ? "នៅលើ iPhone សូមជ្រើសរើស Save to Files ឬកម្មវិធីផ្សេង។"
                : "On iPhone, choose Save to Files or another app from the share sheet."}
            </span>
          </>
        )}
        {result && (
          <button
            className="btn"
            onClick={async () => {
              await navigator.clipboard.writeText(result);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? t.copied : t.copy}
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {shareError && (
        <p role="status" className="mt-3 text-sm text-[#737b87]">
          {shareError}
        </p>
      )}
      {previewDownload && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-0 sm:p-6"
          role="presentation"
          onClick={() => setPreviewDownload(null)}
        >
          <section
            className="flex h-[100dvh] w-full flex-col overflow-hidden bg-white sm:h-[90vh] sm:max-w-5xl sm:rounded-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pdf-preview-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[#eceef0] px-4 py-3">
              <h2 id="pdf-preview-title" className="truncate text-sm font-semibold">
                {previewDownload.name}
              </h2>
              <button
                className="rounded-lg p-2 text-[#59616b] hover:bg-[#f2f3f5]"
                type="button"
                onClick={() => setPreviewDownload(null)}
                aria-label={locale === "km" ? "បិទការមើលជាមុន" : "Close preview"}
              >
                <X size={20} />
              </button>
            </header>
            <iframe
              className="min-h-0 flex-1 bg-[#525659]"
              src={previewDownload.url}
              title={`${locale === "km" ? "មើល PDF" : "PDF preview"}: ${previewDownload.name}`}
            />
          </section>
        </div>
      )}
      {(result || (config.imagePreview && downloads.length > 0)) && (
        <div className="mt-5">
          {result && <ResultView result={result} />}
          {config.imagePreview && downloads[0] && (
            <div className="mt-3 flex justify-center rounded-xl bg-[#fafbfc] p-5">
              <Image unoptimized width={192} height={192} className="h-48 w-48" src={downloads[0].url} alt="Generated QR code" />
            </div>
          )}
        </div>
      )}
      {config.reorderFiles && files.length > 1 && (
        <p className="mt-3 text-xs text-[#737b87]">
          {locale === "en"
            ? "Drag files in the list to arrange them before processing."
            : "អាចតម្រៀបឯកសារមុនពេលដំណើរការ។"}
        </p>
      )}
    </div>
  );
}
function ResultView({ result }: { result: string }) {
  return (
    <div className="rounded-lg bg-[#f7f8fa] p-4">
      <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words font-mono text-sm leading-6">
        {result}
      </pre>
    </div>
  );
}
