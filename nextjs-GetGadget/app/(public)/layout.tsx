import Footer from "./components/Footer";
import Header from "./components/Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />

      <main className="flex-1 w-full">
        {children}
      </main>

      <Footer />
    </section>
  );
}
