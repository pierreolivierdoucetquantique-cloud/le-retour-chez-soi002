import { useEffect, useState } from "react";
import { useParams, Link, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Calendar as CalendarIcon } from "lucide-react";
import Layout from "../components/Layout";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { ApiService, ApiTestimonial } from "../lib/types";
import { formatDurationMinutes, formatPriceCents, formatTime } from "../lib/format";

function nextDays(count: number): Date[] {
  const days: Date[] = [];
  const cursor = new Date();
  while (days.length < count) {
    cursor.setDate(cursor.getDate() + 1);
    days.push(new Date(cursor));
  }
  return days;
}

export default function ServiceDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [service, setService] = useState<ApiService | null>(null);
  const [related, setRelated] = useState<ApiService[]>([]);
  const [testimonials, setTestimonials] = useState<ApiTestimonial[]>([]);
  const [notFound, setNotFound] = useState(false);

  const [days] = useState(() => nextDays(6));
  const [selectedDay, setSelectedDay] = useState(0);
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingDone, setBookingDone] = useState(false);

  useEffect(() => {
    if (!slug) return;
    api
      .get<{ service: ApiService; related: ApiService[] }>(`/services/${slug}`)
      .then((res) => {
        setService(res.service);
        setRelated(res.related);
      })
      .catch(() => setNotFound(true));

    api
      .get<{ testimonials: ApiTestimonial[] }>("/testimonials")
      .then((res) => setTestimonials(res.testimonials.slice(0, 2)))
      .catch(() => {});
  }, [slug]);

  useEffect(() => {
    if (!service) return;
    const date = days[selectedDay].toISOString().slice(0, 10);
    setSlotsLoading(true);
    setSelectedSlot(null);
    api
      .get<{ slots: string[] }>(`/appointments/availability?serviceId=${service.id}&date=${date}`)
      .then((res) => setSlots(res.slots))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [service, selectedDay, days]);

  if (notFound) return <Navigate to="/services" replace />;
  if (!service) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center text-stone-light pt-32">
          Chargement...
        </div>
      </Layout>
    );
  }

  const handleBook = async () => {
    if (!user) {
      navigate("/connexion");
      return;
    }
    if (!selectedSlot) return;
    setBooking(true);
    setBookingError(null);
    try {
      await api.post("/appointments", { serviceId: service.id, startsAt: selectedSlot });
      setBookingDone(true);
    } catch (err) {
      setBookingError(
        err instanceof ApiError ? err.message : "Impossible de réserver ce créneau pour le moment."
      );
    } finally {
      setBooking(false);
    }
  };

  return (
    <Layout>
      <section className="bg-beige pt-40 pb-16 md:pt-48 md:pb-20">
        <div className="max-w-4xl mx-auto px-6 md:px-10">
          <Link
            to="/services"
            className="font-label text-sm uppercase tracking-[0.1em] text-stone hover:text-sage-deep transition-colors"
          >
            ← Tous les services
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="label-eyebrow text-sage-deep block mt-6">
              {formatDurationMinutes(service.durationMinutes)} · {formatPriceCents(service.priceCents)}
            </span>
            <h1 className="mt-3 text-4xl md:text-5xl">{service.title}</h1>
            <p className="mt-5 max-w-2xl text-stone leading-relaxed text-lg">
              {service.description}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-6 md:px-10 grid md:grid-cols-[1.1fr_0.9fr] gap-16">
          <div>
            <div className="aspect-video rounded-2xl bg-sand mb-10" />

            <h2 className="text-2xl text-wood-deep">Déroulement</h2>
            <p className="mt-4 text-stone leading-relaxed">{service.longDescription}</p>

            {service.includes.length > 0 && (
              <>
                <h2 className="mt-12 text-2xl text-wood-deep">Ce qui est inclus</h2>
                <ul className="mt-4 space-y-3">
                  {service.includes.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-stone">
                      <Check size={18} className="text-sage-deep mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <h2 className="mt-12 text-2xl text-wood-deep">Questions fréquentes</h2>
            <p className="mt-4 text-stone leading-relaxed">
              Vous avez une question avant de réserver ?{" "}
              <Link to="/faq" className="text-sage-deep underline underline-offset-2">
                Consultez la FAQ
              </Link>{" "}
              ou{" "}
              <Link to="/contact" className="text-sage-deep underline underline-offset-2">
                contactez-nous directement
              </Link>
              .
            </p>

            {testimonials.length > 0 && (
              <>
                <h2 className="mt-12 text-2xl text-wood-deep mb-6">Témoignages</h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  {testimonials.map((t) => (
                    <blockquote key={t.id} className="rounded-2xl bg-sand/40 p-6">
                      <p className="font-display italic text-wood-deep leading-relaxed">
                        « {t.quote} »
                      </p>
                      <cite className="mt-4 block not-italic font-label text-sm uppercase tracking-[0.08em] text-stone">
                        {t.name}
                      </cite>
                    </blockquote>
                  ))}
                </div>
              </>
            )}
          </div>

          <aside className="md:sticky md:top-28 h-fit">
            <div className="rounded-2xl glass bg-panel border border-warmwhite/10 p-7">
              {bookingDone ? (
                <div className="text-center py-6">
                  <p className="text-xl font-display text-wood-deep">Rendez-vous demandé</p>
                  <p className="mt-2 text-sm text-stone">
                    Vous recevrez une confirmation par courriel. Vous pouvez le gérer depuis
                    votre{" "}
                    <Link to="/tableau-de-bord" className="text-sage-deep underline">
                      tableau de bord
                    </Link>
                    .
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-sage-deep">
                    <CalendarIcon size={18} />
                    <span className="label-eyebrow">Choisir un créneau</span>
                  </div>

                  <div className="mt-5 grid grid-cols-6 gap-1.5">
                    {days.map((d, i) => (
                      <button
                        key={d.toISOString()}
                        onClick={() => setSelectedDay(i)}
                        className={`rounded-lg py-2 text-[0.7rem] font-label transition-colors ${
                          selectedDay === i
                            ? "bg-sage-deep text-warmwhite"
                            : "bg-beige text-stone hover:bg-sand"
                        }`}
                      >
                        {d.toLocaleDateString("fr-CA", { weekday: "short", day: "numeric" })}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-col gap-2 min-h-[120px]">
                    {slotsLoading && (
                      <p className="text-sm text-stone-light py-4 text-center">
                        Chargement des disponibilités...
                      </p>
                    )}
                    {!slotsLoading && slots.length === 0 && (
                      <p className="text-sm text-stone-light py-4 text-center">
                        Aucun créneau disponible ce jour-là.
                      </p>
                    )}
                    {!slotsLoading &&
                      slots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`rounded-lg border py-2.5 text-sm font-label transition-colors ${
                            selectedSlot === slot
                              ? "border-sage-deep bg-sage-deep/10 text-sage-deep"
                              : "border-stone/15 text-stone hover:border-sage-deep/40"
                          }`}
                        >
                          {formatTime(slot)}
                        </button>
                      ))}
                  </div>

                  <p className="mt-3 text-xs text-stone-light">
                    Fuseau horaire : Amérique/Toronto (HAE)
                  </p>

                  {bookingError && (
                    <p className="mt-3 text-sm text-wood-deep">{bookingError}</p>
                  )}

                  <button
                    disabled={!selectedSlot || booking}
                    onClick={handleBook}
                    className="mt-6 w-full rounded-full bg-sage-deep text-warmwhite py-3.5 font-label text-sm uppercase tracking-[0.1em] hover:bg-wood transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {booking
                      ? "Réservation..."
                      : user
                        ? `Réserver et payer — ${formatPriceCents(service.priceCents)}`
                        : "Se connecter pour réserver"}
                  </button>
                  <p className="mt-3 text-xs text-center text-stone-light">
                    Paiement sécurisé par Stripe ou Interac
                  </p>
                </>
              )}
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-beige py-20 md:py-24">
          <div className="max-w-6xl mx-auto px-6 md:px-10">
            <span className="label-eyebrow text-sage-deep">Services complémentaires</span>
            <div className="mt-6 grid md:grid-cols-2 gap-6">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to={`/services/${r.slug}`}
                  className="rounded-2xl glass bg-panel border border-warmwhite/10 hover:border-sage-deep/50 transition-colors"
                >
                  <span className="label-eyebrow text-gold">
                    {formatDurationMinutes(r.durationMinutes)}
                  </span>
                  <h3 className="mt-2 text-xl text-wood-deep">{r.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}
