import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import type { GeneratedPdf, PdfSection } from "@/app/api/generate/route";

// ─── SKEPTICAL_SWITCHER ────────────────────────────────────────────────────────
const ssStyles = StyleSheet.create({
  page: { backgroundColor: "#ffffff", paddingTop: 0, paddingBottom: 40, fontFamily: "Helvetica" },
  header: { backgroundColor: "#1a1a2e", paddingHorizontal: 36, paddingTop: 28, paddingBottom: 24 },
  headerBrand: { color: "#6699ff", fontFamily: "Helvetica-Bold", fontSize: 10, letterSpacing: 3, marginBottom: 10 },
  headerHeadline: { color: "#ffffff", fontFamily: "Helvetica-Bold", fontSize: 20, lineHeight: 1.25, marginBottom: 4 },
  headerSub: { color: "#9999bb", fontFamily: "Helvetica", fontSize: 9 },
  body: { paddingHorizontal: 36, paddingTop: 20 },
  greeting: { fontSize: 9.5, color: "#333344", lineHeight: 1.6, marginBottom: 18 },
  section: {
    marginBottom: 16, borderLeftWidth: 3, borderLeftColor: "#0066cc",
    borderLeftStyle: "solid", paddingLeft: 12,
  },
  sectionTitle: { fontFamily: "Helvetica-Bold", fontSize: 10.5, color: "#1a1a2e", marginBottom: 6 },
  sectionContent: { fontSize: 9, color: "#333344", lineHeight: 1.65, marginBottom: 8 },
  evidenceList: { marginBottom: 8 },
  evidenceItem: {
    flexDirection: "row", marginBottom: 3,
  },
  evidenceDot: { color: "#0066cc", fontFamily: "Helvetica-Bold", fontSize: 9, marginRight: 6, marginTop: 0.5 },
  evidenceText: { fontSize: 8.5, color: "#1a1a2e", flex: 1, lineHeight: 1.5 },
  sourceNote: { fontSize: 7.5, color: "#8888aa", fontFamily: "Helvetica-Oblique" },
  ctaBox: {
    marginTop: 18, marginHorizontal: 36, borderWidth: 1.5, borderColor: "#0066cc",
    borderStyle: "solid", borderRadius: 4, padding: 16,
  },
  ctaHeadline: { fontFamily: "Helvetica-Bold", fontSize: 11, color: "#1a1a2e", marginBottom: 5 },
  ctaBody: { fontSize: 9, color: "#333344", lineHeight: 1.6, marginBottom: 6 },
  ctaTestFrame: { fontSize: 8.5, color: "#0066cc", fontFamily: "Helvetica-Oblique" },
  footer: {
    position: "absolute", bottom: 18, left: 36, right: 36,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    borderTopWidth: 0.5, borderTopColor: "#ccccdd", borderTopStyle: "solid", paddingTop: 6,
  },
  footerText: { fontSize: 7, color: "#9999aa" },
  pageNumber: { fontSize: 7, color: "#9999aa" },
});

function SSSection({ s }: { s: PdfSection }) {
  return (
    <View style={ssStyles.section}>
      <Text style={ssStyles.sectionTitle}>{s.title.toUpperCase()}</Text>
      <Text style={ssStyles.sectionContent}>{s.content}</Text>
      {s.evidence.length > 0 && (
        <View style={ssStyles.evidenceList}>
          {s.evidence.map((e, i) => (
            <View key={i} style={ssStyles.evidenceItem}>
              <Text style={ssStyles.evidenceDot}>›</Text>
              <Text style={ssStyles.evidenceText}>{e}</Text>
            </View>
          ))}
        </View>
      )}
      {s.source_note ? <Text style={ssStyles.sourceNote}>Source: {s.source_note}</Text> : null}
    </View>
  );
}

