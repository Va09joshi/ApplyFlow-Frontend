import { useEffect } from "react";
import { toast } from "sonner"; // Assuming sonner is used for toasts based on ui/sonner.tsx

export function useSSE() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // You can't natively pass Authorization headers in EventSource
    // Alternative 1: Pass token in URL (less secure but works for SSE)
    // Alternative 2: Use fetch with readable stream (more complex)
    // Assuming backend handles token in URL for SSE:
    const eventSource = new EventSource(`/api/v1/events/stream?token=${token}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'NEW_EMAIL') {
          toast.info(`New Email: ${data.payload.subject}`, {
            description: `From: ${data.payload.from}`
          });
          // Dispatch event or update global store if needed
          window.dispatchEvent(new CustomEvent('new_email', { detail: data.payload }));
        } else if (data.type === 'AUTOMATION_RUN') {
          toast.success(`Automation Executed`, {
            description: `${data.payload.name} ran successfully.`
          });
        }
      } catch (e) {
        console.error("Failed to parse SSE message", e);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);
}
