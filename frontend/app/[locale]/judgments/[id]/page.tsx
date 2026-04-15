import JudgmentViewer from "@/components/legal/JudgmentViewer";

export default async function JudgmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <JudgmentViewer judgmentId={id} />
    </div>
  );
}
