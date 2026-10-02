export type PropertyAssumptions = {
  purchasePrice: number;
  renovationBudget?: number;
  closingCosts?: number;
  monthlyRent: number;
  monthlyExpenses?: number;
  downPaymentPercent?: number;
  annualInterestPercent?: number;
  loanTermYears?: number;
  estimatedResaleValue?: number;
  sellingCosts?: number;
};

export type PropertyAnalysis = {
  projectCost: number;
  equityRequired: number;
  grossYieldPercent: number;
  capRatePercent: number;
  monthlyDebtService: number;
  estimatedMonthlyCashFlow: number;
  cashOnCashPercent: number | null;
  flipMargin: number | null;
};

export function calculatePropertyAnalysis(input: PropertyAssumptions): PropertyAnalysis {
  const purchase = Math.max(0, input.purchasePrice || 0);
  const renovation = Math.max(0, input.renovationBudget || 0);
  const closing = Math.max(0, input.closingCosts || 0);
  const monthlyRent = Math.max(0, input.monthlyRent || 0);
  const monthlyExpenses = Math.max(0, input.monthlyExpenses || 0);
  const downPercent = Math.min(100, Math.max(0, input.downPaymentPercent ?? 25));
  const annualRate = Math.max(0, input.annualInterestPercent ?? 7);
  const termYears = Math.max(1, input.loanTermYears ?? 30);
  const projectCost = purchase + renovation + closing;
  const equityRequired = purchase * downPercent / 100 + renovation + closing;
  const netOperatingIncome = (monthlyRent - monthlyExpenses) * 12;
  const loanPrincipal = purchase * (1 - downPercent / 100);
  const monthlyRate = annualRate / 1200;
  const periods = termYears * 12;
  const monthlyDebtService = monthlyRate > 0
    ? loanPrincipal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -periods))
    : loanPrincipal / periods;
  const estimatedMonthlyCashFlow = netOperatingIncome / 12 - monthlyDebtService;
  return {
    projectCost,
    equityRequired,
    grossYieldPercent: projectCost > 0 ? monthlyRent * 12 / projectCost * 100 : 0,
    capRatePercent: projectCost > 0 ? netOperatingIncome / projectCost * 100 : 0,
    monthlyDebtService,
    estimatedMonthlyCashFlow,
    cashOnCashPercent: equityRequired > 0 ? estimatedMonthlyCashFlow * 12 / equityRequired * 100 : null,
    flipMargin: input.estimatedResaleValue && input.estimatedResaleValue > 0
      ? input.estimatedResaleValue - projectCost - Math.max(0, input.sellingCosts || 0)
      : null
  };
}
