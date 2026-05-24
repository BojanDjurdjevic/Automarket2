export type ValidationErrors =
  Record<string, string[]>;

export function getValidationErrors(
  error: any
): ValidationErrors {

  return (
    error?.response?.data?.errors || {}
  );
}

export function getErrorMessage(
  error: any
): string {

  return (
    error?.response?.data?.message ||
    'Something went wrong'
  );
}