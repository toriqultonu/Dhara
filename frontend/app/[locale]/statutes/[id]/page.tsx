import StatuteViewer from "@/components/legal/StatuteViewer";

export default async function StatuteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <StatuteViewer statuteId={id} />
    </div>
  );
}
