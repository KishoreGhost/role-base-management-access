const AUTH_EXPIRED_EVENT = "finsight:auth-expired";

export function dispatchAuthExpired(message = "Your session expired. Please sign in again.") {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(AUTH_EXPIRED_EVENT, {
      detail: { message },
    }),
  );
}

export function subscribeToAuthExpired(callback: (message: string) => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<{ message?: string }>;
    callback(customEvent.detail?.message ?? "Your session expired. Please sign in again.");
  };

  window.addEventListener(AUTH_EXPIRED_EVENT, handler);
  return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handler);
}
