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

          // Education Section - Placed right after Professional Summary
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
          ...result.revisedResume.education.map((edu, index) => 
            new Paragraph({
              children: [
                new TextRun({
                  text: `${edu.degree} | ${edu.institution}`,
                  bold: true,
                  size: 22,
                }),
                new TextRun({
                  text: ` | ${edu.dates}`,
                  size: 22,
                }),
                ...(edu.details ? [
                  new TextRun({
                    text: `\n${edu.details}`,
                    size: 20,
                  }),
                ] : []),
              ],
              spacing: { 
                after: index === result.revisedResume.education.length - 1 ? 250 : 120, 
                line: 360 
              },
            })
          ),

          // Skills Section - Organized by categories
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
          ...result.revisedResume.skills.categories.flatMap(category => [
            new Paragraph({
              children: [
                new TextRun({
                  text: `${category.name}: `,
                  bold: true,
                  size: 22,
                }),
                new TextRun({
                  text: category.skills.join(", "),
                  size: 22,
                }),
              ],
              spacing: { after: 120, line: 360 },
              bullet: { level: 0 },
              indent: { left: 360 },
            }),
          ]),
          ...(result.revisedResume.skills.added.length > 0 ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Additional Skills: ",
                  bold: true,
                  size: 22,
                }),
                new TextRun({
                  text: result.revisedResume.skills.added.join(", "),
                  size: 22,
                }),
              ],
              spacing: { after: 250, line: 360 },
              bullet: { level: 0 },
              indent: { left: 360 },
            }),
          ] : []),

          // Projects Section
          ...(result.revisedResume.projects && result.revisedResume.projects.length > 0 ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: "PROJECTS",
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
            ...result.revisedResume.projects.flatMap((project) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: project.title,
                    bold: true,
                    size: 22,
                  }),
                ],
                spacing: { before: 200 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: project.description,
                    size: 20,
                  }),
                ],
                spacing: { after: 60 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Technologies: ",
                    bold: true,
                    size: 20,
                  }),
                  new TextRun({
                    text: project.technologies.join(", "),
                    italics: true,
                    size: 20,
                  }),
                ],
                spacing: { after: 100 },
              }),
              ...project.bullets.map(
                (bullet) =>
                  new Paragraph({
                    text: bullet,
                    bullet: { level: 0 },
                    spacing: { after: 80, line: 360 },
                    indent: { left: 360 },
                  })
              ),
            ]),
          ] : []),

          // Professional Experience Section
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
                  size: 22,
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
                  spacing: { after: 80, line: 360 },
                  indent: { left: 360 },
                })
            ),
          ]),

          // Honors & Affiliations Section
          ...(result.revisedResume.honors && result.revisedResume.honors.length > 0 ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: "HONORS & AFFILIATIONS",
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
            ...result.revisedResume.honors.map(
              (honor) =>
                new Paragraph({
                  text: honor,
                  bullet: { level: 0 },
                  spacing: { after: 120, line: 360 },
                  indent: { left: 360 },
                })
            ),
          ] : []),
        ],
      },
    ],
  });

  return doc;
};

export const generateCoverLetterDocument = (coverLetter: string, contactInfo: string) => {
  const contactLines = contactInfo.split('\n').filter(line => line.trim());
  const name = contactLines[0] || '';
  const contactDetails = contactLines.slice(1).join(' | ');

  // Parse cover letter paragraphs, filtering empty ones
  const paragraphs = coverLetter.split('\n\n').filter(p => p.trim());

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.75),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(0.75),
              left: convertInchesToTwip(1),
            },
          },
        },
        children: [
          // Header - Name centered and bold (matching resume style)
          new Paragraph({
            children: [
              new TextRun({
                text: name,
                bold: true,
                size: 32, // 16pt
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          }),
          // Contact details on one line with pipes (matching resume style)
          new Paragraph({
            children: [
              new TextRun({
                text: contactDetails,
                size: 20, // 10pt
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          // Date - right aligned
          new Paragraph({
            children: [
              new TextRun({
                text: new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }),
                size: 22,
              }),
            ],
            alignment: AlignmentType.LEFT,
            spacing: { after: 400 },
          }),
          // Cover letter body paragraphs - justified for even distribution
          ...paragraphs.map(
            (para, index) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: para.trim(),
                    size: 22, // 11pt
                  }),
                ],
                alignment: AlignmentType.JUSTIFIED,
                spacing: { 
                  after: index === paragraphs.length - 1 ? 0 : 280,
                  line: 276, // 1.15 line spacing
                },
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
