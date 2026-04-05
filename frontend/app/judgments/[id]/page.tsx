import JudgmentViewer from "@/components/legal/JudgmentViewer";

export default function JudgmentDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <JudgmentViewer judgmentId={params.id} />
    </div>
  );
}
