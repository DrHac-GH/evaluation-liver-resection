"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function Home() {
  // --- Unified Input States ---
  const [icgR15, setIcgR15] = useState<string>("");
  const [ascites, setAscites] = useState<"yes" | "no">("no");
  const [totalBilirubin, setTotalBilirubin] = useState<string>("");

  // --- State for Results ---
  const [takasakiResult, setTakasakiResult] = useState<{
    lc: number | string;
    nonLc: number | string;
  } | null>(null);
  const [makuuchiResult, setMakuuchiResult] = useState<string | null>(null);

  // --- Calculations Triggered by Any Input Change ---
  useEffect(() => {
    const icg = parseFloat(icgR15);
    const bil = parseFloat(totalBilirubin);

    // --- Takasaki Formula Calculation ---
    if (icgR15 === '' || isNaN(icg)) {
      setTakasakiResult(null);
    } else if (icg <= 0 || icg >= 100) {
      setTakasakiResult({ lc: "有効範囲外", nonLc: "有効範囲外" });
    } else {
      const ln = Math.log;
      const denominator = ln(100) - icg;
      let resultLc, resultNonLc;
      if (icg >= 40) { resultLc = "切除不適応"; } else { resultLc = ((ln(40) - ln(icg)) / (ln(100) - ln(icg))) * 100; }
      if (icg >= 50) { resultNonLc = "切除不適応"; } else { resultNonLc = ((ln(50) - ln(icg)) / (ln(100) - ln(icg))) * 100; }
      setTakasakiResult({ lc: resultLc, nonLc: resultNonLc });
    }

    // --- Makuuchi Criteria Calculation ---
    if (totalBilirubin === '' || isNaN(bil) || icgR15 === '' || isNaN(icg)) {
      setMakuuchiResult(null);
    } else if (ascites === "yes" || bil > 2.0) {
      setMakuuchiResult("手術不適応");
    } else if (bil <= 1.0) {
      if (icg < 10) setMakuuchiResult("右肝切除・左三区域切除まで可能");
      else if (icg < 20) setMakuuchiResult("区域切除・左肝切除まで可能");
      else if (icg < 30) setMakuuchiResult("亜区域切除まで可能");
      else if (icg < 40) setMakuuchiResult("部分切除まで可能");
      else setMakuuchiResult("核出術のみ可能");
    } else if (bil <= 1.5) {
      setMakuuchiResult("部分切除まで可能");
    } else if (bil <= 1.9) {
      setMakuuchiResult("核出術のみ可能");
    } else {
      setMakuuchiResult(null); // Fallback for bil > 1.9 but <= 2.0
    }

  }, [icgR15, totalBilirubin, ascites]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-8 bg-slate-50">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center mt-8">
          <h1 className="text-4xl font-bold">肝切除シミュレーター</h1>
          <p className="text-muted-foreground mt-2">各項目を入力すると、自動で計算結果が表示されます。</p>
        </div>

        {/* Unified Input Card */}
        <Card>
          <CardHeader>
            <CardTitle>入力項目</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="icg-r15">ICG R15値 (%)</Label>
              <Input id="icg-r15" type="number" placeholder="例: 15" value={icgR15} onChange={(e) => setIcgR15(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bilirubin">総ビリルビン値 (mg/dL)</Label>
              <Input id="bilirubin" type="number" placeholder="例: 0.8" value={totalBilirubin} onChange={(e) => setTotalBilirubin(e.target.value)} />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label>腹水の有無</Label>
              <RadioGroup value={ascites} onValueChange={(v) => setAscites(v as "yes" | "no")} className="flex space-x-4">
                <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="ascites-no" /><Label htmlFor="ascites-no">なし</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="ascites-yes" /><Label htmlFor="ascites-yes">あり</Label></div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Results Area */}
        <div className="space-y-8">
          {/* Takasaki Formula Card */}
          <Card className={takasakiResult ? '' : 'hidden'}>
            <CardHeader>
              <CardTitle>高崎の式</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-md border-2 border-blue-500">
                <p className="font-bold">肝硬変 (LC) の場合:</p>
                <p className="text-2xl font-bold text-blue-600">
                  {takasakiResult && (typeof takasakiResult.lc === 'number' ? `${takasakiResult.lc.toFixed(1)}%` : takasakiResult.lc)}
                </p>
              </div>
              <div className="p-3 rounded-md border-2 border-green-500">
                <p className="font-bold">正常肝 (non-LC) の場合:</p>
                <p className="text-2xl font-bold text-green-600">
                  {takasakiResult && (typeof takasakiResult.nonLc === 'number' ? `${takasakiResult.nonLc.toFixed(1)}%` : takasakiResult.nonLc)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Makuuchi Criteria Card */}
          <Card className={makuuchiResult ? '' : 'hidden'}>
            <CardHeader>
              <CardTitle>Makuuchi基準</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-md border-2 border-purple-500">
                <p className="text-2xl font-bold text-purple-600 text-center">{makuuchiResult}</p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </main>
  );
}