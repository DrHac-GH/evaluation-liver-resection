
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Home() {
  const [icgR15, setIcgR15] = useState<string>("");
  const [result, setResult] = useState<{
    lc: number | string;
    nonLc: number | string;
  } | null>(null);

  useEffect(() => {
    const a = parseFloat(icgR15);
    if (icgR15 === '' || isNaN(a)) {
      setResult(null);
      return;
    }

    if (a <= 0 || a >= 100) {
      setResult({ lc: "有効範囲外", nonLc: "有効範囲外" });
      return;
    }

    const ln = Math.log;
    const denominator = ln(100) - ln(a);

    // Liver Cirrhosis Calculation
    let resultLc: number | string;
    if (a >= 40) {
      resultLc = "切除不適応";
    } else {
      const numeratorLc = ln(40) - ln(a);
      resultLc = (numeratorLc / denominator) * 100;
    }

    // Normal Liver Calculation
    let resultNonLc: number | string;
    if (a >= 50) {
      resultNonLc = "切除不適応";
    } else {
      const numeratorNonLc = ln(50) - ln(a);
      resultNonLc = (numeratorNonLc / denominator) * 100;
    }

    setResult({ lc: resultLc, nonLc: resultNonLc });
  }, [icgR15]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-50">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>肝切除率シミュレーター</CardTitle>
          <CardDescription>ICG R15値 (0より大きく100未満) を入力すると、自動で最大許容肝切除率を計算します。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="icg-r15">ICG R15値 (%)</Label>
            <Input
              id="icg-r15"
              type="number"
              placeholder="例: 15"
              value={icgR15}
              onChange={(e) => setIcgR15(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch">
          {result && (
            <div className="mt-4 p-4 bg-slate-100 rounded-md w-full">
              <h3 className="text-lg font-semibold mb-2">計算結果</h3>
              <div className="space-y-2">
                <p><strong>入力ICG R15:</strong> {icgR15}%</p>
                <div className="p-3 rounded-md border-2 border-blue-500">
                  <p className="font-bold">肝硬変 (LC) の場合:</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {typeof result.lc === 'number' ? `${result.lc.toFixed(1)}%` : result.lc}
                  </p>
                </div>
                <div className="p-3 rounded-md border-2 border-green-500 mt-2">
                  <p className="font-bold">正常肝 (non-LC) の場合:</p>
                  <p className="text-2xl font-bold text-green-600">
                    {typeof result.nonLc === 'number' ? `${result.nonLc.toFixed(1)}%` : result.nonLc}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </main>
  );
}
