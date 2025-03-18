export function handleError(error: unknown): { error: string } {
  if (error instanceof Error) {
    return { error: error.message };
  }
  return { error: 'An unexpected error occurred' };
}
