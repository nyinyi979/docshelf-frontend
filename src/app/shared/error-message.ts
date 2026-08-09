import { HttpErrorResponse } from '@angular/common/http';

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof HttpErrorResponse) {
    return error.error?.message || error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}
