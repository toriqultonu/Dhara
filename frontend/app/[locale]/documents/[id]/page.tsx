"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import DocumentEditor from "@/components/documents/DocumentEditor";
import type { DocumentResponse } from "@/lib/types";

function getToken(): string | null {
  try {
    const raw = localStorage.getItem("dhara_auth");
    return raw ? JSON.parse(raw).token : null;
  } catch {
    return null;
  }
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function DocumentEditorPage() {
  const router = useRouter();
  const params = useParams();
  const docId = params?.id as string;

  const [document, setDocument] = useState<DocumentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/login"); return; }

    fetch(`${API}/api/documents/${docId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setDocument(json.data);
        else setError("Document not found");
      })
      .catch(() => setError("Failed to load document"))
      .finally(() => setLoading(false));
  }, [docId, router]);

  const handleSave = useCallback(async (title: string, content: string, status: string) => {
    const token = getToken();
    if (!token) return;
    await fetch(`${API}/api/documents/${docId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, content, status }),
    });
  }, [docId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        Loading document...
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-red-500">{error || "Document not found"}</p>
        <button onClick={() => router.push("/documents")} className="text-primary underline text-sm">
          Back to Documents
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Back nav */}
      <div className="shrink-0 px-4 py-2 border-b bg-white flex items-center gap-3">
        <button
          onClick={() => router.push("/documents")}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← My Documents
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <DocumentEditor doc={document} onSave={handleSave} />
      </div>
    </div>
  );
}
