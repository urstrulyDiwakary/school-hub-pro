import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { redeemCode } from "@/services/schoolService";
import { toast } from "@/hooks/use-toast";

export function LinkChildCard() {
  const qc = useQueryClient();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await redeemCode(code);
      setCode("");
      qc.invalidateQueries({ queryKey: ["live-students"] });
      toast({ title: "Child linked" });
    } catch (e) {
      toast({ title: "Could not link", description: (e as Error).message, variant: "destructive" });
    }
    setBusy(false);
  };
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-base">Link a child</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={submit} className="flex gap-2">
          <Input aria-label="Child code" placeholder="Code from the school" className="uppercase" maxLength={12} value={code} onChange={(e) => setCode(e.target.value)} />
          <Button type="submit" disabled={busy || code.trim().length < 6}>Link</Button>
        </form>
      </CardContent>
    </Card>
  );
}
