import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { api } from "../../lib/api";
import type { ApiContactMessage } from "../../lib/types";
import { formatDateLong } from "../../lib/format";

export default function DashboardMessages() {
  const [messages, setMessages] = useState<ApiContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ messages: ApiContactMessage[] }>("/messages")
      .then((res) => setMessages(res.messages))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <h2 className="text-xl text-wood-deep mb-4">Mes messages</h2>
      <p className="text-sm text-stone-light mb-6">
        Historique des messages envoyés via notre formulaire de contact.
      </p>

      {isLoading && <p className="text-stone-light">Chargement...</p>}

      {!isLoading && messages.length === 0 && (
        <p className="text-stone-light">
          Vous n'avez envoyé aucun message pour le moment.{" "}
          <a href="/contact" className="text-sage-deep underline">
            Nous écrire
          </a>
          .
        </p>
      )}

      {messages.length > 0 && (
        <div className="divide-y divide-stone/10 rounded-2xl border border-stone/10 overflow-hidden">
          {messages.map((m) => (
            <div key={m.id} className="p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-wood-deep">{m.subject}</p>
                <p className="text-xs text-stone-light whitespace-nowrap">{formatDateLong(m.createdAt)}</p>
              </div>
              <p className="text-sm text-stone mt-1.5 whitespace-pre-line">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
