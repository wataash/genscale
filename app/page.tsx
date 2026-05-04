// SPDX-FileCopyrightText: Copyright (c) 2026 Wataru Ashihara <wataash0607@gmail.com>
// SPDX-License-Identifier: Apache-2.0

import GenscaleApp from "./genscale-app";

type PageProps = {
  searchParams?: Promise<{
    settings?: string | string[];
  }>;
};

export default async function Home({ searchParams }: PageProps) {
  const query = await searchParams;
  const settings =
    typeof query?.settings === "string" ? query.settings : undefined;

  return <GenscaleApp initialSettingsText={settings} locale="en" />;
}
