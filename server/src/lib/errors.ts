// Errors the API answers with on purpose. Anything else is a 500 (see middleware/error.ts).
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly fields: Record<string, string> = {},
  ) {
    super(message);
  }
}

export const badRequest = (message: string, fields?: Record<string, string>) => new HttpError(400, message, fields);
export const unauthorized = (message = "Log in to continue.") => new HttpError(401, message);
export const forbidden = (message = "You do not have access to this.") => new HttpError(403, message);
export const notFound = (what = "Item") => new HttpError(404, `${what} not found.`);
export const conflict = (message: string) => new HttpError(409, message);
