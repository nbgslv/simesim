import { ErrorWithMessage } from './types';

const isErrorWithMessage = (error: unknown): error is ErrorWithMessage =>
  typeof error === 'object' &&
  error !== null &&
  'message' in error &&
  typeof (error as Record<string, unknown>).message === 'string';

const toErrorWithMessage = (maybeError: unknown): Error => {
  if (isErrorWithMessage(maybeError)) return maybeError as Error;

  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example.
    return new Error(String(maybeError));
  }
};

// eslint-disable-next-line import/prefer-default-export
export const getErrorMessage = (error: unknown) => toErrorWithMessage(error);
