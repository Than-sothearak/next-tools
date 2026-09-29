import { ToolListPage } from "@/components/site";
import { validLocale } from "@/lib/i18n";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  const { category } = await searchParams;
  return <ToolListPage locale={validLocale(locale)} category={category} />;
}