function SkepticalSwitcherPdf({ data }: { data: GeneratedPdf }) {
  return (
    <Document>
      <Page size="A4" style={ssStyles.page}>
        <View style={ssStyles.header}>
          <Text style={ssStyles.headerBrand}>SCALER</Text>
          <Text style={ssStyles.headerHeadline}>{data.headline}</Text>
          <Text style={ssStyles.headerSub}>{data.greeting}</Text>
        </View>

        <View style={ssStyles.body}>
          {data.sections.map((s, i) => <SSSection key={i} s={s} />)}
        </View>

        <View style={ssStyles.ctaBox} wrap={false}>
          <Text style={ssStyles.ctaHeadline}>{data.cta.headline}</Text>
          <Text style={ssStyles.ctaBody}>{data.cta.body}</Text>
        </View>

        <View style={ssStyles.footer} fixed>
          <Text style={ssStyles.footerText}>Data sourced from audited reports. Details on scaler.com</Text>
          <Text style={ssStyles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

// ─── SENIOR_VALIDATOR ──────────────────────────────────────────────────────────
const svStyles = StyleSheet.create({
  page: { backgroundColor: "#fafaf8", paddingTop: 32, paddingBottom: 44, fontFamily: "Times-Roman" },
  header: { paddingHorizontal: 40, marginBottom: 6 },
  headerRule: { borderBottomWidth: 1.5, borderBottomColor: "#2d2d2d", borderBottomStyle: "solid", marginBottom: 14 },
  headerBrand: { fontFamily: "Helvetica-Bold", fontSize: 9, color: "#1a5c2a", letterSpacing: 4, marginBottom: 10 },
  headerMeta: { fontFamily: "Helvetica", fontSize: 8, color: "#888878", marginBottom: 6 },
  headerHeadline: { fontFamily: "Times-Bold", fontSize: 18, color: "#2d2d2d", lineHeight: 1.3, marginBottom: 6 },
  greeting: { fontFamily: "Times-Roman", fontSize: 10, color: "#3d3d3d", lineHeight: 1.7, marginBottom: 20 },
  body: { paddingHorizontal: 40 },
  section: {
    marginBottom: 18, backgroundColor: "#f5f0eb",
    paddingHorizontal: 14, paddingVertical: 12,
    borderLeftWidth: 3, borderLeftColor: "#1a5c2a", borderLeftStyle: "solid",
  },
  sectionTitle: { fontFamily: "Helvetica-Bold", fontSize: 9, color: "#2d2d2d", marginBottom: 7, letterSpacing: 0.5 },
  sectionContent: { fontFamily: "Times-Roman", fontSize: 9.5, color: "#3d3d3d", lineHeight: 1.7, marginBottom: 8 },
  evidenceList: { marginBottom: 6 },
  evidenceItem: { flexDirection: "row", marginBottom: 4 },
  evidenceDash: { fontFamily: "Times-Roman", fontSize: 9, color: "#1a5c2a", marginRight: 7 },
  evidenceText: { fontFamily: "Times-Roman", fontSize: 9, color: "#2d2d2d", flex: 1, lineHeight: 1.55 },
  sourceNote: { fontFamily: "Times-Italic", fontSize: 7.5, color: "#9a9a88" },
  ctaBox: {
    marginTop: 16, marginHorizontal: 40, borderWidth: 1, borderColor: "#1a5c2a",
    borderStyle: "solid", padding: 16,
  },
  ctaHeadline: { fontFamily: "Helvetica-Bold", fontSize: 10.5, color: "#1a5c2a", marginBottom: 5 },
  ctaBody: { fontFamily: "Times-Roman", fontSize: 9.5, color: "#3d3d3d", lineHeight: 1.6, marginBottom: 5 },
  ctaTestFrame: { fontFamily: "Times-Italic", fontSize: 8.5, color: "#2d2d2d" },
  footer: {
    position: "absolute", bottom: 20, left: 40, right: 40,
    flexDirection: "row", justifyContent: "space-between",
  },
  footerText: { fontFamily: "Times-Italic", fontSize: 7, color: "#9a9a88" },
  pageNumber: { fontFamily: "Times-Roman", fontSize: 7, color: "#9a9a88" },
});

function SVSection({ s }: { s: PdfSection }) {
  return (
    <View style={svStyles.section}>
      <Text style={svStyles.sectionTitle}>{s.title}</Text>
      <Text style={svStyles.sectionContent}>{s.content}</Text>
      {s.evidence.length > 0 && (
        <View style={svStyles.evidenceList}>
          {s.evidence.map((e, i) => (
            <View key={i} style={svStyles.evidenceItem}>
              <Text style={svStyles.evidenceDash}>—</Text>
              <Text style={svStyles.evidenceText}>{e}</Text>
            </View>
          ))}
        </View>
      )}
      {s.source_note ? <Text style={svStyles.sourceNote}>{s.source_note}</Text> : null}
    </View>
  );
}

function SeniorValidatorPdf({ data }: { data: GeneratedPdf }) {
  return (
    <Document>
      <Page size="A4" style={svStyles.page}>
        <View style={svStyles.header}>
          <Text style={svStyles.headerBrand}>SCALER</Text>
          <View style={svStyles.headerRule} />
          <Text style={svStyles.headerHeadline}>{data.headline}</Text>
          <Text style={svStyles.greeting}>{data.greeting}</Text>
        </View>

        <View style={svStyles.body}>
          {data.sections.map((s, i) => <SVSection key={i} s={s} />)}
        </View>

        <View style={svStyles.ctaBox} wrap={false}>
          <Text style={svStyles.ctaHeadline}>{data.cta.headline}</Text>
          <Text style={svStyles.ctaBody}>{data.cta.body}</Text>
        </View>

        <View style={svStyles.footer} fixed>
          <Text style={svStyles.footerText}>For detailed module breakdown, contact your program advisor</Text>
          <Text style={svStyles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

// ─── ANXIOUS_ASPIRER ───────────────────────────────────────────────────────────
const aaStyles = StyleSheet.create({
  page: { backgroundColor: "#ffffff", paddingBottom: 50, fontFamily: "Helvetica" },
  header: {
    backgroundColor: "#6b21a8", paddingHorizontal: 36, paddingTop: 30, paddingBottom: 28,
    alignItems: "center",
  },
  headerBrand: { fontFamily: "Helvetica-Bold", fontSize: 11, color: "#e9d5ff", letterSpacing: 5, marginBottom: 14 },
  headerHeadline: { fontFamily: "Helvetica-Bold", fontSize: 17, color: "#ffffff", textAlign: "center", lineHeight: 1.35, marginBottom: 4 },
  headerGreeting: { fontFamily: "Helvetica", fontSize: 9.5, color: "#e9d5ff", textAlign: "center", lineHeight: 1.6 },
  body: { paddingHorizontal: 32, paddingTop: 22 },
  section: {
    marginBottom: 18, backgroundColor: "#f3e8ff",
    borderRadius: 6, paddingHorizontal: 16, paddingVertical: 14,
  },
  sectionTitle: { fontFamily: "Helvetica-Bold", fontSize: 11, color: "#6b21a8", marginBottom: 8 },
  sectionContent: { fontSize: 10, color: "#3d1a5e", lineHeight: 1.75, marginBottom: 10 },
  evidenceList: { marginBottom: 8 },
  evidenceItem: { flexDirection: "row", marginBottom: 5 },
  evidenceCheck: { fontFamily: "Helvetica-Bold", fontSize: 10, color: "#6b21a8", marginRight: 7 },
  evidenceText: { fontSize: 9.5, color: "#3d1a5e", flex: 1, lineHeight: 1.55 },
  sourceNote: { fontSize: 7.5, color: "#9966cc", fontFamily: "Helvetica-Oblique" },
  ctaBox: {
    marginTop: 18, marginHorizontal: 32, backgroundColor: "#ea580c",
    borderRadius: 6, paddingHorizontal: 20, paddingVertical: 18,
  },
  ctaHeadline: { fontFamily: "Helvetica-Bold", fontSize: 13, color: "#ffffff", marginBottom: 6 },
  ctaBody: { fontSize: 10, color: "#fff7ed", lineHeight: 1.65, marginBottom: 8 },
  ctaTestFrame: { fontSize: 9, color: "#ffedd5", fontFamily: "Helvetica-Oblique" },
  footer: {
    position: "absolute", bottom: 18, left: 32, right: 32,
    borderTopWidth: 0.5, borderTopColor: "#d8b4fe", borderTopStyle: "solid",
    paddingTop: 8, flexDirection: "row", justifyContent: "space-between",
  },
  footerText: { fontSize: 7.5, color: "#9966cc", fontFamily: "Helvetica-Oblique" },
  pageNumber: { fontSize: 7.5, color: "#9966cc" },
});

function AASection({ s }: { s: PdfSection }) {
  return (
    <View style={aaStyles.section}>
      <Text style={aaStyles.sectionTitle}>{s.title}</Text>
      <Text style={aaStyles.sectionContent}>{s.content}</Text>
      {s.evidence.length > 0 && (
        <View style={aaStyles.evidenceList}>
          {s.evidence.map((e, i) => (
            <View key={i} style={aaStyles.evidenceItem}>
              <Text style={aaStyles.evidenceCheck}>+</Text>
              <Text style={aaStyles.evidenceText}>{e}</Text>
            </View>
          ))}
        </View>
      )}
      {s.source_note ? <Text style={aaStyles.sourceNote}>Source: {s.source_note}</Text> : null}
    </View>
  );
}

function AnxiousAspirer({ data }: { data: GeneratedPdf }) {
  return (
    <Document>
      <Page size="A4" style={aaStyles.page}>
        <View style={aaStyles.header}>
          <Text style={aaStyles.headerBrand}>SCALER</Text>
          <Text style={aaStyles.headerHeadline}>{data.headline}</Text>
          <Text style={aaStyles.headerGreeting}>{data.greeting}</Text>
        </View>

        <View style={aaStyles.body}>
          {data.sections.map((s, i) => <AASection key={i} s={s} />)}
        </View>

        <View style={aaStyles.ctaBox} wrap={false}>
          <Text style={aaStyles.ctaHeadline}>{data.cta.headline}</Text>
          <Text style={aaStyles.ctaBody}>{data.cta.body}</Text>
        </View>

        <View style={aaStyles.footer} fixed>
          <Text style={aaStyles.footerText}>Questions? Your advisor is here to help. No pressure, no timeline.</Text>
          <Text style={aaStyles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

// ─── Factory ───────────────────────────────────────────────────────────────────
export function buildPdfDocument(data: GeneratedPdf): React.ReactElement<DocumentProps> {
  switch (data.persona) {
    case "SKEPTICAL_SWITCHER":
      return <SkepticalSwitcherPdf data={data} />;
    case "SENIOR_VALIDATOR":
      return <SeniorValidatorPdf data={data} />;
    case "ANXIOUS_ASPIRER":
      return <AnxiousAspirer data={data} />;
    default:
      return <SkepticalSwitcherPdf data={data} />;
  }
}
