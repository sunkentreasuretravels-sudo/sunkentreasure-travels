export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("POST required", { status: 405 });
    }

    // Production implementation:
    // 1. Authenticate/authorize the contributor.
    // 2. Validate file type and size.
    // 3. Create a one-time direct-upload URL through the configured media provider.
    // 4. Create a D1 media_submissions record.
    // 5. Return the upload URL and submission ID.
    //
    // This scaffold deliberately does not embed secrets or publish automatically.

    return Response.json({
      ok: false,
      status: "integration_required",
      message: "Connect this Worker to Cloudflare Images/Stream and D1 before production use."
    }, { status: 501 });
  }
};
