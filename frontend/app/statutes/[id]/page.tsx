import { useTranslations } from "next-intl";
import StatuteViewer from "@/components/legal/StatuteViewer";

export default function StatuteDetailPage({ params }: { params: { id: string } }) {
  const t = useTranslations("legal");

  // TODO: Fetch statute from API
  return (
    <div className="container mx-auto px-4 py-8">
      <StatuteViewer statuteId={params.id} />
    </div>
  );
}
