import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, ExternalHyperlink } from "docx";
import { ResumeBuilderData } from "@/types/resume";

const normalizeUrl = (value: string) => (value.startsWith("http") ? value : `https://${value}`);

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const linkText = (value: string) => escapeHtml(value.startsWith("http") ? value.replace(/^https?:\/\//, "") : value);

const renderListLines = (text: string) =>
  text
    .split("\n")
    .filter(Boolean)
    .map((line) => `<div style="position:relative; padding-left:12px; margin-bottom:2px;"><span style="position:absolute; left:0; color:#143c78;">•</span><span>${escapeHtml(line.replace(/^[-•*]\s*/, ""))}</span></div>`)
    .join("");

const buildResumeMarkup = (data: ResumeBuilderData) => {
  const personalInfo = {
    fullName: data.personalInfo?.fullName || "Your Name",
    email: data.personalInfo?.email || "",
    phone: data.personalInfo?.phone || "",
    location: data.personalInfo?.location || "",
    linkedin: data.personalInfo?.linkedin || "",
    portfolio: data.personalInfo?.portfolio || "",
    github: data.personalInfo?.github || "",
  };

  const sectionStyle = "margin-bottom:16px;";
  const headingStyle = "font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#143c78; border-bottom:1px solid #143c78; padding-bottom:2px; margin:0 0 6px;";
  const smallMuted = "color:#5a5a5a; font-size:12px;";

  const contacts = [
    personalInfo.phone ? `<span>${escapeHtml(personalInfo.phone)}</span>` : "",
    personalInfo.email ? `<a href=\"mailto:${escapeHtml(personalInfo.email)}\" style=\"color:#143c78; text-decoration:none;\">${escapeHtml(personalInfo.email)}</a>` : "",
    personalInfo.linkedin ? `<a href=\"${normalizeUrl(personalInfo.linkedin)}\" target=\"_blank\" rel=\"noreferrer\" style=\"color:#143c78; text-decoration:none;\">LinkedIn</a>` : "",
    personalInfo.github ? `<a href=\"${normalizeUrl(personalInfo.github)}\" target=\"_blank\" rel=\"noreferrer\" style=\"color:#143c78; text-decoration:none;\">GitHub</a>` : "",
    personalInfo.portfolio ? `<a href=\"${normalizeUrl(personalInfo.portfolio)}\" target=\"_blank\" rel=\"noreferrer\" style=\"color:#143c78; text-decoration:none;\">Portfolio</a>` : "",
    personalInfo.location ? `<span>${escapeHtml(personalInfo.location)}</span>` : "",
  ].filter(Boolean).join(`<span style=\"color:#143c78;\"> | </span>`);

  const experience = (data.experience || [])
    .map((exp) => `
      <div style=\"margin-bottom:10px;\">
        <div style=\"display:flex; justify-content:space-between; gap:12px; align-items:flex-end;\">
          <strong style=\"font-size:13px;\">${escapeHtml(exp.jobTitle || "")}</strong>
          <span style=\"${smallMuted} font-style:italic;\">${escapeHtml(exp.startDate || "")} – ${escapeHtml(exp.endDate || "Present")}</span>
        </div>
        <div style=\"display:flex; justify-content:space-between; gap:12px; align-items:flex-end; margin-bottom:4px;\">
          <em style=\"font-size:12px;\">${escapeHtml(exp.company || "")}</em>
          <em style=\"${smallMuted}\">${escapeHtml(exp.location || "")}</em>
        </div>
        <div style=\"font-size:12.5px;\">${renderListLines(exp.description || "")}</div>
      </div>`)
    .join("");

  const projects = (data.projects || [])
    .map((proj) => `
      <div style=\"margin-bottom:10px;\">
        <div style=\"display:flex; justify-content:space-between; gap:12px; align-items:flex-end; margin-bottom:4px;\">
          <strong style=\"font-size:13px;\">${escapeHtml(proj.name || "")}</strong>
          ${proj.link ? `<a href=\"${normalizeUrl(proj.link)}\" target=\"_blank\" rel=\"noreferrer\" style=\"color:#143c78; text-decoration:none; font-size:12px;\">Link</a>` : ""}
        </div>
        <div style=\"font-size:12.5px;\">${renderListLines(proj.description || "")}</div>
      </div>`)
    .join("");

  const education = (data.education || [])
    .map((edu) => {
      const locationText = [edu.score || "", edu.location || ""].filter(Boolean).join(edu.score && edu.location ? " | " : "");
      return `
        <div style=\"margin-bottom:8px;\">
          <div style=\"display:flex; justify-content:space-between; gap:12px; align-items:flex-end;\">
            <strong style=\"font-size:13px;\">${escapeHtml(edu.school || "")}</strong>
            <span style=\"${smallMuted} font-style:italic;\">${escapeHtml(edu.startDate || "")} – ${escapeHtml(edu.endDate || "Present")}</span>
          </div>
          <div style=\"display:flex; justify-content:space-between; gap:12px; align-items:flex-end;\">
            <em style=\"font-size:12px;\">${escapeHtml(edu.degree || "")}</em>
            <em style=\"${smallMuted}\">${escapeHtml(locationText)}</em>
          </div>
        </div>`;
    })
    .join("");

  const certifications = (data.certifications || [])
    .map((cert) => `
      <div style=\"display:flex; justify-content:space-between; gap:12px; align-items:flex-end; margin-bottom:6px;\">
        <div>
          <strong style=\"font-size:13px;\">${escapeHtml(cert.name || "")}</strong>
          ${cert.issuer ? `<span style=\"font-size:12px;\"> — ${escapeHtml(cert.issuer)}</span>` : ""}
          ${cert.link ? `<a href=\"${normalizeUrl(cert.link)}\" target=\"_blank\" rel=\"noreferrer\" style=\"color:#143c78; text-decoration:none; font-size:11px;\"> [Verify]</a>` : ""}
        </div>
        ${cert.date ? `<span style=\"${smallMuted} font-style:italic;\">${escapeHtml(cert.date)}</span>` : ""}
      </div>`)
    .join("");

  const achievements = (data.achievements || [])
    .map((ach) => `
      <div style=\"font-size:12.5px; margin-bottom:3px; position:relative; padding-left:12px;\">
        <span style=\"position:absolute; left:0; color:#143c78;\">•</span>
        <span>${ach.title ? `<strong>${escapeHtml(ach.title)}${ach.description ? ": " : ""}</strong>` : ""}${escapeHtml(ach.description || "")}</span>
      </div>`)
    .join("");

  const skills = (data.skills || [])
    .map((skill) => `<div style=\"font-size:12px; margin-bottom:3px;\"><strong>${escapeHtml(skill.category || "")}: </strong><span>${escapeHtml(skill.items || "")}</span></div>`)
    .join("");

  return `
    <div style=\"width:850px; min-height:1056px; background:#ffffff; color:#000000; padding:32px; box-sizing:border-box; font-family:${data.font || "Arial"}; line-height:1.35;\">
      <div style=\"text-align:center; margin-bottom:16px; border-bottom:1px solid #d1d5db; padding-bottom:16px;\">
        <h1 style=\"font-size:28px; font-weight:700; margin:0 0 8px;\">${escapeHtml(personalInfo.fullName)}</h1>
        <div style=\"display:flex; flex-wrap:wrap; justify-content:center; align-items:center; gap:8px; font-size:12px; color:#5a5a5a;\">${contacts}</div>
      </div>
      ${data.summary ? `<div style=\"${sectionStyle}\"><h2 style=\"${headingStyle}\">Professional Summary</h2><p style=\"margin:0; white-space:pre-wrap; font-size:12.5px;\">${escapeHtml(data.summary)}</p></div>` : ""}
      ${experience ? `<div style=\"${sectionStyle}\"><h2 style=\"${headingStyle}\">Work Experience</h2>${experience}</div>` : ""}
      ${projects ? `<div style=\"${sectionStyle}\"><h2 style=\"${headingStyle}\">Projects</h2>${projects}</div>` : ""}
      ${education ? `<div style=\"${sectionStyle}\"><h2 style=\"${headingStyle}\">Education</h2>${education}</div>` : ""}
      ${certifications ? `<div style=\"${sectionStyle}\"><h2 style=\"${headingStyle}\">Certifications</h2>${certifications}</div>` : ""}
      ${achievements ? `<div style=\"${sectionStyle}\"><h2 style=\"${headingStyle}\">Achievements</h2>${achievements}</div>` : ""}
      ${skills ? `<div style=\"${sectionStyle}\"><h2 style=\"${headingStyle}\">Technical Skills</h2>${skills}</div>` : ""}
    </div>`;
};

export const exportToPDF = async (elementId: string, data: ResumeBuilderData, filename: string = "resume.pdf") => {
  if (!document.getElementById(elementId)) return;

  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "-10000px";
  wrapper.style.top = "0";
  wrapper.style.background = "#ffffff";
  wrapper.innerHTML = buildResumeMarkup(data);
  document.body.appendChild(wrapper);

  try {
    const element = wrapper.firstElementChild as HTMLElement | null;
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
  } finally {
    wrapper.remove();
  }
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
