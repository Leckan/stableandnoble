import { describe, expect, it } from "vitest";
import { calculatePropertyAnalysis } from "../src/lib/property-analysis";

describe("calculatePropertyAnalysis", () => {
  it("models project cost, leverage, operating yield, cash flow, and a flip margin", () => {
    const result = calculatePropertyAnalysis({
      purchasePrice: 300_000, renovationBudget: 30_000, closingCosts: 10_000,
      monthlyRent: 3_000, monthlyExpenses: 1_000, downPaymentPercent: 25,
      annualInterestPercent: 6, estimatedResaleValue: 400_000, sellingCosts: 24_000
    });
    expect(result.projectCost).toBe(340_000);
    expect(result.equityRequired).toBe(115_000);
    expect(result.grossYieldPercent).toBeCloseTo(10.5882, 3);
    expect(result.capRatePercent).toBeCloseTo(7.0588, 3);
    expect(result.monthlyDebtService).toBeCloseTo(1_348.99, 0);
    expect(result.estimatedMonthlyCashFlow).toBeCloseTo(651.01, 0);
    expect(result.cashOnCashPercent).toBeCloseTo(6.793, 2);
    expect(result.flipMargin).toBe(36_000);
  });

  it("handles an all-cash, zero-interest scenario", () => {
    const result = calculatePropertyAnalysis({
      purchasePrice: 100_000, monthlyRent: 1_000, monthlyExpenses: 200,
      downPaymentPercent: 100, annualInterestPercent: 0
    });
    expect(result.monthlyDebtService).toBe(0);
    expect(result.estimatedMonthlyCashFlow).toBe(800);
    expect(result.equityRequired).toBe(100_000);
    expect(result.cashOnCashPercent).toBeCloseTo(9.6, 6);
    expect(result.flipMargin).toBeNull();
  });

  it("returns safe zero ratios for an empty project", () => {
    const result = calculatePropertyAnalysis({ purchasePrice: 0, monthlyRent: 0 });
    expect(result.projectCost).toBe(0);
    expect(result.grossYieldPercent).toBe(0);
    expect(result.capRatePercent).toBe(0);
    expect(result.cashOnCashPercent).toBeNull();
  });
});
