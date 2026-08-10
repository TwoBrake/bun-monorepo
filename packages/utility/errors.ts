/** A base app error. */
abstract class ApplicationError extends Error {
  /** The code of the error. */
  public abstract readonly code: string;

  /**
   * @param message The message of the error.
   */
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** An error representing a not-found state. */
export class NotFoundError extends ApplicationError {
  public readonly code = "NOT_FOUND";

  /**
   * @param resource The resource/target that wasn't found.
   */
  constructor(resource: string) {
    super(`${resource} was not found.`);
  }
}
