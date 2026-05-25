"use client";

import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

export const NOTE_NAME_SUGGESTIONS = [
  "General",
  "Follow-up",
  "Visa",
  "University",
  "Documents",
  "Payment",
  "Interview",
  "Priority",
  "Client Communication",
  "Internal",
];

export const NOTE_DETAIL_SUGGESTIONS = [
  "Pending",
  "In Progress",
  "Completed",
  "On Hold",
  "Urgent",
  "High Priority",
  "Low Priority",
  "Approved",
  "Rejected",
  "Scheduled",
  "N/A",
];

function newNoteId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function parseSpecialNotes(raw) {
  if (!raw || !String(raw).trim()) return [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .filter((e) => e && typeof e === "object")
        .map((e, index) => ({
          id: e.id ? String(e.id) : `legacy-${index}`,
          name: String(e.name ?? e.key ?? "").trim(),
          detail: String(e.detail ?? e.value ?? e.note ?? ""),
        }))
        .filter((e) => e.name);
    }
    if (parsed && typeof parsed === "object") {
      return Object.entries(parsed).map(([name, detail], index) => ({
        id: `legacy-${index}`,
        name: String(name).trim(),
        detail: detail == null ? "" : String(detail),
      }));
    }
  } catch {
    return [{ id: newNoteId(), name: "Note", detail: String(raw) }];
  }
  return [];
}

export function serializeSpecialNotes(entries) {
  return JSON.stringify(
    entries.map(({ id, name, detail }) => ({
      id: id || newNoteId(),
      name: name.trim(),
      detail: detail ?? "",
    }))
  );
}

const NoteFormModal = ({
  open,
  title,
  initial,
  onClose,
  onSubmit,
  saving,
}) => {
  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setDetail(initial?.detail ?? "");
      setError("");
    }
  }, [open, initial]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Name is required.");
      return;
    }
    onSubmit({ name: trimmedName, detail: detail.trim() });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-white/20 w-full max-w-lg overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-modal-title"
      >
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 text-white">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Icon icon="mdi:note-plus" className="text-xl" />
              </div>
              <h3 id="note-modal-title" className="text-xl font-bold">
                {title}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Close"
            >
              <Icon icon="mdi:close" className="text-xl" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label
              htmlFor="note-name"
              className="text-sm font-semibold text-gray-700 mb-1.5 block"
            >
              Name
            </label>
            <input
              id="note-name"
              type="text"
              list="note-name-suggestions"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Type a name…"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white"
              autoFocus
            />
            <datalist id="note-name-suggestions">
              {NOTE_NAME_SUGGESTIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          <div>
            <label
              htmlFor="note-detail"
              className="text-sm font-semibold text-gray-700 mb-1.5 block"
            >
              Detail
            </label>
            <textarea
              id="note-detail"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Type the detail…"
              rows={4}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white resize-y min-h-[100px]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 inline-flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Icon icon="mdi:loading" className="text-lg animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Icon icon="mdi:content-save" className="text-lg" />
                  Save
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SpecialNotesEditor = ({ rawNotes, onSave }) => {
  const [notes, setNotes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState({ open: false, mode: "add", editId: null });

  useEffect(() => {
    setNotes(parseSpecialNotes(rawNotes));
  }, [rawNotes]);

  const persist = async (nextNotes) => {
    setSaving(true);
    try {
      await onSave(serializeSpecialNotes(nextNotes));
    } finally {
      setSaving(false);
    }
  };

  const openAddModal = () => {
    setModal({ open: true, mode: "add", editId: null });
  };

  const openEditModal = (id) => {
    setModal({ open: true, mode: "edit", editId: id });
  };

  const closeModal = () => {
    if (!saving) setModal({ open: false, mode: "add", editId: null });
  };

  const handleModalSubmit = async ({ name, detail }) => {
    let nextNotes;
    if (modal.mode === "edit" && modal.editId) {
      nextNotes = notes.map((n) =>
        n.id === modal.editId ? { ...n, name, detail } : n
      );
    } else {
      nextNotes = [...notes, { id: newNoteId(), name, detail }];
    }
    await persist(nextNotes);
    closeModal();
  };

  const handleDelete = async (id) => {
    const note = notes.find((n) => n.id === id);
    if (
      !window.confirm(
        `Delete note "${note?.name || "this note"}"? This cannot be undone.`
      )
    ) {
      return;
    }
    const nextNotes = notes.filter((n) => n.id !== id);
    await persist(nextNotes);
  };

  const editingNote =
    modal.mode === "edit" && modal.editId
      ? notes.find((n) => n.id === modal.editId)
      : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          {notes.length === 0
            ? "No notes yet."
            : `${notes.length} note${notes.length === 1 ? "" : "s"}`}
        </p>
        <button
          type="button"
          onClick={openAddModal}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-yellow-800 bg-yellow-50 hover:bg-yellow-100 rounded-xl transition-colors disabled:opacity-50"
        >
          <Icon icon="mdi:plus" className="text-lg" />
          Add note
        </button>
      </div>

      {notes.length > 0 && (
        <div className="space-y-3">
          {notes.map((row) => (
            <div
              key={row.id}
              className="flex flex-col sm:flex-row sm:items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{row.name}</p>
                <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                  {row.detail || "—"}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => openEditModal(row.id)}
                  disabled={saving}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                  title="Edit note"
                >
                  <Icon icon="mdi:pencil" className="text-lg" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(row.id)}
                  disabled={saving}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                  title="Delete note"
                >
                  <Icon icon="mdi:delete-outline" className="text-lg" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <NoteFormModal
        open={modal.open}
        title={modal.mode === "edit" ? "Edit note" : "Add note"}
        initial={editingNote}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        saving={saving}
      />
    </div>
  );
};

export default SpecialNotesEditor;
