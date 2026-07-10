export interface ResumeBuilderData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    portfolio?: string;
    github?: string;
  };
  summary: string;
  experience: {
    id: string;
    jobTitle: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  education: {
    id: string;
    degree: string;
    school: string;
    location: string;
    startDate: string;
    endDate: string;
    score?: string;
  }[];
  projects: {
    id: string;
    name: string;
    link: string;
    description: string;
  }[];
  certifications: {
    id: string;
    name: string;
    issuer: string;
    date: string;
    link?: string;
  }[];
  achievements: {
    id: string;
    title: string;
    description: string;
  }[];
  skills: {
    id: string;
    category: string;
    items: string;
  }[];
  font?: string;
}
