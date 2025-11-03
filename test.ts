// To install: npm i @tavily/core
import { tavily } from '@tavily/core';

const client = tavily({ apiKey: "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" });
const result = await client.search("premium saas dashboard screen design, hot vibes and premium aesthetics dark\n", {
    includeImages: true,
    includeImageDescriptions: true
});

const images = result.images as { url: string, description: string }[];