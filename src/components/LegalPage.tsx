import Layout from "./Layout";
import PageHeader from "./PageHeader";

export default function LegalPage({
  eyebrow,
  title,
  updated,
  sections,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  sections: { heading: string; body: string }[];
}) {
  return (
    <Layout>
      <PageHeader eyebrow={eyebrow} title={title} />
      <section className="py-20 md:py-24">
        <div className="max-w-2xl mx-auto px-6 md:px-10">
          <p className="text-sm text-stone-light">
            Dernière mise à jour : {updated}
          </p>
          <div className="mt-10 space-y-10">
            {sections.map((s) => (
              <div key={s.heading}>
                <h2 className="text-xl text-wood-deep">{s.heading}</h2>
                <p className="mt-3 text-stone leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
