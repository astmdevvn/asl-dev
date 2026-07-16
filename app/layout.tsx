import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ASL Dev — A quiet corner on the web",
  description: "Những sản phẩm nhỏ, hữu ích và được làm bằng sự tò mò.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
