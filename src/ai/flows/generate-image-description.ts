'use server';

/**
 * @fileOverview Image description generator using the Gemini API.
 *
 * - generateImageDescription - A function that generates a textual description of an image.
 * - GenerateImageDescriptionInput - The input type for the generateImageDescription function.
 * - GenerateImageDescriptionOutput - The return type for the generateImageDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageDescriptionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the urban issue, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateImageDescriptionInput = z.infer<
  typeof GenerateImageDescriptionInputSchema
>;

const GenerateImageDescriptionOutputSchema = z.object({
  description: z
    .string()
    .describe('A textual description of the image, highlighting potential urban issues.'),
});
export type GenerateImageDescriptionOutput = z.infer<
  typeof GenerateImageDescriptionOutputSchema
>;

export async function generateImageDescription(
  input: GenerateImageDescriptionInput
): Promise<GenerateImageDescriptionOutput> {
  return generateImageDescriptionFlow(input);
}

const generateImageDescriptionPrompt = ai.definePrompt({
  name: 'generateImageDescriptionPrompt',
  input: {schema: GenerateImageDescriptionInputSchema},
  output: {schema: GenerateImageDescriptionOutputSchema},
  prompt: `You are an urban issue detection assistant. Please provide a detailed description of the following image, focusing on potential urban issues:

{{media url=photoDataUri}}`,
});

const generateImageDescriptionFlow = ai.defineFlow(
  {
    name: 'generateImageDescriptionFlow',
    inputSchema: GenerateImageDescriptionInputSchema,
    outputSchema: GenerateImageDescriptionOutputSchema,
  },
  async input => {
    const {output} = await generateImageDescriptionPrompt(input);
    return output!;
  }
);
