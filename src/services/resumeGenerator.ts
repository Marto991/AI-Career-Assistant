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
          // Header with contact info - Professional sizing (16-18pt equivalent)
          new Paragraph({
            children: [
              new TextRun({
                text: contactInfo.split('\n')[0], // Name on first line
                bold: true,
                size: 32, // 16pt (size is in half-points)
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: contactInfo.split('\n').slice(1).join(' | '), // Contact details on one line with pipes
                size: 20, // 10pt
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          }),

          // Professional Summary - Critical first section
          ...(result.revisedResume.summary.revised ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: "PROFESSIONAL SUMMARY",
                  bold: true,
                  size: 24, // 12pt
                  allCaps: true,
                }),
              ],
              spacing: { before: 100, after: 150 },
              border: {
                bottom: {
                  color: "000000",
                  space: 1,
                  style: "single",
                  size: 6,
                },
              },
            }),
            new Paragraph({
              text: result.revisedResume.summary.revised,
              spacing: { after: 250, line: 360 }, // 1.5 line spacing
            }),
          ] : []),

          // Skills Section - Place before Experience for technical roles
          new Paragraph({
            children: [
              new TextRun({
                text: "TECHNICAL SKILLS",
                bold: true,
                size: 24,
                allCaps: true,
              }),
            ],
            spacing: { before: 100, after: 150 },
            border: {
              bottom: {
                color: "000000",
                space: 1,
                style: "single",
                size: 6,
              },
            },
          }),
          new Paragraph({
            text: [...result.revisedResume.skills.revised, ...result.revisedResume.skills.added].join(" • "),
            spacing: { after: 250, line: 360 },
          }),

          // Experience Section
          new Paragraph({
            children: [
              new TextRun({
                text: "PROFESSIONAL EXPERIENCE",
                bold: true,
                size: 24,
                allCaps: true,
              }),
            ],
            spacing: { before: 100, after: 150 },
            border: {
              bottom: {
                color: "000000",
                space: 1,
                style: "single",
                size: 6,
              },
            },
          }),
          ...result.revisedResume.experience.flatMap((exp) => [
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.title,
                  bold: true,
                  size: 22, // 11pt
                }),
                new TextRun({
                  text: ` | ${exp.company}`,
                  size: 22,
                }),
              ],
              spacing: { before: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.dates,
                  italics: true,
                  size: 20,
                }),
                ...(exp.location ? [new TextRun({ text: ` | ${exp.location}`, italics: true, size: 20 })] : []),
              ],
              spacing: { after: 100 },
            }),
            ...exp.revisedBullets.map(
              (bullet) =>
                new Paragraph({
                  text: bullet,
                  bullet: { level: 0 },
                  spacing: { after: 80, line: 360 }, // Better spacing between bullets
                  indent: { left: 360 }, // Proper bullet indentation
                })
            ),
          ]),

          // Education Section
          new Paragraph({
            children: [
              new TextRun({
                text: "EDUCATION",
                bold: true,
                size: 24,
                allCaps: true,
              }),
            ],
            spacing: { before: 100, after: 150 },
            border: {
              bottom: {
                color: "000000",
                space: 1,
                style: "single",
                size: 6,
              },
            },
          }),
          new Paragraph({
            text: result.revisedResume.education.revised,
            spacing: { after: 200, line: 360 },
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
