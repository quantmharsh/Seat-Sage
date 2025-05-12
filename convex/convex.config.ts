// convex/convex.config.ts
import { defineApp } from "convex/server";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";
//defining all configurations for  convex
//using ratelimiter for stopping spamming while ticket booking from single source
const app = defineApp();
app.use(rateLimiter);

export default app;
