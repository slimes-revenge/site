import { PropsWithChildren } from "react";
import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import { Container, Stack } from "@mui/material";

import { getIntl, locales } from "../../i18n";
import Providers from "../components/Providers";
import { RouterLink } from "../components/RouterLink";

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-roboto",
});

type Props = PropsWithChildren<{ params: Promise<{ lang: string }> }>;

export function generateStaticParams() {
  return locales.map(lang => ({ lang }));
}

// Only the locales above exist; any other first segment is a 404.
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const intl = getIntl((await params).lang);
  const title = intl.formatMessage({ id: "site.title" });
  return {
    title: { default: title, template: `%s | ${title}` },
    description: intl.formatMessage({ id: "site.description" }),
  };
}

export const viewport: Viewport = {
  colorScheme: "light dark",
};

export default async function RootLayout({ children, params }: Props) {
  const { lang } = await params;
  const intl = getIntl(lang);
  return (
    <html lang={lang}>
      <body className={roboto.variable}>
        <Providers>
          <Container component="nav" maxWidth="xl" sx={{ pt: 2, px: { xs: 1, sm: 2 } }}>
            <Stack direction="row" sx={{ flexWrap: "wrap", columnGap: 2 }}>
              <RouterLink href={`/${lang}`} sx={{ fontWeight: 500 }}>
                {intl.formatMessage({ id: "nav.route" })}
              </RouterLink>
              <RouterLink href={`/${lang}/bestiary`}>{intl.formatMessage({ id: "nav.bestiary" })}</RouterLink>
              <RouterLink href={`/${lang}/liquids`}>{intl.formatMessage({ id: "nav.liquids" })}</RouterLink>
              <RouterLink href={`/${lang}/sim`}>{intl.formatMessage({ id: "nav.sim" })}</RouterLink>
            </Stack>
          </Container>
          {children}
        </Providers>
      </body>
    </html>
  );
}
