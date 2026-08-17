import { describe, it, expect } from "vitest";
import { ipSubnetCalculator, ipSubnetSchema } from "./ip-subnet";

function calc(input: Record<string, string>) {
  return ipSubnetCalculator.calculate(ipSubnetSchema.parse(input) as never);
}

describe("ip subnet calculator", () => {
  it("computes a standard /24 subnet", () => {
    const result = calc({ ipAddress: "192.168.1.10", cidr: "24" });
    expect(result.primary.value).toBe("192.168.1.0");
    const mask = result.secondary.find((s) => s.key === "subnetMask");
    expect(mask!.value).toBe("255.255.255.0");
    const broadcast = result.secondary.find((s) => s.key === "broadcast");
    expect(broadcast!.value).toBe("192.168.1.255");
    const usable = result.secondary.find((s) => s.key === "usableHosts");
    expect(usable!.value).toBe(254);
  });

  it("rejects an invalid IP address", () => {
    expect(() => ipSubnetSchema.parse({ ipAddress: "999.1.1.1", cidr: "24" })).toThrow();
  });
});
