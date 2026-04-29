export type PdfSection = {
  title: string;
  content: string;
  evidence: string[];
  source_note: string;
};

export type GeneratedPdf = {
  persona: string;
  headline: string;
  greeting: string;
  sections: PdfSection[];
  cta: {
    headline: string;
    body: string;
    test_framing: string;
  };
  whatsapp_message: string;
};

export type ExtractedQuestion = {
  question: string;
  category: "pricing_roi" | "curriculum_depth" | "placement_outcomes" | "program_fit" | "logistics" | "credibility";
  urgency: "high" | "medium" | "low";
  bda_response_quality: "unanswered" | "weak" | "partial";
};
