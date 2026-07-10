import React from "react";
import { ResumeBuilderData } from "@/types/resume";

export const ATSResumeTemplate: React.FC<{ data: ResumeBuilderData; id?: string }> = ({ data, id = "resume-preview-element" }) => {
  const fontStyle = data.font || "'Times New Roman', Times, serif";
  const accent = "#143c78"; // RGB: 20, 60, 120
  const lightGray = "#5a5a5a"; // RGB: 90, 90, 90

  const SectionHeading = ({ children }: { children: React.ReactNode }) => (
    <h2 
      className="text-[14px] font-bold uppercase tracking-wider mb-1" 
      style={{ color: accent, borderBottom: `1px solid ${accent}`, paddingBottom: '2px' }}
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
        <h1 className="text-4xl font-bold mb-2">{data.personalInfo.fullName || "Your Name"}</h1>
        <div className="flex flex-wrap justify-center items-center gap-2 text-[12px]" style={{ color: lightGray }}>
          {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
          {data.personalInfo.phone && data.personalInfo.email && <span style={{ color: accent }}>|</span>}
          {data.personalInfo.email && (
            <a href={`mailto:${data.personalInfo.email}`} style={{ color: accent }} className="hover:underline">
              {data.personalInfo.email}
            </a>
          )}
          {data.personalInfo.linkedin && (
            <>
              <span style={{ color: accent }}>|</span>
              <a href={data.personalInfo.linkedin.startsWith('http') ? data.personalInfo.linkedin : `https://${data.personalInfo.linkedin}`} target="_blank" rel="noopener noreferrer" style={{ color: accent }} className="hover:underline">
                LinkedIn
              </a>
            </>
          )}
          {data.personalInfo.github && (
            <>
              <span style={{ color: accent }}>|</span>
              <a href={data.personalInfo.github.startsWith('http') ? data.personalInfo.github : `https://${data.personalInfo.github}`} target="_blank" rel="noopener noreferrer" style={{ color: accent }} className="hover:underline">
                GitHub
              </a>
            </>
          )}
          {data.personalInfo.portfolio && (
            <>
              <span style={{ color: accent }}>|</span>
              <a href={data.personalInfo.portfolio.startsWith('http') ? data.personalInfo.portfolio : `https://${data.personalInfo.portfolio}`} target="_blank" rel="noopener noreferrer" style={{ color: accent }} className="hover:underline">
                Portfolio
              </a>
            </>
          )}
          {data.personalInfo.location && (
            <>
              <span style={{ color: accent }}>|</span>
              <span>{data.personalInfo.location}</span>
            </>
          )}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-3">
          <SectionHeading>Professional Summary</SectionHeading>
          <p className="mt-1 whitespace-pre-wrap">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div className="mb-3">
          <SectionHeading>Work Experience</SectionHeading>
          {data.experience.map(exp => (
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
      {data.projects && data.projects.length > 0 && (
        <div className="mb-3">
          <SectionHeading>Projects</SectionHeading>
          {data.projects.map(proj => (
            <div key={proj.id} className="mb-2.5 mt-1">
              <div className="flex justify-between items-end mb-1">
                <strong className="text-[13px]">{proj.name}</strong>
                {proj.link && (
                  <a href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`} target="_blank" rel="noopener noreferrer" style={{ color: accent }} className="text-[12px] hover:underline">
                    Link
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
      {data.education && data.education.length > 0 && (
        <div className="mb-3">
          <SectionHeading>Education</SectionHeading>
          {data.education.map(edu => (
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
      {data.certifications && data.certifications.length > 0 && (
        <div className="mb-3">
          <SectionHeading>Certifications</SectionHeading>
          {data.certifications.map(cert => (
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
      {data.achievements && data.achievements.length > 0 && (
        <div className="mb-3">
          <SectionHeading>Achievements</SectionHeading>
          <div className="mt-1 ml-4 text-[12.5px]">
            {data.achievements.map(ach => (
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
      {data.skills && data.skills.length > 0 && (
        <div>
          <SectionHeading>Technical Skills</SectionHeading>
          <div className="mt-1 space-y-0.5">
            {data.skills.map(skill => (
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
