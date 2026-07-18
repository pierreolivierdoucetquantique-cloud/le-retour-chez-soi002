import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import type { ApiEvent } from "../lib/types";
import { formatDateLong } from "../lib/format";

export default function UpcomingEvents() {
  const [events, setEvents] = useState<ApiEvent[]>([]);

  useEffect(() => {
    api
      .get<{ events: ApiEvent[] }>("/events")
      .then((res) => setEvents(res.events.slice(0, 3)))
      .catch(() => setEvents([]));
  }, []);

  if (events.length === 0) return null;

  return (
    <section className="bg-sage-deep py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <span className="label-eyebrow text-gold">Agenda</span>
        <h2 className="mt-3 text-3xl md:text-4xl text-warmwhite mb-14 max-w-xl">
          Événements à venir
        </h2>

        <div className="divide-y divide-warmwhite/15">
          {events.map((e, i) => (
            <motion.a
              key={e.id}
              href={`/evenements/${e.id}`}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group flex flex-col md:flex-row md:items-center justify-between gap-2 py-6 first:pt-0"
            >
              <div>
                <h3 className="text-xl md:text-2xl text-warmwhite group-hover:text-gold transition-colors">
                  {e.title}
                </h3>
                <p className="text-warmwhite/60 text-sm mt-1">{e.location}</p>
              </div>
              <span className="font-label text-sm uppercase tracking-[0.1em] text-warmwhite/80">
                {formatDateLong(e.startsAt)}
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
