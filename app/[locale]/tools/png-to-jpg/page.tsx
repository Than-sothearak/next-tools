import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { validLocale } from "@/lib/i18n";
import { getTool } from "@/lib/tools";
import { PngToJpgToolPage } from "./_components/PngToJpgToolPage";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const tool = getTool("png-to-jpg");
  if (!tool) return {};

  const locale = validLocale(rawLocale);
  const title = `${tool.name[locale]} | Tools`;
  const description = tool.description[locale];

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
  };
}

export default async function Page({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  if (!getTool("png-to-jpg")) notFound();

  return <PngToJpgToolPage locale={validLocale(rawLocale)} />;
}
