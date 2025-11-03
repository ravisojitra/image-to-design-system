import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { imageUrl } = await request.json();

        if (!imageUrl || typeof imageUrl !== 'string') {
            return NextResponse.json(
                { error: 'Image URL is required' },
                { status: 400 }
            );
        }

        let imageData: string;

        try {
            const imageResponse = await fetch(imageUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'image/*',
                },
            });

            const contentType = imageResponse.headers.get('content-type') || '';

            if (!imageResponse.ok || !contentType.startsWith('image/')) {
                throw new Error(`Invalid image response: ${imageResponse.status} - ${contentType}`);
            }

            const arrayBuffer = await imageResponse.arrayBuffer();

            if (arrayBuffer.byteLength === 0) {
                throw new Error('Empty image data received');
            }

            const base64 = Buffer.from(arrayBuffer).toString('base64');
            const mimeType = contentType;
            imageData = `data:${mimeType};base64,${base64}`;
        } catch (fetchError) {
            console.error('Error fetching image as base64, trying URL directly:', fetchError);
            imageData = imageUrl;
        }

        const { text } = await generateText({
            model: google('gemini-2.5-pro'),
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `You are an expert design system architect and prompt engineer. Analyze this design image and extract the core, reusable design system elements that could be applied to any application. Focus on the fundamental design tokens, component patterns, and visual philosophy—not the specific content or purpose of the screens shown.

Your analysis should extract:

1. **Color System:**
   - Primary, secondary, accent colors (with hex codes if identifiable)
   - Background colors and surface variants
   - Text color hierarchy (primary, secondary, muted text)
   - Border and divider colors
   - Color usage patterns and relationships

2. **Typography System:**
   - Font family/families used
   - Font size scale and hierarchy
   - Font weights utilized
   - Line heights and letter spacing patterns
   - Text styling patterns (headings, body, captions, etc.)

3. **Spacing & Layout System:**
   - Spacing scale (padding and margin patterns: 4px, 8px, 16px, etc.)
   - Grid system fundamentals
   - Component spacing patterns
   - Overall visual density approach

4. **Border Radius & Corners:**
   - Border radius values used (sharp, slightly rounded, fully rounded)
   - Consistency in corner treatments across components

5. **Elevation & Depth:**
   - Shadow styles and elevation levels
   - How depth is created (shadows, borders, overlays)
   - Layering approach

6. **Component Styles (describe briefly how each looks):**
   - **Buttons:** Style (filled, outlined, ghost), corner radius, padding, sizes, states
   - **Cards/Containers:** Background, borders, shadows, padding, corner style
   - **Input Fields:** Border style, background, padding, corner radius, focus states
   - **Icons:** Style (outlined, filled, minimal), size consistency
   - Any other notable UI components present

7. **Overall Design Philosophy & Aesthetics:**
   - Design aesthetic (modern, minimal, playful, premium, brutalist, etc.)
   - Visual style (flat, subtle depth, heavy shadows, glassmorphism, etc.)
   - Design system reference (Material-inspired, iOS-inspired, custom, etc.)
   - Unique design characteristics or signature elements

Generate a clear, structured design system specification that captures the reusable essence of this design—the foundational elements that could be applied to build any interface with the same visual language.`,
                        },
                        {
                            type: 'image' as const,
                            image: imageData,
                        },
                    ],
                },
            ],
        });

        return NextResponse.json({ designPrompt: text.trim() });
    } catch (error) {
        console.error('Error analyzing image:', error);
        return NextResponse.json(
            { error: 'Failed to analyze image' },
            { status: 500 }
        );
    }
}
