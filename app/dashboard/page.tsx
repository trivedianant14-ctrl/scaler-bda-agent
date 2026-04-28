"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import type { ExtractedQuestion } from "@/app/api/extract/route";
import type { GeneratedPdf, PdfSection } from "@/app/api/generate/route";

type LeadForm = {
  name: string;
  role: string;
  company: string;
  yoe: number;
  intent: string;
  linkedinContext: string;
  transcript: string;
  audio?: FileList;
};

type ToastState = { message: string; type: "success" | "error" };

const inputCls =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500";

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg text-sm font-medium ${
        toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
      }`}
    >
      <span>{toast.message}</span>
      <button onClick={onDismiss} className="opacity-75 hover:opacity-100 ml-1 text-base leading-none">
        ×
      </button>
    </div>
  );
}

// ─── NudgeRenderer ────────────────────────────────────────────────────────────
function NudgeRenderer({ text }: { text: string }) {
  return (
    <div className="space-y-0.5 text-sm text-gray-800 leading-relaxed font-mono">
      {text.split("\n").map((line, i) => {
        const isSectionHeader = /^\d+\.\s+[A-Z\s]+:/.test(line);
        if (line.trim() === "") return <div key={i} className="h-2" />;
        return (
          <p key={i} className={isSectionHeader ? "font-bold text-gray-900 mt-3 first:mt-0" : "pl-1"}>
            {line}
          </p>
        );
      })}
    </div>
  );
}

// ─── Badge helpers ────────────────────────────────────────────────────────────
const PERSONA_LABELS: Record<string, string> = {
  SKEPTICAL_SWITCHER: "Skeptical Switcher",
  SENIOR_VALIDATOR: "Senior Validator",
  ANXIOUS_ASPIRER: "Anxious Aspirer",
};
const URGENCY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-gray-100 text-gray-600",
};
const QUALITY_COLORS: Record<string, string> = {
  unanswered: "bg-red-50 text-red-600",
  weak: "bg-orange-50 text-orange-600",
  partial: "bg-yellow-50 text-yellow-600",
};

// ─── QuestionsPreview ─────────────────────────────────────────────────────────
function QuestionsPreview({ questions }: { questions: ExtractedQuestion[] }) {
  if (!Array.isArray(questions) || questions.length === 0) return null;
  return (
    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
      <p className="text-xs font-semibold text-amber-700 mb-3">
        {questions.length} open question{questions.length !== 1 ? "s" : ""} extracted from transcript
      </p>
      <ul className="space-y-2">
        {questions.map((q, i) => (
          <li key={i} className="flex flex-col gap-1">
            <p className="text-sm text-gray-800">{q.question}</p>
            <div className="flex gap-1.5 flex-wrap">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${URGENCY_COLORS[q.urgency]}`}>
                {q.urgency}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${QUALITY_COLORS[q.bda_response_quality]}`}>
                {q.bda_response_quality}
              </span>
              <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-500">
                {q.category.replace(/_/g, " ")}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── PdfPreview (read-only) ───────────────────────────────────────────────────
function PdfPreview({ pdf }: { pdf: GeneratedPdf }) {
  return (
    <div className="w-full space-y-5 text-sm text-gray-800">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-indigo-100 px-3 py-0.5 text-xs font-semibold text-indigo-700">
          {PERSONA_LABELS[pdf.persona] ?? pdf.persona}
        </span>
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-900">{pdf.headline}</h3>
        <p className="mt-1 text-gray-600 leading-relaxed">{pdf.greeting}</p>
      </div>
      {pdf.sections.map((section, i) => (
        <div key={i} className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
          <h4 className="font-semibold text-gray-900">{section.title}</h4>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{section.content}</p>
          {section.evidence.length > 0 && (
            <ul className="list-disc pl-4 space-y-1 text-gray-600">
              {section.evidence.map((e, j) => <li key={j}>{e}</li>)}
            </ul>
          )}
          {section.source_note && (
            <p className="text-xs text-gray-400 italic">Source: {section.source_note}</p>
          )}
        </div>
      ))}
      <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 space-y-2">
        <p className="font-semibold text-indigo-900">{pdf.cta.headline}</p>
        <p className="text-indigo-800">{pdf.cta.body}</p>
        <p className="text-xs text-indigo-600 italic">{pdf.cta.test_framing}</p>
      </div>
      <div className="rounded-lg border border-green-200 bg-green-50 p-3">
        <p className="text-xs font-semibold text-green-700 mb-1">WhatsApp covering message (BDA only)</p>
        <p className="text-green-900 leading-relaxed">{pdf.whatsapp_message}</p>
      </div>
    </div>
  );
}

// ─── EditablePdfForm ──────────────────────────────────────────────────────────
function EditablePdfForm({ value, onChange }: { value: GeneratedPdf; onChange: (updated: GeneratedPdf) => void }) {
  const updateSection = (i: number, patch: Partial<PdfSection>) => {
    const sections = value.sections.map((s, idx) => (idx === i ? { ...s, ...patch } : s));
    onChange({ ...value, sections });
  };

  return (
    <div className="space-y-6 text-sm">
      <div className="space-y-3">
        <div>
          <label className="block font-medium text-gray-700">Headline</label>
          <input className={inputCls} value={value.headline} onChange={(e) => onChange({ ...value, headline: e.target.value })} />
        </div>
        <div>
          <label className="block font-medium text-gray-700">Greeting</label>
          <textarea className={inputCls} rows={2} value={value.greeting} onChange={(e) => onChange({ ...value, greeting: e.target.value })} />
        </div>
      </div>

      {value.sections.map((section, i) => (
        <div key={i} className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Section {i + 1}</p>
          <div>
            <label className="block font-medium text-gray-700">Title</label>
            <input className={inputCls} value={section.title} onChange={(e) => updateSection(i, { title: e.target.value })} />
          </div>
          <div>
            <label className="block font-medium text-gray-700">Content</label>
            <textarea className={inputCls} rows={5} value={section.content} onChange={(e) => updateSection(i, { content: e.target.value })} />
          </div>
          <div>
            <label className="block font-medium text-gray-700">
              Evidence bullets <span className="text-gray-400 font-normal">(one per line)</span>
            </label>
            <textarea
              className={inputCls}
              rows={3}
              value={section.evidence.join("\n")}
              onChange={(e) => updateSection(i, { evidence: e.target.value.split("\n").filter((l) => l.trim() !== "") })}
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700">Source note</label>
            <input className={inputCls} value={section.source_note} onChange={(e) => updateSection(i, { source_note: e.target.value })} />
          </div>
        </div>
      ))}

      <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4 space-y-3">
        <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">Call to Action</p>
        <div>
          <label className="block font-medium text-gray-700">CTA Headline</label>
          <input className={inputCls} value={value.cta.headline} onChange={(e) => onChange({ ...value, cta: { ...value.cta, headline: e.target.value } })} />
        </div>
        <div>
          <label className="block font-medium text-gray-700">CTA Body</label>
          <textarea className={inputCls} rows={2} value={value.cta.body} onChange={(e) => onChange({ ...value, cta: { ...value.cta, body: e.target.value } })} />
        </div>
        <div>
          <label className="block font-medium text-gray-700">Test framing</label>
          <textarea className={inputCls} rows={2} value={value.cta.test_framing} onChange={(e) => onChange({ ...value, cta: { ...value.cta, test_framing: e.target.value } })} />
        </div>
      </div>

      <div className="rounded-lg border border-green-100 bg-green-50 p-4">
        <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">
          WhatsApp covering message (BDA only — not in PDF)
        </p>
        <textarea
          className={inputCls}
          rows={3}
          value={value.whatsapp_message}
          onChange={(e) => onChange({ ...value, whatsapp_message: e.target.value })}
        />
      </div>
    </div>
  );
}

// ─── DashboardPage ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { register, getValues, setValue } = useForm<LeadForm>();

  // Nudge state
  const [nudge, setNudge] = useState<string | null>(null);
  const [nudgeLoading, setNudgeLoading] = useState(false);
  const [nudgeError, setNudgeError] = useState<string | null>(null);
  const [sendingNudge, setSendingNudge] = useState(false);
  const [isEditingNudge, setIsEditingNudge] = useState(false);
  const [editableNudge, setEditableNudge] = useState("");

  // PDF state
  const [questions, setQuestions] = useState<ExtractedQuestion[]>([]);
  const [pdf, setPdf] = useState<GeneratedPdf | null>(null);
  const [pdfId, setPdfId] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfStatus, setPdfStatus] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [sendingPdf, setSendingPdf] = useState(false);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editablePdf, setEditablePdf] = useState<GeneratedPdf | null>(null);

  // Shared send state
  const [recipientPhone, setRecipientPhone] = useState(
    process.env.NEXT_PUBLIC_WHATSAPP_TO ?? ""
  );
  const [leadPhone, setLeadPhone] = useState("");
  const [toast, setToast] = useState<ToastState | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Cleanup blob URL
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  // Shared: render PDF binary, store it, return its server-side ID
  const renderAndSetUrl = async (pdfData: GeneratedPdf): Promise<string | null> => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    const renderRes = await fetch("/api/render-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pdf: pdfData }),
    });
    if (!renderRes.ok) {
      const err = await renderRes.json().catch(() => ({}));
      throw new Error(err.error ?? `Render error ${renderRes.status}`);
    }
    const id = renderRes.headers.get("X-PDF-Id");
    const blob = await renderRes.blob();
    setPdfUrl(URL.createObjectURL(blob));
    return id;
  };

  const handleGenerateNudge = async () => {
    setNudgeLoading(true);
    setNudgeError(null);
    setIsEditingNudge(false);
    setEditableNudge("");
    try {
      const { name, role, company, yoe, intent, linkedinContext } = getValues();
      const res = await fetch("/api/nudge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, company, yoe, intent, linkedinContext }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `API error ${res.status}`);
      }
      const json = await res.json();
      setNudge(json.nudge);
    } catch (e) {
      setNudgeError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setNudgeLoading(false);
    }
  };

  const handleSendNudge = async () => {
    if (!nudge) return;
    const to = recipientPhone.trim();
    if (!to) {
      setToast({ message: "Enter a recipient WhatsApp number first.", type: "error" });
      return;
    }
    setSendingNudge(true);
    try {
      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: nudge, to }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Send error ${res.status}`);
      }
      setToast({ message: "Nudge sent to BDA on WhatsApp!", type: "success" });
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Failed to send nudge", type: "error" });
    } finally {
      setSendingNudge(false);
    }
  };

  const handleEditNudge = () => {
    if (!nudge) return;
    setEditableNudge(nudge);
    setIsEditingNudge(true);
  };

  const handleSaveNudge = () => {
    setNudge(editableNudge);
    setIsEditingNudge(false);
  };

  const handleCancelNudgeEdit = () => {
    setIsEditingNudge(false);
    setEditableNudge("");
  };

  const handleGeneratePdf = async () => {
    setPdfLoading(true);
    setPdfError(null);
    setQuestions([]);
    setPdf(null);
    setPdfId(null);
    setIsEditing(false);
    setEditablePdf(null);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }

    try {
      const { name, role, company, yoe, intent, linkedinContext, transcript: pastedTranscript, audio: audioFiles } = getValues();
      const audioFile = audioFiles?.[0] ?? null;
      let transcript = pastedTranscript?.trim() ?? "";

      if (!transcript && !audioFile) {
        throw new Error("Please paste a transcript or upload an audio file.");
      }

      if (!transcript && audioFile) {
        setPdfStatus("Transcribing audio…");
        const fd = new FormData();
        fd.append("audio", audioFile);
        const transcribeRes = await fetch("/api/transcribe", { method: "POST", body: fd });
        if (!transcribeRes.ok) {
          const err = await transcribeRes.json().catch(() => ({}));
          throw new Error(err.error ?? `Transcription error ${transcribeRes.status}`);
        }
        const { transcript: transcribed } = (await transcribeRes.json()) as { transcript: string };
        transcript = transcribed;
        setValue("transcript", transcribed);
      }

      setPdfStatus("Extracting open questions from transcript…");
      const extractRes = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      if (!extractRes.ok) {
        const err = await extractRes.json().catch(() => ({}));
        throw new Error(err.error ?? `Extract API error ${extractRes.status}`);
      }
      const extractData = await extractRes.json();
      const extracted: ExtractedQuestion[] = Array.isArray(extractData)
        ? extractData
        : (extractData.questions ?? []);
      setQuestions(extracted);

      setPdfStatus("Generating personalised PDF content…");
      const generateRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, company, yoe, intent, linkedinContext, questions: extracted }),
      });
      if (!generateRes.ok) {
        const err = await generateRes.json().catch(() => ({}));
        throw new Error(err.error ?? `Generate API error ${generateRes.status}`);
      }
      const { pdf: generated } = (await generateRes.json()) as { pdf: GeneratedPdf };
      setPdf(generated);

      setPdfStatus("Rendering PDF…");
      const id = await renderAndSetUrl(generated);
      setPdfId(id);
    } catch (e) {
      setPdfError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setPdfLoading(false);
      setPdfStatus(null);
    }
  };

  const handleApproveAndSend = async () => {
    if (!pdf || !pdfId) return;
    const to = leadPhone.trim();
    if (!to) {
      setToast({ message: "Enter the lead's WhatsApp number first.", type: "error" });
      return;
    }
    setSendingPdf(true);
    try {
      const pdfPublicUrl = `${window.location.origin}/api/pdf/${pdfId}`;
      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: pdf.whatsapp_message, to, pdfUrl: pdfPublicUrl }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Send error ${res.status}`);
      }
      setToast({ message: "PDF sent to lead on WhatsApp!", type: "success" });
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Failed to send PDF", type: "error" });
    } finally {
      setSendingPdf(false);
    }
  };

  const handleEdit = () => {
    if (!pdf) return;
    setEditablePdf(JSON.parse(JSON.stringify(pdf)));
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditablePdf(null);
  };

  const handleSaveAndRerender = async () => {
    if (!editablePdf) return;
    setPdfLoading(true);
    setPdfError(null);
    setPdfStatus("Re-rendering PDF…");
    try {
      const id = await renderAndSetUrl(editablePdf);
      setPdfId(id);
      setPdf(editablePdf);
      setIsEditing(false);
      setEditablePdf(null);
    } catch (e) {
      setPdfError(e instanceof Error ? e.message : "Failed to re-render");
    } finally {
      setPdfLoading(false);
      setPdfStatus(null);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}

      <div className="mx-auto max-w-4xl space-y-10">
        <h1 className="text-3xl font-bold text-gray-900">Scaler BDA Agent</h1>

        {/* ── Shared: Lead Profile ── */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Lead Profile</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input {...register("name")} className={inputCls} placeholder="Ananya Sharma" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Role</label>
                <input {...register("role")} className={inputCls} placeholder="Software Engineer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Company</label>
                <input {...register("company")} className={inputCls} placeholder="Infosys" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                <input type="number" {...register("yoe", { valueAsNumber: true })} className={inputCls} placeholder="4" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Intent / Goal</label>
                <input {...register("intent")} className={inputCls} placeholder="Transition to Data Science" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">LinkedIn Context</label>
              <textarea
                {...register("linkedinContext")}
                rows={3}
                className={inputCls}
                placeholder="Paste relevant LinkedIn details: degree, past companies, certifications, projects, or any context about the lead"
              />
            </div>
            {/* Phone numbers */}
            <div className="pt-2 border-t border-gray-100 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  BDA WhatsApp Number
                  <span className="ml-1 text-gray-400 font-normal">(nudge recipient)</span>
                </label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="+91XXXXXXXXXX"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Lead WhatsApp Number
                  <span className="ml-1 text-gray-400 font-normal">(PDF recipient)</span>
                </label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="+91XXXXXXXXXX"
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                />
              </div>
              <p className="col-span-full mt-0 text-xs text-gray-400">
                Both numbers must be joined to the Twilio WhatsApp sandbox. Format: +countrycode followed by number.
              </p>
            </div>
          </div>
        </section>

        {/* ── Section A: Pre-Sales Nudge ── */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800">A. Pre-Sales Nudge</h2>
            <p className="mt-1 text-xs text-gray-500">Run before the call. Sent to the BDA on WhatsApp.</p>
          </div>

          {nudgeError && (
            <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {nudgeError}
            </p>
          )}

          <button
            type="button"
            onClick={handleGenerateNudge}
            disabled={nudgeLoading}
            className="mb-6 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {nudgeLoading ? "Generating nudge…" : "Generate Nudge"}
          </button>

          <div className="rounded-xl bg-green-50 border border-green-200 p-4 min-h-24">
            {nudgeLoading ? (
              <p className="text-sm italic text-gray-400 animate-pulse">Generating nudge via Claude…</p>
            ) : nudge ? (
              <>
                {isEditingNudge ? (
                  <>
                    <textarea
                      className="w-full rounded-lg border border-green-300 bg-white px-3 py-2 text-sm text-gray-900 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-green-500"
                      rows={20}
                      value={editableNudge}
                      onChange={(e) => setEditableNudge(e.target.value)}
                    />
                    <p className="mt-1 text-xs text-gray-400">{editableNudge.length} chars</p>
                  </>
                ) : (
                  <NudgeRenderer text={nudge} />
                )}

                <div className="mt-4 pt-4 border-t border-green-200 flex flex-wrap gap-2">
                  {isEditingNudge ? (
                    <>
                      <button
                        type="button"
                        onClick={handleSaveNudge}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelNudgeEdit}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleEditNudge}
                        className="rounded-lg border border-green-300 bg-white px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={handleSendNudge}
                        disabled={sendingNudge}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {sendingNudge ? "Sending…" : "Send to BDA"}
                      </button>
                    </>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm italic text-gray-400">
                Nudge will appear here after you click Generate Nudge.
              </p>
            )}
          </div>
        </section>

        {/* ── Section B: Post-Call PDF ── */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800">B. Post-Call PDF</h2>
            <p className="mt-1 text-xs text-gray-500">
              Run after the call. Personalised PDF sent to the lead on WhatsApp.
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Call Transcript</label>
              <textarea
                {...register("transcript")}
                rows={5}
                className={inputCls}
                placeholder="Paste transcript here…"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Audio Upload (optional — will be transcribed if no transcript is pasted)
              </label>
              <input
                type="file"
                accept="audio/*"
                {...register("audio")}
                className="mt-1 block text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
          </div>

          {pdfError && (
            <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {pdfError}
            </p>
          )}

          <button
            type="button"
            onClick={handleGeneratePdf}
            disabled={pdfLoading}
            className="mb-6 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pdfLoading ? (pdfStatus ?? "Working…") : "Generate PDF"}
          </button>

          <div className="rounded-xl bg-gray-50 border border-gray-200 p-6 min-h-40">
            {pdfLoading ? (
              <p className="text-sm italic text-gray-400 animate-pulse">{pdfStatus ?? "Working…"}</p>
            ) : pdf ? (
              <>
                <QuestionsPreview questions={questions} />

                {isEditing && editablePdf ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-700">Editing PDF content</p>
                      <span className="text-xs text-gray-400">Changes re-render the PDF on save</span>
                    </div>
                    <EditablePdfForm value={editablePdf} onChange={setEditablePdf} />
                    <div className="flex gap-3 pt-2 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={handleSaveAndRerender}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                      >
                        Save &amp; Re-render PDF
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <PdfPreview pdf={pdf} />

                    <div className="flex flex-wrap items-center gap-3 mt-6">
                      {pdfUrl ? (
                        <a
                          href={pdfUrl}
                          download="scaler-roadmap.pdf"
                          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                        >
                          Download PDF
                        </a>
                      ) : (
                        <span className="rounded-lg bg-indigo-200 px-4 py-2 text-sm font-medium text-indigo-400 cursor-wait">
                          Rendering PDF…
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={handleApproveAndSend}
                        disabled={sendingPdf || !pdfId}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {sendingPdf ? "Sending…" : "Approve & Send"}
                      </button>
                      <button
                        type="button"
                        onClick={handleEdit}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50"
                      >
                        Skip
                      </button>
                    </div>

                    {pdfId && (
                      <div className="mt-6">
                        <p className="text-xs font-medium text-gray-500 mb-2">PDF Preview</p>
                        <iframe
                          src={`/api/pdf/${pdfId}`}
                          title="PDF Preview"
                          className="w-full rounded-lg border border-gray-200 shadow-sm"
                          style={{ height: "600px" }}
                        />
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-center py-4">
                <p className="text-sm italic text-gray-400">PDF preview will appear here.</p>
                <div className="flex gap-3 mt-2 opacity-40 pointer-events-none select-none">
                  <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white">Download PDF</button>
                  <button className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white">Approve &amp; Send</button>
                  <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700">Edit</button>
                  <button className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-500">Skip</button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
