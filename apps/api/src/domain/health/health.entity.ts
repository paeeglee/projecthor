export interface HealthStatus {
  status: "ok" | "degraded";
  timestamp: Date;
}
