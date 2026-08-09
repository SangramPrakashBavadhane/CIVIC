'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatePostPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    postedIn: 'area'
  });
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('postedIn', formData.postedIn);
      if (mediaFile) {
        data.append('media', mediaFile);
      }

      const res = await fetch('/api/posts', {
        method: 'POST',
        body: data,
      });

      if (res.ok) {
        router.push('/feed');
      } else {
        const responseData = await res.json();
        setError(responseData.message || 'Failed to create post');
      }
    } catch (err) {
      setError('Something went wrong. The file might be too large.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-card p-8 rounded-xl shadow-lg border border-border">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Report an Issue
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Add a photo or video to make your voice heard
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Title</label>
              <input 
                type="text" 
                required 
                className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="e.g. Broken streetlight on Main St"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Description</label>
              <textarea 
                required 
                rows={5}
                className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                placeholder="Provide details about the issue... Where exactly is it? How long has it been there?"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Upload Photo/Video</label>
              <input 
                type="file" 
                accept="image/*,video/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setMediaFile(e.target.files[0]);
                  }
                }}
                className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Where should this be posted?</label>
              <select 
                value={formData.postedIn}
                onChange={(e) => setFormData({...formData, postedIn: e.target.value})}
                className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground"
              >
                <option value="area">My Local Area</option>
                <option value="state">Entire State</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                Uploading & Submitting...
              </span>
            ) : (
              'Submit Issue'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}