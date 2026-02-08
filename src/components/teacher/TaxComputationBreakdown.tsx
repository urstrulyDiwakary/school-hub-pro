import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator } from "lucide-react";
import { taxComputationData } from "@/data/teacherData";

const fmt = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function TaxComputationBreakdown() {
  const t = taxComputationData;

  return (
    <Card className="stat-card overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calculator className="h-4 w-4 text-primary" />
          Tax Computation — New Regime (FY 2025-26)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Income & Exemptions */}
        <div className="divide-y divide-border">
          <Row label="Gross Salary (Annual)" value={fmt(t.grossSalaryAnnual)} bold />
          <Row label="Less: Standard Deduction (u/s 16)" value={`- ${fmt(t.standardDeduction)}`} indent />
          <Row label="Less: HRA Exemption (u/s 10(13A))" value={`- ${fmt(t.hraExemption)}`} indent />
          <Row label="Less: Professional Tax" value={`- ${fmt(t.professionalTax)}`} indent />
          <div className="px-4 py-2 bg-muted/30">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground italic">Section 80C — PF Contribution</span>
              <span className="font-mono text-muted-foreground">{fmt(t.section80C_PF)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground italic">Section 80C — Other Investments</span>
              <span className="font-mono text-muted-foreground">{fmt(t.section80C_Others)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground italic">Section 80D — Medical Insurance</span>
              <span className="font-mono text-muted-foreground">{fmt(t.section80D_Medical)}</span>
            </div>
          </div>
          <Row label="Total Exemptions & Deductions" value={fmt(t.totalExemptions)} bold highlight="destructive" />
          <Row label="Taxable Income" value={fmt(t.taxableIncome)} bold highlight="primary" />
        </div>

        {/* Tax Slabs */}
        <div className="border-t border-border">
          <div className="px-4 py-2 bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tax Slab Calculation
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Income Slab</th>
                  <th>Rate</th>
                  <th className="text-right">Tax</th>
                </tr>
              </thead>
              <tbody>
                {t.taxSlabs.map((slab) => (
                  <tr key={slab.slab}>
                    <td className="text-sm">{slab.slab}</td>
                    <td className="text-sm font-medium">{slab.rate}</td>
                    <td className="text-right font-mono text-sm">{fmt(slab.tax)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Final Computation */}
        <div className="divide-y divide-border border-t">
          <Row label="Total Tax Liability" value={fmt(t.totalTaxLiability)} bold />
          <Row label="Add: Education Cess (4%)" value={fmt(t.educationCess)} indent />
          <Row label="Total Tax Payable" value={fmt(t.totalTaxPayable)} bold highlight="destructive" />
          <Row label="TDS Paid (YTD)" value={fmt(t.tdsPaidYTD)} indent />
          <div className="flex items-center justify-between px-4 py-4 bg-success/5">
            <span className="font-semibold text-foreground">
              {t.remainingTax > 0 ? "Remaining Tax Due" : "Tax Status"}
            </span>
            <span className={`text-lg font-bold font-mono ${t.remainingTax > 0 ? "text-destructive" : "text-success"}`}>
              {t.remainingTax > 0 ? fmt(t.remainingTax) : "Fully Paid ✓"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  value,
  bold,
  indent,
  highlight,
}: {
  label: string;
  value: string;
  bold?: boolean;
  indent?: boolean;
  highlight?: "primary" | "destructive" | "success";
}) {
  const colorClass = highlight
    ? highlight === "primary"
      ? "text-primary"
      : highlight === "destructive"
      ? "text-destructive"
      : "text-success"
    : "text-foreground";

  return (
    <div className={`flex justify-between px-4 py-2.5 text-sm ${indent ? "pl-8" : ""}`}>
      <span className={bold ? "font-semibold text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
      <span className={`font-mono ${bold ? `font-bold ${colorClass}` : "font-medium text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}
