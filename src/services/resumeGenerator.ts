import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, convertInchesToTwip } from "docx";
import { saveAs } from "file-saver";
import type { AnalysisResult } from "@/pages/Index";

export const generateResumeDocument = async (result: AnalysisResult, originalResume: string) => {
  // Extract contact info from original resume (first few lines typically)
  const resumeLines = originalResume.split('\n').filter(line => line.trim());
  const contactInfo = resumeLines.slice(0, 3).join('\n');

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.5),
              right: convertInchesToTwip(0.5),
              bottom: convertInchesToTwip(0.5),
              left: convertInchesToTwip(0.5),
            },
          },
        },
        children: [
          // Header with contact info
          new Paragraph({
            text: contactInfo,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),

          // Professional Summary
          ...(result.revisedResume.summary.revised ? [
            new Paragraph({
              text: "PROFESSIONAL SUMMARY",
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
              text: result.revisedResume.summary.revised,
              spacing: { after: 200 },
            }),
          ] : []),

          // Experience Section
          new Paragraph({
            text: "PROFESSIONAL EXPERIENCE",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
          }),
          ...result.revisedResume.experience.flatMap((exp) => [
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.title,
                  bold: true,
                }),
                new TextRun({
                  text: ` | ${exp.company}`,
                }),
              ],
              spacing: { before: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.dates,
                  italics: true,
                }),
                ...(exp.location ? [new TextRun({ text: ` | ${exp.location}`, italics: true })] : []),
              ],
              spacing: { after: 50 },
            }),
            ...exp.revisedBullets.map(
              (bullet) =>
                new Paragraph({
                  text: bullet,
                  bullet: { level: 0 },
                  spacing: { after: 50 },
                })
            ),
          ]),

          // Skills Section
          new Paragraph({
            text: "SKILLS",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            text: [...result.revisedResume.skills.revised, ...result.revisedResume.skills.added].join(" • "),
            spacing: { after: 200 },
          }),

          // Education Section
          new Paragraph({
            text: "EDUCATION",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            text: result.revisedResume.education.revised,
          }),
        ],
      },
    ],
  });

  return doc;
};

export const generateCoverLetterDocument = (coverLetter: string, contactInfo: string) => {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        children: [
          new Paragraph({
            text: contactInfo,
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            spacing: { after: 200 },
          }),
          ...coverLetter.split('\n\n').map(
            (para) =>
              new Paragraph({
                text: para.trim(),
                spacing: { after: 200 },
              })
          ),
        ],
      },
    ],
  });

  return doc;
};

export const downloadResume = async (result: AnalysisResult, originalResume: string) => {
  const { Packer } = await import("docx");
  const doc = await generateResumeDocument(result, originalResume);
  const blob = await Packer.toBlob(doc);
  saveAs(blob, "Revised_Resume.docx");
};

export const downloadCoverLetter = async (coverLetter: string, originalResume: string) => {
  const { Packer } = await import("docx");
  const resumeLines = originalResume.split('\n').filter(line => line.trim());
  const contactInfo = resumeLines.slice(0, 3).join('\n');
  const doc = generateCoverLetterDocument(coverLetter, contactInfo);
  const blob = await Packer.toBlob(doc);
  saveAs(blob, "Cover_Letter.docx");
};

export const downloadBoth = async (result: AnalysisResult, originalResume: string) => {
  await downloadResume(result, originalResume);
  // Small delay to avoid browser blocking multiple downloads
  await new Promise(resolve => setTimeout(resolve, 500));
  await downloadCoverLetter(result.coverLetter, originalResume);
};
