export default {
  async fetch(request, env) {
    // Production review endpoint:
    // - authenticate admin
    // - retrieve pending submission
    // - show moderation metadata
    // - approve/reject
    // - write approval state to D1
    // - publish approved media to the selected entity/gallery
    return Response.json({
      ok: false,
      status: "integration_required",
      message: "Connect this Worker to D1 and the admin authentication layer."
    }, { status: 501 });
  }
};
