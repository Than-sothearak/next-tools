import { HomePage } from "@/components/home-page";
import { validLocale } from "@/lib/i18n";
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <HomePage locale={validLocale(locale)} />;
}
