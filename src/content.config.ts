import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Schema de uma página de landing (fundação da Tarefa 1).
 * Populado apenas com a entrada `/siofi` nesta tarefa — variantes
 * (§67 da spec técnica / §28 da copy) entram como tarefa futura.
 */
const landingPages = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/landing-pages' }),
  schema: z.object({
    slug: z.string(),
    h1: z.string(),
    metaTitle: z.string().max(60),
    metaDescription: z.string().max(155),
    indexable: z.boolean(),
    canonical: z.string(),
    sections: z.array(z.string()),
  }),
});

export const collections = {
  'landing-pages': landingPages,
};
