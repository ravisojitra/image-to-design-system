import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { applicationIdea } = await request.json();

        if (!applicationIdea || typeof applicationIdea !== 'string') {
            return NextResponse.json(
                { error: 'Application idea is required' },
                { status: 400 }
            );
        }

        const { text } = await generateText({
            model: openai('gpt-4o'),
            prompt: `You are an expert at creating focused search queries for design inspiration. Analyze the user's application idea and generate a targeted search query that prioritizes the domain/category over generic design terms.

User's Application Idea: "${applicationIdea}"

Rules for generating the search query:
1. **Identify the primary domain/category** (e.g., ecommerce, dashboard, SaaS, fintech, healthcare, CRM, analytics, etc.)
2. **Keep the user's specific subject/topic central** (e.g., water bottles, fitness, banking, etc.)
3. **Use domain-specific terminology** heavily (e.g., for ecommerce: "product page", "checkout", "cart"; for dashboard: "metrics", "analytics", "data viz")
4. **Add only 2-3 essential design qualifiers** (e.g., UI, website, mobile app, interface)
5. **Avoid excessive generic design adjectives** - don't add words like "modern", "minimal", "colorful", "vibrant", "light theme" unless critical to the domain

Format: [Domain-specific terms] [User's topic] [1-2 essential qualifiers]

Examples:
- Input: "ecommerce website for water bottles" → Output: "ecommerce product page water bottles website UI"
- Input: "analytics dashboard for sales" → Output: "analytics dashboard sales metrics data visualization"
- Input: "fitness tracking mobile app" → Output: "fitness tracking mobile app workout interface"

Current year is 2025.

Generate ONLY the search query string, nothing else. Keep it focused on the domain and user's topic.`,
        });

        return NextResponse.json({ searchPrompt: text.trim() });
    } catch (error) {
        console.error('Error generating search prompt:', error);
        return NextResponse.json(
            { error: 'Failed to generate search prompt' },
            { status: 500 }
        );
    }
}
