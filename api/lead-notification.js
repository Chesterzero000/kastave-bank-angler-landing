import { handleLeadNotification } from "./leadNotificationCore.js";

export default {
  async fetch(request) {
    try {
      const result = await handleLeadNotification({
        request,
        env: process.env,
        fetchFn: fetch,
      });

      return Response.json(result.body, {
        status: result.statusCode,
        headers: result.headers || {},
      });
    } catch (error) {
      return Response.json(
        {
          ok: false,
          error: "lead_notification_handler_failed",
          detail: error instanceof Error ? error.message : "unknown_error",
        },
        { status: 500 },
      );
    }
  },
};
