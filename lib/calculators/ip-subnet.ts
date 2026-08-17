import { Network } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";

const IP_RE = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

export const ipSubnetSchema = z
  .object({
    ipAddress: z.string().trim().regex(IP_RE, "Enter a valid IPv4 address (e.g. 192.168.1.10)"),
    cidr: numberField({ label: "CIDR prefix", min: 0, max: 32, integer: true }),
  })
  .superRefine((data, ctx) => {
    const octets = data.ipAddress.split(".").map(Number);
    if (octets.some((o) => o > 255)) {
      ctx.addIssue({ code: "custom", path: ["ipAddress"], message: "Each octet must be 0-255" });
    }
  });

export type IpSubnetValues = z.infer<typeof ipSubnetSchema>;

function ipToInt(ip: string): number {
  return ip.split(".").reduce((acc, octet) => acc * 256 + Number(octet), 0) >>> 0;
}

function intToIp(int: number): string {
  return [(int >>> 24) & 255, (int >>> 16) & 255, (int >>> 8) & 255, int & 255].join(".");
}

function calculate(values: IpSubnetValues): CalcResult {
  const ipInt = ipToInt(values.ipAddress);
  const maskInt = values.cidr === 0 ? 0 : (0xffffffff << (32 - values.cidr)) >>> 0;
  const networkInt = (ipInt & maskInt) >>> 0;
  const broadcastInt = (networkInt | (~maskInt >>> 0)) >>> 0;

  const totalAddresses = Math.pow(2, 32 - values.cidr);
  const usableHosts = values.cidr >= 31 ? 0 : totalAddresses - 2;

  return {
    primary: { key: "network", label: "Network address", value: intToIp(networkInt), format: "text" },
    secondary: [
      { key: "subnetMask", label: "Subnet mask", value: intToIp(maskInt), format: "text" },
      { key: "broadcast", label: "Broadcast address", value: intToIp(broadcastInt), format: "text" },
      { key: "firstHost", label: "First usable host", value: usableHosts > 0 ? intToIp(networkInt + 1) : "N/A", format: "text" },
      { key: "lastHost", label: "Last usable host", value: usableHosts > 0 ? intToIp(broadcastInt - 1) : "N/A", format: "text" },
      { key: "usableHosts", label: "Usable hosts", value: usableHosts, format: "number" },
    ],
  };
}

export const ipSubnetCalculator: CalculatorDef = {
  id: "ip-subnet",
  slug: "ip-subnet",
  title: "IP Subnet Calculator",
  description: "Calculate network address, broadcast address, and usable host range from an IP and CIDR prefix.",
  category: "other",
  icon: Network,
  keywords: ["subnet calculator", "cidr calculator", "ip subnet", "network address"],
  inputs: [
    { name: "ipAddress", label: "IP address", kind: "text", defaultValue: "192.168.1.10", required: true },
    { name: "cidr", label: "CIDR prefix (/)", kind: "number", defaultValue: "24", min: 0, max: 32, step: 1, required: true },
  ],
  schema: ipSubnetSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Network address = IP AND subnet mask. Broadcast address = Network OR (NOT subnet mask). Usable hosts = 2^(32−prefix) − 2.",
  explanation: [
    {
      heading: "Why subtract 2 hosts",
      body: "The first address in a subnet is reserved as the network address and the last as the broadcast address, so neither can be assigned to a host (except in /31 and /32 special cases).",
    },
  ],
  faq: [
    { q: "What does /24 mean?", a: "It means the first 24 bits of the 32-bit address are the network portion — equivalent to a 255.255.255.0 subnet mask, giving 254 usable host addresses." },
  ],
  related: ["base-converter"],
};
