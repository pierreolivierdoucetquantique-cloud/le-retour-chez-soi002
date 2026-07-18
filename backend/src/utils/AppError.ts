export class AppError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "AppError";
  }
}

export const Errors = {
  badRequest: (msg = "Requête invalide") => new AppError(400, msg),
  unauthorized: (msg = "Authentification requise") => new AppError(401, msg),
  forbidden: (msg = "Accès refusé") => new AppError(403, msg),
  notFound: (msg = "Ressource introuvable") => new AppError(404, msg),
  conflict: (msg = "Conflit avec une ressource existante") =>
    new AppError(409, msg),
};
