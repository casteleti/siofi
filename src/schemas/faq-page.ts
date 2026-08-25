/**
 * Gerador de JSON-LD `FAQPage` (spec técnica §9.3).
 * Recebe apenas perguntas com resposta validada — as duas marcadas `TODO F5`
 * na copy (implantação, migração) nunca entram aqui até terem resposta aprovada.
 */
export type FaqItem = {
  question: string;
  answer: string;
};

export function buildFaqPageSchema(items: FaqItem[]) {
  if (items.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

// TODO (Tarefa 2): popular a partir das perguntas validadas de
// siofi_landing_page_copy_claude_code.md §19.
