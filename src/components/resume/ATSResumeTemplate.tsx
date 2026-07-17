import React from "react";
import { ResumeBuilderData } from "@/types/resume";
import { ExternalLink } from "lucide-react";

const emptyResumeData: ResumeBuilderData = {
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    portfolio: "",
    github: "",
  },
  summary: "",
  experience: [],
  education: [],
  projects: [],
  certifications: [],
  achievements: [],
  skills: [],
  font: "'Times New Roman'",
};

const normalizeResumeData = (data?: ResumeBuilderData): ResumeBuilderData => ({
  ...emptyResumeData,
  ...data,
  personalInfo: {
    ...emptyResumeData.personalInfo,
    ...(data?.personalInfo ?? {}),
  },
  experience: data?.experience ?? [],
  education: data?.education ?? [],
  projects: data?.projects ?? [],
  certifications: data?.certifications ?? [],
  achievements: data?.achievements ?? [],
  skills: data?.skills ?? [],
});

export const ATSResumeTemplate: React.FC<{ data: ResumeBuilderData; id?: string }> = ({ data, id = "resume-preview-element" }) => {
  const safeData = normalizeResumeData(data);
  const fontStyle = safeData.font || "'Times New Roman', Times, serif";
  const accent = "#143c78"; // RGB: 20, 60, 120
  const lightGray = "#5a5a5a"; // RGB: 90, 90, 90

  const SectionHeading = ({ children }: { children: React.ReactNode }) => (
    <h2 
      className="text-[14px] font-bold uppercase tracking-wider" 
      style={{ 
        color: accent, 
        borderBottom: `1.5px solid ${accent}`, 
        paddingBottom: '6px',
        marginBottom: '12px'
      }}
    >
      {children}
    </h2>
  );

  return (
    <div 
      id={id}
      className="bg-white text-black p-8 max-w-[850px] mx-auto shadow-md"
      style={{ fontFamily: fontStyle, lineHeight: 1.35, minHeight: "1056px", fontSize: '13px' }}
    >
      {/* Header */}
      <div className="text-center mb-4 border-b border-gray-300 pb-4">
        <h1 className="text-4xl font-bold mb-2">{safeData.personalInfo.fullName || "Your Name"}</h1>
        <div className="flex flex-wrap justify-center items-center gap-2 text-[12px]" style={{ color: lightGray }}>
          {safeData.personalInfo.phone && <span>{safeData.personalInfo.phone}</span>}
          {safeData.personalInfo.phone && safeData.personalInfo.email && <span style={{ color: accent }}>|</span>}
          {safeData.personalInfo.email && (
            <a href={`mailto:${safeData.personalInfo.email}`} style={{ color: accent }} className="hover:underline">
              {safeData.personalInfo.email}
            </a>
          )}
          {safeData.personalInfo.linkedin && (
            <>
              <span style={{ color: accent }}>|</span>
              <a href={safeData.personalInfo.linkedin.startsWith('http') ? safeData.personalInfo.linkedin : `https://${safeData.personalInfo.linkedin}`} target="_blank" rel="noopener noreferrer" style={{ color: accent }} className="hover:underline">
                LinkedIn
              </a>
            </>
          )}
          {safeData.personalInfo.github && (
            <>
              <span style={{ color: accent }}>|</span>
              <a href={safeData.personalInfo.github.startsWith('http') ? safeData.personalInfo.github : `https://${safeData.personalInfo.github}`} target="_blank" rel="noopener noreferrer" style={{ color: accent }} className="hover:underline">
                GitHub
              </a>
            </>
          )}
          {safeData.personalInfo.portfolio && (
            <>
              <span style={{ color: accent }}>|</span>
              <a href={safeData.personalInfo.portfolio.startsWith('http') ? safeData.personalInfo.portfolio : `https://${safeData.personalInfo.portfolio}`} target="_blank" rel="noopener noreferrer" style={{ color: accent }} className="hover:underline">
                Portfolio
              </a>
            </>
          )}
          {safeData.personalInfo.location && (
            <>
              <span style={{ color: accent }}>|</span>
              <span>{safeData.personalInfo.location}</span>
            </>
          )}
        </div>
      </div>

      {/* Summary */}
      {safeData.summary && (
        <div className="mb-5">
          <SectionHeading>Professional Summary</SectionHeading>
          <p className="mt-2 whitespace-pre-wrap">{safeData.summary}</p>
        </div>
      )}

      {/* Experience */}
      {safeData.experience.length > 0 && (
        <div className="mb-5">
          <SectionHeading>Work Experience</SectionHeading>
          {safeData.experience.map(exp => (
            <div key={exp.id} className="mb-2.5 mt-1">
              <div className="flex justify-between items-end">
                <strong className="text-[13px]">{exp.jobTitle}</strong>
                <span className="text-[12px] italic" style={{ color: lightGray }}>
                  {exp.startDate} – {exp.endDate || "Present"}
                </span>
              </div>
              <div className="flex justify-between items-end mb-1">
                <em className="text-[12px]">{exp.company}</em>
                <em className="text-[12px]" style={{ color: lightGray }}>{exp.location}</em>
              </div>
              <div className="whitespace-pre-wrap ml-4 list-disc text-[12.5px]">
                {exp.description.split("\n").map((line, i) => (
                  <div key={i} className="flex relative">
                    <span className="absolute -left-3" style={{ color: accent, fontSize: '10px', top: '1px' }}>•</span>
                    <span>{line.replace(/^[-•*]\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {safeData.projects.length > 0 && (
        <div className="mb-5">
          <SectionHeading>Projects</SectionHeading>
          {safeData.projects.map(proj => (
            <div key={proj.id} className="mb-3 mt-1">
              <div className="flex justify-between items-end mb-1">
                <strong className="text-[13px]">{proj.name}</strong>
                {proj.link && (
                  <a href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`} target="_blank" rel="noopener noreferrer" style={{ color: accent }} className="text-[12px] hover:underline flex items-center">
                    <ExternalLink size={12} className="ml-1" />
                  </a>
                )}
              </div>
              <div className="whitespace-pre-wrap ml-4 list-disc text-[12.5px]">
                {proj.description.split("\n").map((line, i) => (
                  <div key={i} className="flex relative">
                    <span className="absolute -left-3" style={{ color: accent, fontSize: '10px', top: '1px' }}>•</span>
                    <span>{line.replace(/^[-•*]\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {safeData.education.length > 0 && (
        <div className="mb-5">
          <SectionHeading>Education</SectionHeading>
          {safeData.education.map(edu => (
            <div key={edu.id} className="mb-2 mt-1">
              <div className="flex justify-between items-end">
                <strong className="text-[13px]">{edu.school}</strong>
                <span className="text-[12px] italic" style={{ color: lightGray }}>
                  {edu.startDate} – {edu.endDate || "Present"}
                </span>
              </div>
              <div className="flex justify-between items-end">
                <em className="text-[12px]">{edu.degree}</em>
                <em className="text-[12px]" style={{ color: lightGray }}>
                  {edu.score && <span>{edu.score}{edu.location ? " | " : ""}</span>}
                  {edu.location}
                </em>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {safeData.certifications.length > 0 && (
        <div className="mb-5">
          <SectionHeading>Certifications</SectionHeading>
          {safeData.certifications.map(cert => (
            <div key={cert.id} className="mb-1.5 mt-1 flex justify-between items-end">
              <div>
                <strong className="text-[13px]">{cert.name}</strong>
                {cert.issuer && <span className="text-[12px]"> — {cert.issuer}</span>}
                {cert.link && (
                  <>
                    {" "}
                    <a
                      href={cert.link.startsWith("http") ? cert.link : `https://${cert.link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: accent }}
                      className="text-[11px] hover:underline"
                    >
                      [Verify]
                    </a>
                  </>
                )}
              </div>
              {cert.date && (
                <span className="text-[12px] italic shrink-0 ml-4" style={{ color: lightGray }}>
                  {cert.date}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Achievements */}
      {safeData.achievements.length > 0 && (
        <div className="mb-5">
          <SectionHeading>Achievements</SectionHeading>
          <div className="mt-2 ml-4 text-[12.5px]">
            {safeData.achievements.map(ach => (
              <div key={ach.id} className="flex relative mb-0.5">
                <span className="absolute -left-3" style={{ color: accent, fontSize: '10px', top: '1px' }}>•</span>
                <span>
                  {ach.title && <strong>{ach.title}{ach.description ? ": " : ""}</strong>}
                  {ach.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {safeData.skills.length > 0 && (
        <div>
          <SectionHeading>Technical Skills</SectionHeading>
          <div className="mt-1 space-y-0.5">
            {safeData.skills.map(skill => (
              <div key={skill.id}>
                <strong>{skill.category}: </strong>
                <span>{skill.items}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
