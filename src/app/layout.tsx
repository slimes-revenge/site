import { PropsWithChildren } from "react";
import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";

import Providers from "./components/Providers";

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: { default: "Slime's Revenge · design guard", template: "%s | Slime's Revenge" },
  description: "Which slime builds win against which enemies, from the design simulator",
};

export const viewport: Viewport = {
  colorScheme: "light dark",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body className={roboto.variable}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
