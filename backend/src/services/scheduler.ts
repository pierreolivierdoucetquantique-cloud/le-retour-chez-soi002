import cron from "node-cron";
import { sendDueReminders } from "./reminder.service";

let started = false;

/**
 * Démarre les tâches planifiées de l'application. Actuellement : la
 * vérification des rappels de rendez-vous, toutes les 15 minutes.
 * Idempotent — un second appel n'installe pas de tâche en double.
 */
export function startScheduler() {
  if (started) return;
  started = true;

  cron.schedule("*/15 * * * *", () => {
    sendDueReminders().catch((err) => {
      console.error("Erreur inattendue dans la tâche de rappel :", err);
    });
  });

  console.log("Planificateur démarré (rappels de rendez-vous : toutes les 15 minutes).");
}
