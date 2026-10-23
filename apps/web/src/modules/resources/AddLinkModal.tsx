import React, { useState } from 'react';
import { Card, Button, Input } from '../../design-system/components';

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; url: string; category: string }) => Promise<void>;
}

const CATEGORIES = [
  { label: 'Repository', icon: '💻' },
  { label: 'Design', icon: '🎨' },
  { label: 'Docs', icon: '📄' },
  { label: 'Demo', icon: '🚀' },
  { label: 'Dataset', icon: '📊' },
  { label: 'Other', icon: '🔗' },
];

export const AddLinkModal: React.FC<AddLinkModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('Docs');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const validateUrl = (testUrl: string): boolean => {
    try {
      const parsed = new URL(testUrl);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    let trimmedUrl = url.trim();

    if (!trimmedTitle) {
      setError('Please provide a title or label for this resource link.');
      return;
    }

    if (!trimmedUrl) {
      setError('Please provide a valid URL.');
      return;
    }

    // Auto prepend https:// if user omitted protocol but has a domain shape
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      if (trimmedUrl.includes('.')) {
        trimmedUrl = 'https://' + trimmedUrl;
      }
    }

    if (!validateUrl(trimmedUrl)) {
      setError('Invalid URL. Please enter a valid web address (e.g., https://github.com/org/repo).');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        title: trimmedTitle,
        url: trimmedUrl,
        category,
      });
      setTitle('');
      setUrl('');
      setCategory('Docs');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save resource link.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <Card className="w-full max-w-lg bg-surface border border-uiBorder shadow-elevation-3 p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-uiBorder">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔗</span>
            <h2 className="text-lg font-bold text-primary">Add External Link</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-mainText text-lg font-bold p-1 rounded transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 bg-warning/10 border border-warning/30 rounded-xl text-xs text-warning font-medium">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-mainText mb-1.5">
              Resource Title / Label <span className="text-primary font-bold">*</span>
            </label>
            <Input
              placeholder="e.g. Project GitHub Repository, Design Specs, API Documentation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-mainText mb-1.5">
              Destination URL <span className="text-primary font-bold">*</span>
            </label>
            <Input
              type="url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-mainText mb-2">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.label}
                  onClick={() => setCategory(cat.label)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                    category === cat.label
                      ? 'bg-primary text-white border-primary shadow-sm font-semibold'
                      : 'bg-bg text-muted border-uiBorder hover:border-accent hover:text-mainText'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-uiBorder">
            <Button variant="outline" type="button" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Add Link'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
