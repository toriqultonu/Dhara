"use client";

import Modal from "@/components/ui/Modal";
import type { TemplateListResponse } from "@/lib/types";

interface TemplatePreviewModalProps {
  template: TemplateListResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onUse: (id: number) => void;
}

export default function TemplatePreviewModal({ template, isOpen, onClose, onUse }: TemplatePreviewModalProps) {
  if (!template) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={template.title}>
      <div className="mb-4">
        <span className="text-xs text-gray-500 capitalize">{template.category}</span>
        {template.description && (
          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
        )}
      </div>

      {template.preview && (
        <div
          className="border border-gray-200 rounded p-4 bg-gray-50 max-h-80 overflow-y-auto text-sm prose prose-sm max-w-none mb-4"
          dangerouslySetInnerHTML={{ __html: template.preview }}
        />
      )}

      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          Close
        </button>
        <button
          onClick={() => { onUse(template.id); onClose(); }}
          className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Use This Template
        </button>
      </div>
    </Modal>
  );
}
