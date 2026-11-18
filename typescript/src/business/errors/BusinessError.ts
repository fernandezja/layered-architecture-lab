import type { BusinessErrorKind } from "./BusinessErrorKind.js";

export class BusinessError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly kind: BusinessErrorKind,
  ) {
    super(message);
    this.name = "BusinessError";
  }
}
