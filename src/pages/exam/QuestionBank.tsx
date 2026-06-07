import { useState } from "react";
import { PortalPage } from "@/components/portal/PortalPage";
import { Button } from "@/components/ui/button";
import { Upload, Download } from "lucide-react";
import { QuestionBankTable } from "@/components/exam/QuestionBankTable";
import { useToast } from "@/hooks/use-toast";
import { questionBank } from "@/data/exam/questionBank";

export default function QuestionBank() {
  const { toast } = useToast();
  const [questions] = useState(questionBank);
  return (
    <PortalPage
      title="Question Bank"
      description="Categorised questions with difficulty levels and subject mapping"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1" onClick={() => toast({ title: "Import ready", description: "Upload a CSV to import questions." })}>
            <Upload className="h-4 w-4" /> Import
          </Button>
          <Button variant="outline" className="gap-1" onClick={() => toast({ title: "Export started", description: `${questions.length} questions exported.` })}>
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      }
    >
      <QuestionBankTable questions={questions} />
    </PortalPage>
  );
}
