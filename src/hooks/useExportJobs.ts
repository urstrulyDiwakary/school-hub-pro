import { useEffect, useState } from "react";
import { exportJobQueue, type ExportJob } from "@/lib/exportJobQueue";

export function useExportJobs(): ExportJob[] {
  const [jobs, setJobs] = useState<ExportJob[]>(() => exportJobQueue.snapshot());
  useEffect(() => exportJobQueue.subscribe(setJobs), []);
  return jobs;
}
