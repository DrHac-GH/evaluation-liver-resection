
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function Home() {
  // --- Unified Input States ---
  const [icgR15, setIcgR15] = useState<string>("");
  const [totalBilirubin, setTotalBilirubin] = useState<string>("");
  const [albumin, setAlbumin] = useState<string>("");
  const [pt, setPt] = useState<string>("");
  const [ascites, setAscites] = useState<"none" | "mild" | "moderate">("none");
  const [encephalopathy, setEncephalopathy] = useState<"none" | "mild" | "sometimes">("none");

  // --- Result States ---
  const [takasakiResult, setTakasakiResult] = useState<{ lc: number | string; nonLc: number | string; } | null>(null);
  const [makuuchiResult, setMakuuchiResult] = useState<string | null>(null);
  const [childPughResult, setChildPughResult] = useState<{ score: number; class: string; } | null>(null);
  const [liverDamageResult, setLiverDamageResult] = useState<string | null>(null);

  // --- Unified Calculation Logic ---
  useEffect(() => {
    const icg = parseFloat(icgR15);
    const bil = parseFloat(totalBilirubin);
    const alb = parseFloat(albumin);
    const ptVal = parseFloat(pt);

    // --- Takasaki Formula ---
    if (!isNaN(icg) && icg > 0 && icg < 100) {
      const ln = Math.log;
      let resultLc, resultNonLc;
      if (icg >= 40) { resultLc = "切除不適応"; } else { resultLc = ((ln(40) - ln(icg)) / (ln(100) - ln(icg))) * 100; }
      if (icg >= 50) { resultNonLc = "切除不適応"; } else { resultNonLc = ((ln(50) - ln(icg)) / (ln(100) - ln(icg))) * 100; }
      setTakasakiResult({ lc: resultLc, nonLc: resultNonLc });
    } else {
      setTakasakiResult(null);
    }

    // --- 幕内基準 ---
    const makuuchiAscitesPresent = ascites === 'mild' || ascites === 'moderate';
    if (!isNaN(icg) && !isNaN(bil)) {
      if (makuuchiAscitesPresent || bil > 2.0) {
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
        setMakuuchiResult(null); // Should be caught by bil > 2.0
      }
    } else {
      setMakuuchiResult(null);
    }

    // --- Child-Pugh Score ---
    if (!isNaN(bil) && !isNaN(alb) && !isNaN(ptVal)) {
      let score = 0;
      if (bil < 2.0) score += 1; else if (bil <= 3.0) score += 2; else score += 3;
      if (alb > 3.5) score += 1; else if (alb >= 2.8) score += 2; else score += 3;
      if (ptVal > 70) score += 1; else if (ptVal >= 40) score += 2; else score += 3;
      if (ascites === 'none') score += 1; else if (ascites === 'mild') score += 2; else score += 3;
      if (encephalopathy === 'none') score += 1; else if (encephalopathy === 'mild') score += 2; else score += 3;
      
      let className = '';
      if (score <= 6) className = 'Class A';
      else if (score <= 9) className = 'Class B';
      else className = 'Class C';
      setChildPughResult({ score, class: className });
    } else {
      setChildPughResult(null);
    }

    // --- Liver Damage Grade ---
    if (!isNaN(icg) && !isNaN(bil) && !isNaN(alb) && !isNaN(ptVal)) {
      let countA = 0;
      let countB = 0;
      let countC = 0;

      // Ascites
      if (ascites === 'none') countA++;
      else if (ascites === 'mild') countB++;
      else countC++; // 'moderate'

      // Total Bilirubin
      if (bil < 2.0) countA++;
      else if (bil >= 2.0 && bil <= 3.0) countB++;
      else countC++; // > 3.0

      // Albumin
      if (alb > 3.5) countA++;
      else if (alb >= 3.0 && alb <= 3.5) countB++;
      else countC++; // < 3.0

      // ICG R15
      if (icg < 15) countA++;
      else if (icg >= 15 && icg <= 40) countB++;
      else countC++; // > 40

      // PT Activity
      if (ptVal > 80) countA++;
      else if (ptVal >= 50 && ptVal <= 80) countB++;
      else countC++; // < 50

      let grade = '';
      if (countC >= 2) grade = 'Grade C';
      else if (countB >= 2) grade = 'Grade B';
      else grade = 'Grade A';

      setLiverDamageResult(grade);
    } else {
      setLiverDamageResult(null);
    }

  }, [icgR15, totalBilirubin, albumin, pt, ascites, encephalopathy]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 sm:p-8 bg-slate-50">
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center mt-8">
          <h1 className="text-3xl sm:text-4xl font-bold">肝切除シミュレーター</h1>
          <p className="text-muted-foreground mt-2">各項目を入力すると、自動で計算結果が表示されます。</p>
        </div>

        {/* Unified Input Card */}
        <Card>
          <CardHeader>
            <CardTitle>患者情報入力</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="grid gap-2"><Label htmlFor="icg-r15">ICG R15値 (%)</Label><Input id="icg-r15" type="number" placeholder="例: 15" value={icgR15} onChange={(e) => setIcgR15(e.target.value)} /></div>
            <div className="grid gap-2"><Label htmlFor="bilirubin">総ビリルビン値 (mg/dL)</Label><Input id="bilirubin" type="number" placeholder="例: 0.8" value={totalBilirubin} onChange={(e) => setTotalBilirubin(e.target.value)} /></div>
            <div className="grid gap-2"><Label htmlFor="albumin">血清アルブミン値 (g/dL)</Label><Input id="albumin" type="number" placeholder="例: 3.5" value={albumin} onChange={(e) => setAlbumin(e.target.value)} /></div>
            <div className="grid gap-2"><Label htmlFor="pt">PT活性値 (%)</Label><Input id="pt" type="number" placeholder="例: 90" value={pt} onChange={(e) => setPt(e.target.value)} /></div>
            <div className="grid gap-2 sm:col-span-2 lg:col-span-3"><Label>腹水</Label><RadioGroup value={ascites} onValueChange={(v) => setAscites(v as "none" | "mild" | "moderate")} className="flex flex-wrap gap-x-4"><div className="flex items-center space-x-2"><RadioGroupItem value="none" id="asc-no" /><Label htmlFor="asc-no">なし</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="mild" id="asc-mild" /><Label htmlFor="asc-mild">軽度</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="moderate" id="asc-mod" /><Label htmlFor="asc-mod">中等度以上</Label></div></RadioGroup></div>
            <div className="grid gap-2 sm:col-span-2 lg:col-span-3"><Label>肝性脳症</Label><RadioGroup value={encephalopathy} onValueChange={(v) => setEncephalopathy(v as "none" | "mild" | "sometimes")} className="flex flex-wrap gap-x-4"><div className="flex items-center space-x-2"><RadioGroupItem value="none" id="enc-no" /><Label htmlFor="enc-no">なし</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="mild" id="enc-mild" /><Label htmlFor="enc-mild">軽度</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="sometimes" id="enc-some" /><Label htmlFor="enc-some">時々昏睡</Label></div></RadioGroup></div>
          </CardContent>
        </Card>

        {/* Results Area */}
        <div className="space-y-8">
          <Card className={takasakiResult ? '' : 'hidden'}>
            <CardHeader><CardTitle>高崎の式</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-md border-2 border-blue-500"><p className="font-bold">肝硬変 (LC): <span className="text-2xl font-bold text-blue-600 float-right">{takasakiResult && (typeof takasakiResult.lc === 'number' ? `${takasakiResult.lc.toFixed(1)}%` : takasakiResult.lc)}</span></p></div>
              <div className="p-3 rounded-md border-2 border-green-500"><p className="font-bold">正常肝 (non-LC): <span className="text-2xl font-bold text-green-600 float-right">{takasakiResult && (typeof takasakiResult.nonLc === 'number' ? `${takasakiResult.nonLc.toFixed(1)}%` : takasakiResult.nonLc)}</span></p></div>
            </CardContent>
          </Card>
          <Card className={makuuchiResult ? '' : 'hidden'}>
            <CardHeader><CardTitle>幕内基準</CardTitle></CardHeader>
            <CardContent><div className="p-4 rounded-md border-2 border-purple-500"><p className="text-2xl font-bold text-purple-600 text-center">{makuuchiResult}</p></div></CardContent>
          </Card>
          <Card className={childPughResult ? '' : 'hidden'}>
            <CardHeader><CardTitle>Child-Pugh Score</CardTitle></CardHeader>
            <CardContent className="p-4 rounded-md border-2 border-red-500 text-center">
              <p className="text-lg">合計スコア: <span className="font-bold">{childPughResult && childPughResult.score}</span></p>
              <p className="text-3xl font-bold text-red-600">{childPughResult && childPughResult.class}</p>
            </CardContent>
          </Card>
          <Card className={liverDamageResult ? '' : 'hidden'}>
            <CardHeader><CardTitle>肝障害度</CardTitle></CardHeader>
            <CardContent className="p-4 rounded-md border-2 border-orange-500 text-center">
              <p className="text-3xl font-bold text-orange-600">{liverDamageResult}</p>
            </CardContent>
          </Card>
        </div>

      </div>
    </main>
  );
}
