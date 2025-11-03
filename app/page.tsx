'use client';

import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { MarkdownRenderer } from './components/MarkdownRenderer';

type ImageResult = {
  url: string;
  description: string;
};

export default function Home() {
  const [applicationIdea, setApplicationIdea] = useState('');
  const [searchPrompt, setSearchPrompt] = useState('');
  const [images, setImages] = useState<ImageResult[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [designPrompt, setDesignPrompt] = useState('');
  const [loading, setLoading] = useState<'prompt' | 'images' | 'analyze' | null>(null);

  const handleGeneratePrompt = async () => {
    if (!applicationIdea.trim()) {
      toast.error('Please enter an application idea');
      return;
    }

    setLoading('prompt');
    setSearchPrompt('');
    setImages([]);
    setSelectedImage(null);
    setDesignPrompt('');

    try {
      const response = await fetch('/api/generate-search-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationIdea }),
      });

      if (!response.ok) throw new Error('Failed to generate prompt');

      const data = await response.json();
      setSearchPrompt(data.searchPrompt);
      toast.success('Search prompt generated');

      await handleSearchImages(data.searchPrompt);
    } catch (error) {
      toast.error('Failed to generate search prompt');
      setLoading(null);
    }
  };

  const handleSearchImages = async (prompt?: string) => {
    const promptToUse = prompt || searchPrompt;
    if (!promptToUse) return;

    setLoading('images');
    setImages([]);
    setSelectedImage(null);
    setDesignPrompt('');

    try {
      const response = await fetch('/api/search-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchPrompt: promptToUse }),
      });

      if (!response.ok) throw new Error('Failed to search images');

      const data = await response.json();
      setImages(data.images || []);
      toast.success(`Found ${data.images?.length || 0} design images`);
    } catch (error) {
      toast.error('Failed to search images');
    } finally {
      setLoading(null);
    }
  };

  const handleAnalyzeImage = async (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setLoading('analyze');
    setDesignPrompt('');

    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) throw new Error('Failed to analyze image');

      const data = await response.json();
      setDesignPrompt(data.designPrompt);
      toast.success('Image analyzed successfully');
    } catch (error) {
      toast.error('Failed to analyze image');
      setSelectedImage(null);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="container mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50 mb-2">
            Image to Design Prompt
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Transform your application idea into a detailed design prompt using AI-powered image analysis
          </p>
        </div>

        {/* Step 1: Application Idea Input */}
        <div className="mb-8 rounded-lg bg-white dark:bg-zinc-900 p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">
            Step 1: Describe Your Application Idea
          </h2>
          <div className="flex gap-4">
            <textarea
              value={applicationIdea}
              onChange={(e) => setApplicationIdea(e.target.value)}
              placeholder="e.g., A premium SaaS dashboard for project management with dark theme, modern UI, and clean aesthetics..."
              className="flex-1 min-h-[100px] rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-black dark:text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-500"
            />
            <button
              onClick={handleGeneratePrompt}
              disabled={loading === 'prompt'}
              className="px-6 py-3 rounded-lg bg-black dark:bg-zinc-50 text-white dark:text-black font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading === 'prompt' ? 'Generating...' : 'Generate Search'}
            </button>
          </div>
        </div>

        {/* Step 2: Generated Search Prompt */}
        {searchPrompt && (
          <div className="mb-8 rounded-lg bg-white dark:bg-zinc-900 p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">
              Step 2: Generated Search Prompt
            </h2>
            <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800 p-4 mb-4">
              <p className="text-black dark:text-zinc-50">{searchPrompt}</p>
            </div>
            <button
              onClick={() => handleSearchImages()}
              disabled={loading === 'images'}
              className="px-4 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-black dark:text-zinc-50 hover:bg-zinc-300 dark:hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading === 'images' ? 'Searching...' : 'Search Again'}
            </button>
          </div>
        )}

        {/* Step 3: Image Results */}
        {images.length > 0 && (
          <div className="mb-8 rounded-lg bg-white dark:bg-zinc-900 p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">
              Step 3: Select a Design Image ({images.length} results)
            </h2>
            {loading === 'analyze' && (
              <div className="mb-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
                  <span className="text-blue-900 dark:text-blue-100 font-medium">
                    Analyzing selected image...
                  </span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div
                  key={index}
                  onClick={() => !loading && handleAnalyzeImage(image.url)}
                  className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${loading === 'analyze'
                    ? 'cursor-not-allowed opacity-60'
                    : 'cursor-pointer'
                    } ${selectedImage === image.url
                      ? 'border-black dark:border-zinc-50 ring-2 ring-black dark:ring-zinc-50'
                      : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600'
                    }`}
                >
                  <Image
                    src={image.url}
                    alt={image.description || 'Design inspiration'}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {loading === 'analyze' && selectedImage === image.url && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                      <div className="text-white font-medium">Analyzing...</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Design Prompt Result */}
        {(designPrompt || loading === 'analyze') && (
          <div className="mb-8 rounded-lg bg-white dark:bg-zinc-900 p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">
              Step 4: Generated Design Prompt
            </h2>
            {selectedImage && (
              <div className="mb-4 relative aspect-video rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
                <Image
                  src={selectedImage}
                  alt="Selected design"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
            {loading === 'analyze' && !designPrompt && (
              <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800 p-8 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-black dark:border-zinc-50 border-t-transparent"></div>
                  <span className="text-zinc-600 dark:text-zinc-400">Analyzing image and generating design prompt...</span>
                </div>
              </div>
            )}
            {designPrompt && (
              <>
                <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800 p-6">
                  <MarkdownRenderer content={designPrompt} />
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(designPrompt);
                    toast.success('Design prompt copied to clipboard');
                  }}
                  className="mt-4 px-4 py-2 rounded-lg bg-black dark:bg-zinc-50 text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                >
                  Copy Prompt
                </button>
              </>
            )}
          </div>
        )}

        {/* Loading States */}
        {loading === 'prompt' && (
          <div className="text-center py-8 text-zinc-600 dark:text-zinc-400">
            Generating search prompt...
          </div>
        )}
        {loading === 'images' && (
          <div className="text-center py-8 text-zinc-600 dark:text-zinc-400">
            Searching for design images...
          </div>
        )}
      </main>
    </div>
  );
}