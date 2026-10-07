import { controlStub, reportStub, callBinding, isActive, pauseApplication, readApplicationState } from "./control.js";
import { reserveWorkUnits } from "./quota.js";
import { consumeObjectEvents } from "./r2-consumer.js";
export { ProjectControl } from "./control.js";
export { ReportJob } from "./export-job.js";

function authorized(request, secret) {
  // No supplied placeholder can become a usable demo password.
  return typeof secret === "string" && secret.length >= 24 && !secret.startsWith("DEMO_") &&
    request.headers.get("Authorization") === `Bearer ${secret}`;
}

function json(value, status = 200) {
  return Response.json(value, { status, headers: { "Cache-Control": "no-store" } });
}

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (!path.startsWith("/api/") && !path.startsWith("/ops/")) return env.ASSETS.fetch(request);
    const secret = path.startsWith("/ops/") ? env.OPS_BEARER : env.APP_BEARER;
    if (!authorized(request, secret)) return json({ error: "Unauthorized" }, 401);
    try {
      if (request.method === "GET" && path === "/api/status") {
        return json(await callBinding(reportStub(env), "/status"));
      }
      if (request.method === "POST" && path === "/api/start") {
        if (!(await isActive(env))) return json({ error: "Paused" }, 503);
        return json(await callBinding(reportStub(env), "/start", "POST"), 202);
      }
      if (request.method === "GET" && path === "/ops/state") return json(await readApplicationState(env));
      if (request.method === "POST" && path === "/ops/pause") return json(await pauseApplication(env));
      if (request.method === "POST" && path === "/ops/resume") {
        await callBinding(controlStub(env), "/resume", "POST");
        return json(await readApplicationState(env));
      }
      return json({ error: "Not found" }, 404);
    } catch {
      return json({ error: "Operation unavailable" }, 503);
    }
  },

  async scheduled(_event, env) {
    if (!(await isActive(env)) || !(await reserveWorkUnits(env, 1))) return;
    // Fixed object identity and payload; this is a bounded producer invocation.
    if (!(await isActive(env))) return;
    await env.ARTIFACTS.put("incoming/DEMO_INPUT.json", '{"value":"synthetic input"}');
  },

  async queue(batch, env) {
    await consumeObjectEvents(batch, env);
  },
};
