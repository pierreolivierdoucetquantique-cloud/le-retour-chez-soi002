import { createApp } from "./app";
import { env } from "./config/env";
import { startScheduler } from "./services/scheduler";

const app = createApp();

app.listen(env.port, () => {
  console.log(`API « Le Retour Chez Soi » démarrée sur http://localhost:${env.port}`);
  console.log(`Environnement : ${env.nodeEnv}`);
  startScheduler();
});
