import { pipeline } from '@xenova/transformers';

let embedder: any = null;

async function getEmbedder() {
  if (!embedder) {
    // Feature extraction pipeline with a small, efficient model (384 dimensions)
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embedder;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const extractor = await getEmbedder();
  const output = await extractor(text, {
    pooling: 'mean',
    normalize: true,
  });
  
  return Array.from(output.data);
}
