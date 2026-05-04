// SPDX-FileCopyrightText: Copyright (c) 2026 Wataru Ashihara <wataash0607@gmail.com>
// SPDX-License-Identifier: Apache-2.0

import { notFound } from "next/navigation";
import GenscaleApp from "../genscale-app";

const LOCALES = ["en", "ja"] as const;
type Locale = (typeof LOCALES)[number];

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams?: Promise<{
    settings?: string | string[];
  }>;
};

function isLocale(locale: string): locale is Locale {
  return LOCALES.includes(locale as Locale);
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;

  return {
    title: "genscale",
    description:
      locale === "ja"
        ? "ギター指板スケールSVGジェネレーター"
        : "Interactive guitar fretboard scale SVG generator",
  };
}

export default async function LocalePage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const query = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const settings =
    typeof query?.settings === "string" ? query.settings : undefined;

  return <GenscaleApp initialSettingsText={settings} locale={locale} />;
}
