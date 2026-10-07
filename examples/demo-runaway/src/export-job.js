import { isActive } from "./control.js";
import { reserveWorkUnits } from "./quota.js";

const RETRY_LIMIT = 3;
const NEXT_ALARM_MS = 30_000;
const MAX_INPUT_BYTES = 4096;
const INPUT_KEY = "reports/DEMO_INPUT.json";
const RESULT_KEY = "reports/DEMO_RESULT.json";

export class ReportJob {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
  }

  async fetch(request) {
    const path = new URL(request.url).pathname;
    if (request.method === "GET" && path === "/status") {
      const job = await this.ctx.storage.get("job");
      const enabled = (await this.ctx.storage.get("enabled")) === true;
      return Response.json({ phase: enabled ? (job?.phase ?? "idle") : (job?.phase === "complete" ? "complete" : "paused") });
    }
    if (request.method === "POST" && path === "/pause") {
      await this.ctx.storage.transaction(async (storage) => {
        await storage.put("enabled", false);
        await storage.deleteAlarm();
      });
      return Response.json({ phase: "paused" });
    }
    if (request.method === "POST" && path === "/start") {
      if (!(await isActive(this.env))) return new Response("Paused", { status: 503 });
      await this.ctx.storage.transaction(async (storage) => {
        const current = await storage.get("job");
        if ((await storage.get("enabled")) === true && current?.phase === "running") return;
        await storage.put("enabled", true);
        await storage.put("job", { root: "DEMO_REPORT_ROOT", phase: "running", retries: 0 });
        await storage.setAlarm(Date.now() + NEXT_ALARM_MS);
      });
      return Response.json({ phase: "running" });
    }
    return new Response("Not found", { status: 404 });
  }

  async mayWork() {
    return (await this.ctx.storage.get("enabled")) === true && await isActive(this.env);
  }

  async scheduleNext(job) {
    if (!(await this.mayWork())) return;
    await this.ctx.storage.transaction(async (storage) => {
      if ((await storage.get("enabled")) !== true) return;
      await storage.put("job", { ...job, retries: 0 });
      await storage.setAlarm(Date.now() + NEXT_ALARM_MS);
    });
  }

  async alarm() {
    const job = await this.ctx.storage.get("job");
    if (!job || job.phase !== "running" || !(await this.mayWork())) return;
    try {
      if (!(await reserveWorkUnits(this.env, 2))) {
        await this.ctx.storage.put("job", { ...job, phase: "quota-held" });
        return;
      }
      const input = await this.env.ARTIFACTS.get(INPUT_KEY);
      if (!input) throw new Error("Report input is not available");
      if (input.size > MAX_INPUT_BYTES) {
        await this.ctx.storage.put("job", { ...job, phase: "failed" });
        return;
      }
      const text = await input.text();
      if (!(await this.mayWork())) return;
      await this.env.ARTIFACTS.put(RESULT_KEY, JSON.stringify({ root: job.root, summary: text.slice(0, 128) }));
      await this.ctx.storage.put("job", { ...job, phase: "complete" });
    } catch {
      const next = { ...job, retries: job.retries + 1 };
      if (next.retries >= RETRY_LIMIT) {
        await this.ctx.storage.put("job", { ...next, phase: "failed" });
        return;
      }
      await this.scheduleNext(next);
    }
  }
}
