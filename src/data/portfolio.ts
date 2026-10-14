export type ProjectData = { id: string; name: string; description: string; technologies: string[]; year: string; github: string };
type Portfolio = {
  personal: { name: string; title: string; location: string; intro: string; interests: string[]; languages: string[] };
  education: { degree: string; focus: string; school: string; years: string }[];
  projects: ProjectData[];
  profiles: { platform: string; username: string; url: string }[];
  works: { title: string; organization: string; period: string; description: string; url?: string }[];
  resume: { pdf: string; docx: string };
};

// Everything in this file is public. Use only information you want to publish.
export const portfolio: Portfolio = {
  personal: {
    name: 'M. Komal Narasimha Rao',
    title: 'Computer Science Student & Developer',
    location: 'India',
    intro: 'I enjoy turning curious ideas into dependable software, with a particular interest in AI, machine learning, and thoughtful developer experiences.',
    interests: ['Machine Learning', 'Artificial Intelligence', 'MLOps', 'Software Development', 'Cybersecurity', 'Web Development'],
    languages: ['Python', 'C++', 'JavaScript', 'TypeScript', 'SQL'],
  },
  education: [
    { degree: 'Bachelor of Technology', focus: 'Computer Science — AI & ML', school: 'V.F.S.T.R', years: '2025-2028'   },
    { degree: 'Diploma', focus: 'Computer Science', school: 'V.F.S.T.R', years: '2022-2025' },
  ],
  projects: [
    { id: 'rag-textbook-assistant', name: 'RAG Textbook Assistant', description: 'An assistant designed to help explore and understand textbook material.', technologies: ['Python', 'RAG', 'LLMs'], year: '2026', github: 'https://github.com/NoobNarasimharao/RagProjectIDP' },
  ],
  profiles: [],
  works: [],
  resume: { pdf: '', docx: '' },
};
