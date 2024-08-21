import chroma from "chroma-js";
import { Unit } from "./progress";

export type FileMetricData = {
  description: string;
  value: (unit: Unit) => number;
  percentage?: (unit: Unit, units: Unit[]) => number;
  gradient: chroma.Scale;
};

export enum FileMetric {
  FuzzyPercent = "fuzzy",
  MatchedPercent = "matched-percent",
  MatchedCode = "matched",
  AvgFunctionSize = "avgFnSize",
  CodeSize = "size",
  FunctionCount = "total-functions",
  Complete = "complete",
  TotalData = "total-data",
  MatchedDataPercent = "matched-data-percent",
}

// const sum = (arr: number[]) => arr.reduce((acc, curr) => acc + curr, 0);
const max = (arr: number[]) => Math.max(...arr);

export const metricData: Record<FileMetric, FileMetricData> = {
  [FileMetric.FuzzyPercent]: {
    description: "Fuzzy Match %",
    value: (unit) => unit.measures.fuzzy_match_percent,
    gradient: chroma.scale(["bf3030", "30bf30"]),
  },
  [FileMetric.MatchedPercent]: {
    description: "Perfect Match %",
    value: (unit) =>
      unit.measures.total_code ? (unit.measures.matched_code / unit.measures.total_code) * 100 : 100,
    gradient: chroma.scale(["bf3030", "30bf30"]),
  },
  [FileMetric.MatchedCode]: {
    description: "Perfect Match Size",
    value: (unit) => unit.measures.matched_code,
    percentage: (unit, units) =>
      (unit.measures.matched_code / max(units.flatMap((x) => x.measures.matched_code))) * 100,
    gradient: chroma.scale(["lightgray", "darkgreen"]),
  },
  [FileMetric.CodeSize]: {
    description: "Code Size",
    value: (unit) => unit.measures.total_code,
    percentage: (unit, units) =>
      (unit.measures.total_code / max(units.flatMap((x) => x.measures.total_code))) * 100,
    gradient: chroma.scale(["pink", "darkblue"]),
  },
  [FileMetric.AvgFunctionSize]: {
    description: "Average Function Size",
    value: (unit) =>
      unit.measures.total_functions
        ? Math.floor(unit.measures.total_code / unit.measures.total_functions)
        : 0,
    percentage: (unit, units) =>
      // yeah, this is kind of ugly, but we have to keep from dividing against 0
      unit.measures.total_functions
        ? (unit.measures.total_code /
            unit.measures.total_functions /
            max(
              units.flatMap((x) =>
                x.measures.total_functions ? x.measures.total_code / x.measures.total_functions : 0
              )
            )) *
          100
        : 0,

    gradient: chroma.scale(["yellow", "darkblue"]),
  },
  [FileMetric.FunctionCount]: {
    description: "Function Count",
    value: (unit) => unit.functions.length,
    percentage: (unit, units) =>
      (unit.functions.length / max(units.flatMap((x) => x.functions.length))) *
      100,
    gradient: chroma.scale(["pink", "black"]),
  },
  [FileMetric.TotalData]: {
    description: "Total Data",
    value: (unit) => unit.measures.total_data,
    percentage: (unit, units) =>
      (unit.measures.total_data / max(units.flatMap((x) => x.measures.total_data))) * 100,
    gradient: chroma.scale(["lightgray", "maroon"]),
  },
  [FileMetric.MatchedDataPercent]: {
    description: "Matched Data %",
    value: (unit) =>
      unit.measures.total_data ? (unit.measures.matched_data / unit.measures.total_data) * 100 : 100,
    gradient: chroma.scale(["lightgray", "maroon"]),
  },
  [FileMetric.Complete]: {
    description: "Linked",
    value: (unit) => (unit.metadata.complete ? 100 : 0),
    gradient: chroma.scale(["bf3030", "30bf30"]),
  },
};
