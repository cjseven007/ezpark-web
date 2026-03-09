import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export default function DataAnnotatorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Data Annotator
        </h1>
        <p className="text-sm text-slate-600">
          This page is prepared for your future draw bounding box feature.
        </p>
      </div>

      <Card className="rounded-3xl">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Bounding Box Annotation Workspace</CardTitle>
            <Badge variant="secondary">Coming soon</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed bg-slate-50 text-center text-sm text-slate-500">
            Annotation canvas placeholder
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            Later, this page can contain image upload, click-and-drag box drawing,
            polygon editing, and JSON export for parking slots.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}