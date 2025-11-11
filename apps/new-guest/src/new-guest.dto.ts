import { AnalyticsGroupByUnit } from "@app/contracts/new-guest/query-analytics.dto";

export type ResolvedAnalyticsQuery = {
  finalStartDate: Date;
  finalEndDate: Date;
  finalGroupByUnit: AnalyticsGroupByUnit
}