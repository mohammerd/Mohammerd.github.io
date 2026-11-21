export interface ProjectSection {
  heading: string;
  paragraphs: string[];
}

export interface Project {
  slug: string;
  title: string;
  subtitle: string;
  desc: string;
  stage: string;
  link: string;
  image?: string;
  sections: ProjectSection[];
}

export const projects: Project[] = [
  {
    slug: 'agroguardai',
    title: 'AgroGuardAI',
    subtitle: 'Agricultural AI safety research',
    desc: 'Researching how AI systems can better understand local agriculture, languages, and farming conditions — and provide safer, more grounded support.',
    stage: 'Early research and dataset development',
    link: 'https://agroguardai.com',
    sections: [
      {
        heading: 'Why this project exists',
        paragraphs: [
          'General-purpose AI systems can produce confident but inaccurate answers when asked agricultural questions. That becomes especially serious when advice concerns crop disease, pesticide application, chemical handling, soil treatment, or other decisions that affect a farmer’s livelihood and the surrounding environment.',
          'A model may also misunderstand a farmer’s language, local crop variety, growing conditions, or the context behind a question. A fluent answer is not necessarily a safe or useful agricultural answer.',
        ],
      },
      {
        heading: 'The mission',
        paragraphs: [
          'AgroGuardAI is an AI safety research initiative focused on building a stronger agricultural context for AI systems. The long-term goal is to help AI understand local farming practices, African languages, crops, pests and diseases, soil conditions, and weather-related context before it gives guidance.',
          'The project aims to make agricultural AI more useful to farmers while reducing hallucinations and unsafe recommendations. It places particular emphasis on knowing when information is uncertain, avoiding unsupported chemical advice, and directing users toward qualified agricultural support when a question requires expert judgement.',
        ],
      },
      {
        heading: 'Research direction',
        paragraphs: [
          'Current work includes building and evaluating an agricultural question-and-answer dataset covering 25 crops and eight Nigerian languages: Hausa, Yoruba, Igbo, Fulfulde, Kanuri, Tiv, Ibibio, and Nigerian Pidgin. The first research collection contains 1,004 question-and-answer pairs and is being used as a starting point for model adaptation and safety evaluation.',
          'The broader research direction includes multilingual understanding, crop and disease knowledge, pest management, soil nutrition, safer chemical-use guidance, and better use of local environmental and weather context. Expert agronomist and native-speaker review are important parts of the validation work.',
        ],
      },
      {
        heading: 'What AgroGuardAI is — and is not',
        paragraphs: [
          'AgroGuardAI is the research and technology foundation for agricultural AI products. It is still an early-stage research effort; the dataset and evaluation work are being developed. The project does not claim that a model can replace an agronomist, extension officer, or local agricultural expert.',
        ],
      },
    ],
  },
  {
    slug: 'hypervisor-zero',
    title: 'Hypervisor-Zero',
    subtitle: 'AI control efficacy research',
    desc: 'An open-source research effort exploring how to test whether autonomous AI agents can be monitored, constrained, and reliably interrupted.',
    stage: 'Research and prototype development',
    link: 'https://hypervisorzero.xyz',
    image: '/images/projects/hypervisor-zero.webp',
    sections: [
      {
        heading: 'The problem',
        paragraphs: [
          'As AI systems become more autonomous and gain access to tools, files, networks, and other resources, it becomes increasingly important to know whether their actions can be kept within defined limits. It is not enough to check whether an agent gives an acceptable answer in a conversation. We also need to test what it does when it can take actions.',
          'A system may behave correctly in ordinary evaluations but attempt to bypass restrictions, misuse a tool, or continue an action after it should have stopped. Those are control questions that require testing in realistic, adversarial conditions.',
        ],
      },
      {
        heading: 'The research goal',
        paragraphs: [
          'Hypervisor-Zero explores how to measure the control efficacy of autonomous AI systems: whether the system remains within its permitted boundaries, whether monitoring detects important violations, and whether an operator can intervene effectively when needed.',
          'The project is being developed as open-source research infrastructure, independent of the teams building frontier AI models. The aim is to make control claims more measurable and easier for other researchers to inspect and reproduce.',
        ],
      },
      {
        heading: 'How it is being approached',
        paragraphs: [
          'The intended test environment uses simulated computers, networks, files, data, tools, and other resources. Agents can be placed in controlled scenarios and subjected to adversarial tests while their actions, attempted boundary violations, and responses to intervention are monitored.',
          'The central question is practical: before an AI system is given access to a consequential capability, what evidence shows that it can be kept under control under defined test conditions?',
        ],
      },
      {
        heading: 'Research status',
        paragraphs: [
          'Hypervisor-Zero is under active research and prototype development. It should be understood as an effort to build and validate evaluation infrastructure, not as a claim that complete containment or guaranteed safety has already been achieved.',
        ],
      },
    ],
  },
  {
    slug: 'agromind',
    title: 'AgroMind',
    subtitle: 'Farmer-facing agricultural AI assistant',
    desc: 'A planned multilingual consumer chatbot designed to bring AgroGuardAI’s agricultural knowledge and safety work into a simple farmer-facing experience.',
    stage: 'Product development direction',
    link: 'https://agromind.chat',
    sections: [
      {
        heading: 'The idea',
        paragraphs: [
          'AgroMind is the farmer-facing product being developed on top of the AgroGuardAI ecosystem. The idea is to make agricultural knowledge easier to access through a simple assistant that farmers can interact with in languages they are comfortable using.',
          'Rather than building another general-purpose chatbot and hoping it understands farming, AgroMind is intended to draw on the agricultural context and safety research developed through AgroGuardAI.',
        ],
      },
      {
        heading: 'How farmers should be able to use it',
        paragraphs: [
          'The product direction is voice-first and multilingual, with text and voice conversations for asking practical farming questions. A farmer should be able to describe a crop problem naturally, ask follow-up questions, and receive guidance that takes local agricultural context into account.',
          'The planned experience also includes image-based crop problem reporting, with richer visual or live-video context as a longer-term direction. These capabilities are intended to help the assistant understand what the farmer is describing, rather than relying only on a short text prompt.',
        ],
      },
      {
        heading: 'Why it belongs in the AgroGuardAI ecosystem',
        paragraphs: [
          'AgroMind is the product layer; AgroGuardAI is the research and safety foundation. The goal is for improvements in language coverage, agricultural knowledge, uncertainty handling, and safer recommendations to inform the farmer-facing assistant.',
          'AgroMind is still being developed. The capabilities described here are the product direction, not a statement that every feature is currently available or production-ready.',
        ],
      },
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
