import { isActive } from "./control.js";
import { reserveWorkUnits } from "./quota.js";

const INPUT_KEYS = new Set(["incoming/DEMO_INPUT.json", "incoming/DEMO_RESULT.json"]);
const RESULT_KEY = "incoming/DEMO_RESULT.json";
const MAX_INPUT_BYTES = 4096;
const CREATE_ACTIONS = new Set(["PutObject", "CopyObject", "CompleteMultipartUpload"]);

export async function consumeObjectEvents(batch, env) {
  for (const message of batch.messages) {
    const event = message.body;
    if (event?.account !== "DEMO_ACCOUNT_ID_DO_NOT_USE" || event?.bucket !== env.R2_BUCKET_NAME ||
        !CREATE_ACTIONS.has(event?.action) || !INPUT_KEYS.has(event?.object?.key) ||
        typeof event?.object?.eTag !== "string" || event.object.eTag.length > 128) {
      message.ack();
      continue;
    }
    try {
      if (!(await isActive(env))) {
        message.retry({ delaySeconds: 300 });
        continue;
      }
      if (!(await reserveWorkUnits(env, 2))) {
        message.retry({ delaySeconds: 300 });
        continue;
      }
      const input = await env.ARTIFACTS.get(event.object.key);
      if (!input || input.size > MAX_INPUT_BYTES) {
        message.ack();
        continue;
      }
      const contents = await input.text();
      if (!(await isActive(env))) {
        message.retry({ delaySeconds: 300 });
        continue;
      }
      await env.ARTIFACTS.put(RESULT_KEY, JSON.stringify({
        sourceVersion: event.object.eTag,
        summary: contents.slice(0, 64),
      }));
      message.ack();
    } catch {
      message.retry({ delaySeconds: 30 });
    }
  }
}
