import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { api } from "../lib/api";
import type { ApiEvent } from "../lib/types";
import { formatDateLong } from "../lib/format";

export default function Events() {
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ events: ApiEvent[] }>("/events")
      .then((res) => setEvents(res.events))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <Layout>
      <PageHeader
        eyebrow="Agenda"
        title="Événements à venir"
        description="Cercles, ateliers et retraites — en présentiel à Québec ou en ligne."
      />

      <section className="py-24 md:py-28">
        <div className="max-w-4xl mx-auto px-6 md:px-10">
          {isLoading && <p className="text-stone-light">Chargement...</p>}
          {!isLoading && events.length === 0 && (
            <p className="text-stone-light">Aucun événement à venir pour le moment.</p>
          )}
          <div className="divide-y divide-stone/10">
            {events.map((e, i) => (
              <motion.a
                key={e.id}
                href={`/evenements/${e.id}`}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="group flex flex-col md:flex-row md:items-center justify-between gap-2 py-7 first:pt-0"
              >
                <div>
                  <h2 className="text-2xl text-wood-deep group-hover:text-sage-deep transition-colors">
                    {e.title}
                  </h2>
                  <p className="text-stone-light text-sm mt-1">{e.location}</p>
                </div>
                <span className="font-label text-sm uppercase tracking-[0.1em] text-stone shrink-0">
                  {formatDateLong(e.startsAt)}
                </span>
              </motion.a>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
