import { Wifi } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField, selectField } from "../validation";

const SIZE_UNITS = ["MB", "GB", "TB"] as const;
const SIZE_TO_BITS: Record<(typeof SIZE_UNITS)[number], number> = { MB: 8e6, GB: 8e9, TB: 8e12 };

const SPEED_UNITS = ["Mbps", "Gbps"] as const;
const SPEED_TO_BPS: Record<(typeof SPEED_UNITS)[number], number> = { Mbps: 1e6, Gbps: 1e9 };

export const bandwidthSchema = z.object({
  fileSize: numberField({ label: "File size", min: 0.001, max: 1_000_000 }),
  sizeUnit: selectField(SIZE_UNITS, "Size unit"),
  connectionSpeed: numberField({ label: "Connection speed", min: 0.001, max: 1_000_000 }),
  speedUnit: selectField(SPEED_UNITS, "Speed unit"),
});

export type BandwidthValues = z.infer<typeof bandwidthSchema>;

function calculate(values: BandwidthValues): CalcResult {
  const totalBits = values.fileSize * SIZE_TO_BITS[values.sizeUnit];
  const bps = values.connectionSpeed * SPEED_TO_BPS[values.speedUnit];
  const seconds = totalBits / bps;

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);

  return {
    primary: { key: "time", label: "Estimated transfer time", value: `${h > 0 ? `${h}h ` : ""}${m}m ${s}s`, format: "text" },
    secondary: [{ key: "totalSeconds", label: "Total seconds", value: Math.round(seconds * 10) / 10, format: "number" }],
    notes: ["Real-world speeds are usually lower than the rated connection speed due to network overhead, so actual transfer time may be somewhat longer."],
  };
}

export const bandwidthCalculator: CalculatorDef = {
  id: "bandwidth",
  slug: "bandwidth",
  title: "Bandwidth Calculator",
  description: "Estimate file transfer or download time based on file size and connection speed.",
  category: "other",
  icon: Wifi,
  keywords: ["bandwidth calculator", "download time", "file transfer time", "internet speed"],
  inputs: [
    { name: "fileSize", label: "File size", kind: "number", defaultValue: "", step: 0.01, required: true },
    {
      name: "sizeUnit", label: "Size unit", kind: "select", defaultValue: "GB",
      options: SIZE_UNITS.map((u) => ({ value: u, label: u })),
    },
    { name: "connectionSpeed", label: "Connection speed", kind: "number", defaultValue: "", step: 0.01, required: true },
    {
      name: "speedUnit", label: "Speed unit", kind: "select", defaultValue: "Mbps",
      options: SPEED_UNITS.map((u) => ({ value: u, label: u })),
    },
  ],
  schema: bandwidthSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Time = File size (bits) ÷ Connection speed (bits per second). Note: file sizes are in bytes (×8 for bits), connection speeds are already in bits.",
  explanation: [
    {
      heading: "Bits vs. bytes — a common mix-up",
      body: "Internet speeds are quoted in megabits per second (Mbps), while file sizes are quoted in megabytes (MB) — 1 byte = 8 bits, which is why file size in MB needs multiplying by 8 to compare against a Mbps connection speed.",
    },
  ],
  faq: [
    { q: "Why did my actual download take longer?", a: "Rated connection speeds are theoretical maximums — real throughput is reduced by network congestion, server limits, and protocol overhead." },
  ],
  related: ["unit-converter"],
};
