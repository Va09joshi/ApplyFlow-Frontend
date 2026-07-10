import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, ExternalHyperlink } from "docx";
import { ResumeBuilderData } from "@/types/resume";

const normalizeUrl = (value: string) => (value.startsWith("http") ? value : `https://${value}`);

export const exportToPDF = async (elementId: string, data: ResumeBuilderData, filename: string = "resume.pdf") => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "pt", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);
  for (let pageOffset = pdfHeight; pageOffset < imgHeight; pageOffset += pdfHeight) {
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, -pageOffset, pdfWidth, imgHeight);
  }

  if (data.personalInfo.linkedin) {
    pdf.link(0, 0, pdfWidth, 40, { url: normalizeUrl(data.personalInfo.linkedin) });
  }

  pdf.save(filename);
};

export const exportToDOCX = async (data: ResumeBuilderData, filename: string = "resume.docx") => {
  const children: any[] = [];

  // Header
  const contactChildren: (TextRun | ExternalHyperlink)[] = [
    new TextRun(data.personalInfo.email + " | "),
    new TextRun(data.personalInfo.phone + " | "),
    new TextRun(data.personalInfo.location),
  ];

  if (data.personalInfo.linkedin) {
    contactChildren.push(new TextRun(" | "));
    contactChildren.push(
      new ExternalHyperlink({
        children: [
          new TextRun({
            text: "LinkedIn",
            style: "Hyperlink",
          }),
        ],
        link: normalizeUrl(data.personalInfo.linkedin),
      })
    );
  }

  if (data.personalInfo.github) {
    contactChildren.push(new TextRun(" | "));
    contactChildren.push(
      new ExternalHyperlink({
        children: [
          new TextRun({
            text: "GitHub",
            style: "Hyperlink",
          }),
        ],
        link: normalizeUrl(data.personalInfo.github),
      })
    );
  }

  if (data.personalInfo.portfolio) {
    contactChildren.push(new TextRun(" | "));
    contactChildren.push(
      new ExternalHyperlink({
        children: [
          new TextRun({
            text: "Portfolio",
            style: "Hyperlink",
          }),
        ],
        link: normalizeUrl(data.personalInfo.portfolio),
      })
    );
  }

  children.push(
    new Paragraph({
      text: data.personalInfo.fullName,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 }
    }),
    new Paragraph({
      children: contactChildren,
      spacing: { after: 400 }
    })
  );

  if (data.summary) {
    children.push(
      new Paragraph({ text: "Professional Summary", heading: HeadingLevel.HEADING_2 }),
      new Paragraph({ text: data.summary, spacing: { after: 400 } })
    );
  }

  if (data.experience && data.experience.length > 0) {
    children.push(new Paragraph({ text: "Experience", heading: HeadingLevel.HEADING_2 }));
    data.experience.forEach(exp => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.jobTitle, bold: true }),
            new TextRun(` at ${exp.company}`),
          ]
        }),
        new Paragraph({
          text: `${exp.startDate} - ${exp.endDate || 'Present'}`,
          spacing: { after: 100 }
        }),
        new Paragraph({
          text: exp.description,
          spacing: { after: 300 }
        })
      );
    });
  }

  if (data.projects && data.projects.length > 0) {
    children.push(new Paragraph({ text: "Projects", heading: HeadingLevel.HEADING_2 }));
    data.projects.forEach(proj => {
      const projHeaderChildren: (TextRun | ExternalHyperlink)[] = [new TextRun({ text: proj.name, bold: true })];
      if (proj.link) {
        projHeaderChildren.push(new TextRun(" - "));
        projHeaderChildren.push(
          new ExternalHyperlink({
            children: [
              new TextRun({
                text: "Link",
                style: "Hyperlink",
              }),
            ],
            link: normalizeUrl(proj.link),
          })
        );
      }
      
      children.push(
        new Paragraph({
          children: projHeaderChildren,
          spacing: { after: 100 }
        }),
        new Paragraph({
          text: proj.description,
          spacing: { after: 300 }
        })
      );
    });
  }

  if (data.education && data.education.length > 0) {
    children.push(new Paragraph({ text: "Education", heading: HeadingLevel.HEADING_2 }));
    data.education.forEach(edu => {
      let locationText = edu.location || "";
      if (edu.score) {
        locationText = edu.score + (locationText ? " | " + locationText : "");
      }
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.school, bold: true }),
            new TextRun(`  ${edu.startDate} - ${edu.endDate || 'Present'}`),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: edu.degree, italics: true }),
            new TextRun(`  ${locationText}`),
          ],
          spacing: { after: 300 }
        })
      );
    });
  }

  // Certifications
  if (data.certifications && data.certifications.length > 0) {
    children.push(new Paragraph({ text: "Certifications", heading: HeadingLevel.HEADING_2 }));
    data.certifications.forEach(cert => {
      const certChildren: (TextRun | ExternalHyperlink)[] = [
        new TextRun({ text: cert.name, bold: true }),
      ];
      if (cert.issuer) {
        certChildren.push(new TextRun(` — ${cert.issuer}`));
      }
      if (cert.date) {
        certChildren.push(new TextRun({ text: `  (${cert.date})`, italics: true }));
      }
      if (cert.link) {
        certChildren.push(new TextRun(" — "));
        certChildren.push(
          new ExternalHyperlink({
            children: [new TextRun({ text: "Verify", style: "Hyperlink" })],
            link: normalizeUrl(cert.link),
          })
        );
      }
      children.push(
        new Paragraph({ children: certChildren, spacing: { after: 200 } })
      );
    });
  }

  // Achievements
  if (data.achievements && data.achievements.length > 0) {
    children.push(new Paragraph({ text: "Achievements", heading: HeadingLevel.HEADING_2 }));
    data.achievements.forEach(ach => {
      const achChildren: TextRun[] = [];
      if (ach.title) {
        achChildren.push(new TextRun({ text: ach.title + (ach.description ? ": " : ""), bold: true }));
      }
      if (ach.description) {
        achChildren.push(new TextRun(ach.description));
      }
      children.push(
        new Paragraph({ children: achChildren, spacing: { after: 200 } })
      );
    });
  }

  if (data.skills && data.skills.length > 0) {
    children.push(new Paragraph({ text: "Skills", heading: HeadingLevel.HEADING_2 }));
    data.skills.forEach(skill => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${skill.category}: `, bold: true }),
            new TextRun(skill.items),
          ],
          spacing: { after: 100 }
        })
      );
    });
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: data.font || "Arial",
          },
        },
      },
    },
    sections: [{ children }]
  });

  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
