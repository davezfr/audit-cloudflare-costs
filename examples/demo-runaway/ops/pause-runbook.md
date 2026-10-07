# Current pause procedure — SYNTHETIC, DO NOT EXECUTE

This is an operating document to inspect as evidence in the exercise. Every target
is fictional. No action below has been performed or verified. The project accepts
withholding new work when control or allowance state cannot be confirmed.

## Targets and prerequisites

Use only `DEMO_ACCOUNT_ID_DO_NOT_USE` / `DEMO_PROJECT_ID_DO_NOT_USE` and the
Worker, queue, bucket, and singleton DO bindings in `wrangler.toml`. The app's
OPS bearer secret is separate from the app-user secret. Neither is supplied.
The owner uses existing scoped operational access; an auditor needs no write key.

## Current stop sequence

1. The authorized operations owner submits `POST /ops/pause` to the fictional
   app origin `https://worker.example.invalid`. `pauseApplication()` persists the
   project admission state, disables the one report DO, and deletes its future
   alarm. Read `/ops/state`; an API response is only application-state evidence.
2. Pause native delivery for `DEMO_R2_EVENTS_QUEUE_DO_NOT_USE` using the selected
   account's queue `pause-delivery` operation. The producer's shared admission
   gate covers scheduled writes. Preserve the queue and DLQ; do not purge either.
   Already delivered messages use explicit retry decisions, and native retries
   are finite. Track retention and DLQ age before any later release.
3. For the Cron producer, comment out the `[triggers]` block and its `crons` line
   in the relevant Wrangler file, matching the current `wrangler.toml`. The
   current procedure hands that revision to the authorized release process.
4. Read back the selected account's schedule list and queue delivery state;
   inspect the singleton's disabled state and unset future alarm. Record the
   expected empty Cron list, paused delivery, and closed app admission separately
   from the actual values. This fixture supplies no readback results.
5. Correlate the action time with bounded existing counters for new R2 operations,
   report attempts, and queue deliveries. Treat unavailable or stale readings as
   unknown. Retain the stop if readback fails; use the same owner escalation path
   for uncertain outcomes. Keep the admission gate closed during propagation.

## What application pause means

Status reads and control reads remain available. One operation admitted before a
checkpoint may finish. A removed future alarm does not cancel already-running
work. Queue state, actual schedules, event notifications already in transit,
platform invocations, and storage remain separate observations. Retained R2/DO/KV
data and fixed subscription charges are not deleted or canceled by the procedure.

## Owner recovery procedure

The owner records the cause, remaining approved budget, current account state,
unknown external outcomes, and queue/DLQ age. Recovery requires an explicit human
decision. Restore only the intended resources, release queue delivery at its
configured concurrency of one, and monitor a bounded initial window. Existing
work rechecks admission units before its next R2 operations.

`POST /ops/resume` reopens only app admission; it does not restart an old report,
restore a schedule, or resume native queue delivery. Starting a report is a
separate authorized `POST /api/start`. Retain the pause record and stop again if
the root cause recurs. This is a procedure description, not evidence of a
successful recovery drill.
