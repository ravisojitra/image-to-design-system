import { tavily } from '@tavily/core';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { searchPrompt } = await request.json();

        if (!searchPrompt || typeof searchPrompt !== 'string') {
            return NextResponse.json(
                { error: 'Search prompt is required' },
                { status: 400 }
            );
        }

        const client = tavily({ apiKey: process.env.TAVILY_API_KEY || "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" });

        const result = await client.search(searchPrompt, {
            includeImages: true,
            includeImageDescriptions: true,
            maxResults: 20,
        });

        const images = result.images as { url: string; description: string }[];

        return NextResponse.json({ images });
    } catch (error) {
        console.error('Error searching images:', error);
        return NextResponse.json(
            { error: 'Failed to search images' },
            { status: 500 }
        );
    }
}
