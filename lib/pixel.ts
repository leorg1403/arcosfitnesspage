declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fbq: (...args: any[]) => void;
  }
}

function track(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.fbq === "undefined") return;
  window.fbq("track", event, params);
}

export const pixel = {
  lead: () => track("Lead"),
  viewContent: (name: string) => track("ViewContent", { content_name: name }),
  selectDate: (name: string) => {
    if (typeof window === "undefined" || typeof window.fbq === "undefined") return;
    window.fbq("trackCustom", "SelectDate", { content_name: name });
  },
  completeRegistration: () => track("CompleteRegistration"),
  initiateCheckout: () => track("InitiateCheckout"),
  schedule: () => track("Schedule"),
  purchase: (value: number, currency = "MXN") =>
    track("Purchase", { value, currency }),
};
