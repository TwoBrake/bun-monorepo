/** A base app error. */
abstract class ApplicationError extends Error {
  /** The code of the error. */
  public abstract readonly code: string;

  /**
   * @param message The message of the error.
   */
  protected constructor(message: string) {
    super(message);
    this.name = "ApplicationError";
  }
}

/** An error representing a not-found state. */
export class NotFoundError extends ApplicationError {
  public readonly code = "NOT_FOUND";

  /**
   * @param resource The resource/target that wasn't found.
   */
  public constructor(resource: string) {
    super(`${resource} was not found.`);
    this.name = "NotFoundError";
  }
}

/** An error representing something that went wrong internally, something that wasn't expected. */
export class InternalError extends ApplicationError {
  public readonly code = "INTERNAL_ERROR";

  /**
   * @param note A note for the error.
   */
  public constructor(note?: string) {
    super(`Something went wrong internally: ${note ?? "N/A"}`);
    this.name = "InternalError";
  }
}
