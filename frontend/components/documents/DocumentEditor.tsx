"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import ClauseLibrarySidebar from "./ClauseLibrarySidebar";
import SmartFieldsSidebar from "./SmartFieldsSidebar";
import ExportModal from "./ExportModal";
import type { DocumentResponse } from "@/lib/types";

interface DocumentEditorProps {
  doc: DocumentResponse;
  onSave: (title: string, content: string, status: string) => Promise<void>;
}

type SidebarView = "none" | "clauses" | "fields";

const TOOLBAR_ACTIONS = [
  { cmd: "bold", icon: "B", label: "Bold", style: "font-bold" },
  { cmd: "italic", icon: "I", label: "Italic", style: "italic" },
  { cmd: "underline", icon: "U", label: "Underline", style: "underline" },
];

const HEADING_ACTIONS = [
  { cmd: "formatBlock", value: "h1", icon: "H1" },
  { cmd: "formatBlock", value: "h2", icon: "H2" },
  { cmd: "formatBlock", value: "h3", icon: "H3" },
  { cmd: "formatBlock", value: "p", icon: "¶" },
];

const LIST_ACTIONS = [
  { cmd: "insertUnorderedList", icon: "• List" },
  { cmd: "insertOrderedList", icon: "1. List" },
];

const ALIGN_ACTIONS = [
  { cmd: "justifyLeft", icon: "⬅" },
  { cmd: "justifyCenter", icon: "⬛" },
  { cmd: "justifyRight", icon: "➡" },
];

export default function DocumentEditor({ doc, onSave }: DocumentEditorProps) {
  const t = useTranslations("documents");
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState(doc.title);
  const [status, setStatus] = useState(doc.status);
  const [sidebar, setSidebar] = useState<SidebarView>("none");
  const [wordCount, setWordCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showExport, setShowExport] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (editorRef.current && doc.content) {
      editorRef.current.innerHTML = doc.content;
      updateWordCount();
    }
  }, [doc.content]);

  const updateWordCount = useCallback(() => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || "";
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, []);

  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      if (!editorRef.current) return;
      setSaving(true);
      try {
        await onSave(title, editorRef.current.innerHTML, status);
        setLastSaved(new Date());
      } finally {
        setSaving(false);
      }
    }, 2000);
  }, [title, status, onSave]);

  const handleEditorInput = () => {
    updateWordCount();
    triggerAutoSave();
  };

  const execCmd = (cmd: string, value?: string) => {
    window.document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  };

  const insertContent = (html: string) => {
    editorRef.current?.focus();
    window.document.execCommand("insertHTML", false, html);
    updateWordCount();
    triggerAutoSave();
  };

  const handleManualSave = async () => {
    if (!editorRef.current) return;
    setSaving(true);
    try {
      await onSave(title, editorRef.current.innerHTML, status);
      setLastSaved(new Date());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-white">
        <input
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); triggerAutoSave(); }}
          className="flex-1 text-lg font-semibold bg-transparent outline-none"
          placeholder={t("untitled")}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="text-xs border border-gray-200 rounded px-2 py-1"
        >
          <option value="draft">Draft</option>
          <option value="completed">Completed</option>
        </select>
        <span className="text-xs text-gray-400">
          {wordCount} {t("words")}
          {lastSaved && ` · ${t("saved")} ${lastSaved.toLocaleTimeString()}`}
          {saving && ` · ${t("saving")}`}
        </span>
        <button
          onClick={handleManualSave}
          disabled={saving}
          className="text-xs px-3 py-1.5 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
        >
          {t("save")}
        </button>
        <button
          onClick={() => setShowExport(true)}
          className="text-xs px-3 py-1.5 border border-gray-200 rounded hover:bg-gray-50"
        >
          {t("export")}
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-4 py-2 border-b bg-gray-50">
        {TOOLBAR_ACTIONS.map((a) => (
          <button
            key={a.cmd}
            onMouseDown={(e) => { e.preventDefault(); execCmd(a.cmd); }}
            className={`w-7 h-7 text-sm border border-gray-200 rounded hover:bg-white ${a.style}`}
            title={a.label}
          >
            {a.icon}
          </button>
        ))}
        <div className="w-px h-5 bg-gray-200 mx-1" />
        {HEADING_ACTIONS.map((a) => (
          <button
            key={a.value}
            onMouseDown={(e) => { e.preventDefault(); execCmd(a.cmd, a.value); }}
            className="px-2 h-7 text-xs border border-gray-200 rounded hover:bg-white font-mono"
          >
            {a.icon}
          </button>
        ))}
        <div className="w-px h-5 bg-gray-200 mx-1" />
        {LIST_ACTIONS.map((a) => (
          <button
            key={a.cmd}
            onMouseDown={(e) => { e.preventDefault(); execCmd(a.cmd); }}
            className="px-2 h-7 text-xs border border-gray-200 rounded hover:bg-white"
          >
            {a.icon}
          </button>
        ))}
        <div className="w-px h-5 bg-gray-200 mx-1" />
        {ALIGN_ACTIONS.map((a) => (
          <button
            key={a.cmd}
            onMouseDown={(e) => { e.preventDefault(); execCmd(a.cmd); }}
            className="w-7 h-7 text-sm border border-gray-200 rounded hover:bg-white"
          >
            {a.icon}
          </button>
        ))}
        <div className="ml-auto flex gap-1">
          <button
            onClick={() => setSidebar(sidebar === "clauses" ? "none" : "clauses")}
            className={`px-2 h-7 text-xs border rounded ${sidebar === "clauses" ? "bg-primary text-white border-primary" : "border-gray-200 hover:bg-white"}`}
          >
            {t("clauses")}
          </button>
          <button
            onClick={() => setSidebar(sidebar === "fields" ? "none" : "fields")}
            className={`px-2 h-7 text-xs border rounded ${sidebar === "fields" ? "bg-primary text-white border-primary" : "border-gray-200 hover:bg-white"}`}
          >
            {t("fields")}
          </button>
        </div>
      </div>

      {/* Editor + Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Content editor */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <div className="max-w-3xl mx-auto bg-white shadow-sm rounded-lg p-10 min-h-[600px]">
            <div
              ref={editorRef}
              contentEditable
              onInput={handleEditorInput}
              className="outline-none prose prose-sm max-w-none min-h-[500px] text-gray-900 leading-relaxed"
              style={{ fontFamily: "Georgia, serif", fontSize: "11pt", lineHeight: 1.8 }}
              suppressContentEditableWarning
            />
          </div>
        </div>

        {/* Sidebar */}
        {sidebar !== "none" && (
          <div className="w-64 border-l bg-white p-4 overflow-hidden flex flex-col">
            {sidebar === "clauses" && (
              <ClauseLibrarySidebar onInsert={insertContent} />
            )}
            {sidebar === "fields" && (
              <SmartFieldsSidebar onInsert={(field) => insertContent(`<strong>${field}</strong>`)} />
            )}
          </div>
        )}
      </div>

      <ExportModal
        documentId={doc.id}
        documentTitle={title}
        isOpen={showExport}
        onClose={() => setShowExport(false)}
      />
    </div>
  );
}
