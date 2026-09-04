export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export type LoreIssue = {
  entity: string;
  slug?: string;
  field?: string;
  message: string;
};

export class LoreValidationError extends HttpError {
  constructor(public readonly errors: LoreIssue[], public readonly warnings: LoreIssue[] = []) {
    super(400, "Dane lore są niespójne.", { errors, warnings });
  }
}
