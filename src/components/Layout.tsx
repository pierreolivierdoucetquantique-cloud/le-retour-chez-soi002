import type { ReactNode } from "react";
import Nav from "./Nav";
import Footer from "./Footer";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="font-body">
      <Nav />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
