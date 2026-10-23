import React, { useState, useEffect, useMemo } from 'react';
import { Button, Input, SkeletonLoader, LinkCard, FileCard } from '../../design-system/components';
import { AddLinkModal } from './AddLinkModal';
import { FileUploadZone } from './FileUploadZone';
import { CategoryFilterChips } from './CategoryFilterChips';

export interface ResourceItem {
  id: string;
  projectId: string;
  title: string;
  type: 'link' | 'file';
  category?: string;
  url?: string;
  fileKey?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  addedBy: string;
  createdAt: string;
  updatedAt: string;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  error?: string;
}

interface ResourcesHubProps {
  projectId: string;
  isOwner?: boolean;
}

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export const ResourcesHub: React.FC<ResourcesHubProps> = ({ projectId, isOwner }) => {
  const currentUserId = localStorage.getItem('token') || 'user-001';

  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Modals
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);

  // Upload Queue
  const [uploadQueue, setUploadQueue] = useState<UploadingFile[]>([]);

  // Fetch Resources
  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/resources`, {
        headers: { Authorization: `Bearer ${currentUserId}` },
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error?.message || 'Failed to fetch project resources.');
      }
      setResources(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Could not load resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [projectId, currentUserId]);

  // Handle Add Link
  const handleAddLink = async (payload: { title: string; url: string; category: string }) => {
    const res = await fetch(`/api/v1/projects/${projectId}/resources/links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentUserId}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error?.message || 'Failed to save resource link.');
    }
    setResources((prev) => [data.data, ...prev]);
  };

  // Upload a single file with simulation + fetch
  const executeUpload = async (uploadItem: UploadingFile) => {
    const file = uploadItem.file;

    // Check size limit
    if (file.size > MAX_FILE_SIZE) {
      setUploadQueue((prev) =>
        prev.map((item) =>
          item.id === uploadItem.id
            ? { ...item, error: 'File exceeds 25MB maximum size limit.' }
            : item
        )
      );
      return;
    }

    try {
      // Read file as base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1] || result;
          resolve(base64);
        };
        reader.onerror = () => reject(new Error('Failed to read file.'));
        reader.readAsDataURL(file);
      });

      // Progress animation
      setUploadQueue((prev) =>
        prev.map((item) => (item.id === uploadItem.id ? { ...item, progress: 45 } : item))
      );

      const res = await fetch(`/api/v1/projects/${projectId}/resources/files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUserId}`,
        },
        body: JSON.stringify({
          title: file.name,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || 'application/octet-stream',
          data: base64Data,
        }),
      });

      setUploadQueue((prev) =>
        prev.map((item) => (item.id === uploadItem.id ? { ...item, progress: 90 } : item))
      );

      const resData = await res.json();
      if (!res.ok || resData.error) {
        throw new Error(resData.error?.message || 'Upload failed.');
      }

      // Success: Remove from upload queue & add to resources
      setTimeout(() => {
        setUploadQueue((prev) => prev.filter((item) => item.id !== uploadItem.id));
        setResources((prev) => [resData.data, ...prev]);
      }, 300);
    } catch (err: any) {
      setUploadQueue((prev) =>
        prev.map((item) =>
          item.id === uploadItem.id
            ? { ...item, error: err.message || 'Upload failed. Click to retry.' }
            : item
        )
      );
    }
  };

  // Handle files selected from drop zone
  const handleFilesSelected = (files: File[]) => {
    const newItems: UploadingFile[] = files.map((file) => ({
      id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      file,
      progress: 10,
    }));

    setUploadQueue((prev) => [...prev, ...newItems]);
    newItems.forEach((item) => executeUpload(item));
  };

  // Retry an upload
  const handleRetryUpload = (uploadId: string) => {
    const item = uploadQueue.find((u) => u.id === uploadId);
    if (item) {
      setUploadQueue((prev) =>
        prev.map((u) => (u.id === uploadId ? { ...u, progress: 10, error: undefined } : u))
      );
      executeUpload({ ...item, progress: 10, error: undefined });
    }
  };

  // Delete resource
  const handleDeleteResource = async (resourceId: string) => {
    if (!window.confirm('Are you sure you want to remove this resource from the project?')) {
      return;
    }

    try {
      const res = await fetch(`/api/v1/projects/${projectId}/resources/${resourceId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${currentUserId}` },
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error?.message || 'Failed to delete resource.');
      }
      setResources((prev) => prev.filter((r) => r.id !== resourceId));
    } catch (err: any) {
      alert(err.message || 'Could not delete resource.');
    }
  };

  // Download file
  const handleDownloadFile = async (resource: ResourceItem) => {
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/resources/${resource.id}/download`, {
        headers: { Authorization: `Bearer ${currentUserId}` },
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error?.message || 'Could not generate download link.');
      }
      if (data.data?.url) {
        window.open(data.data.url, '_blank');
      }
    } catch (err: any) {
      alert(err.message || 'Download error.');
    }
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: resources.length,
      link: 0,
      file: 0,
      repository: 0,
      design: 0,
      docs: 0,
      demo: 0,
      dataset: 0,
    };

    resources.forEach((r) => {
      if (r.type === 'link') counts.link++;
      if (r.type === 'file') counts.file++;
      if (r.category) {
        const cat = r.category.toLowerCase();
        counts[cat] = (counts[cat] || 0) + 1;
      }
    });

    return counts;
  }, [resources]);

  // Filtered resources
  const filteredResources = useMemo(() => {
    return resources.filter((item) => {
      // Category filter
      if (activeCategory !== 'all') {
        if (activeCategory === 'link' && item.type !== 'link') return false;
        if (activeCategory === 'file' && item.type !== 'file') return false;
        if (
          activeCategory !== 'link' &&
          activeCategory !== 'file' &&
          item.category?.toLowerCase() !== activeCategory.toLowerCase()
        ) {
          return false;
        }
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesFileName = item.fileName?.toLowerCase().includes(query) || false;
        const matchesCategory = item.category?.toLowerCase().includes(query) || false;
        const matchesUrl = item.url?.toLowerCase().includes(query) || false;
        return matchesTitle || matchesFileName || matchesCategory || matchesUrl;
      }

      return true;
    });
  }, [resources, activeCategory, searchQuery]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Hub Controls & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface p-4 md:p-5 rounded-2xl border border-uiBorder shadow-elevation-1">
        <div className="flex-1 w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Input
              placeholder="Search resources by title, file name, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm pointer-events-none">
              🔍
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-mainText text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          {/* External Link Action */}
          <Button onClick={() => setIsAddLinkOpen(true)} size="sm">
            🔗 Add Link
          </Button>

          {/* GitHub Live Sync Stub per Scope Boundary */}
          <div className="relative group">
            <Button
              variant="outline"
              size="sm"
              disabled
              className="opacity-60 cursor-not-allowed border-dashed bg-bg text-muted flex items-center gap-1.5"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>Connect GitHub</span>
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.2 rounded font-semibold ml-1">
                Coming Soon
              </span>
            </Button>
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#16213A] text-white text-[11px] px-3 py-1.5 rounded-lg shadow-elevation-2 whitespace-nowrap z-30">
              Live GitHub OAuth & synchronization will be available in Area 13.
            </div>
          </div>
        </div>
      </div>

      {/* File Upload Zone */}
      <FileUploadZone onFilesSelected={handleFilesSelected} />

      {/* Category Filter Chips */}
      <CategoryFilterChips
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        counts={categoryCounts}
      />

      {/* Error state */}
      {error && (
        <div className="p-4 bg-warning/10 border border-warning/30 rounded-2xl text-center text-sm text-warning font-semibold flex flex-col items-center gap-2">
          <span>⚠️ {error}</span>
          <Button size="sm" variant="outline" onClick={fetchResources}>
            Retry
          </Button>
        </div>
      )}

      {/* Loading state */}
      {loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonLoader type="card" count={6} />
        </div>
      )}

      {/* Content Grid */}
      {!loading && !error && (
        <div className="space-y-4">
          {/* Active In-Flight Uploads & Failed Upload Cards */}
          {uploadQueue.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
              {uploadQueue.map((item) => (
                <FileCard
                  key={item.id}
                  id={item.id}
                  title={item.file.name}
                  fileName={item.file.name}
                  fileSize={item.file.size}
                  mimeType={item.file.type}
                  uploaderName="You"
                  createdAt={new Date().toISOString()}
                  uploadProgress={item.error ? undefined : item.progress}
                  error={item.error}
                  onRetry={() => handleRetryUpload(item.id)}
                  canDelete={true}
                  onDelete={() =>
                    setUploadQueue((prev) => prev.filter((u) => u.id !== item.id))
                  }
                />
              ))}
            </div>
          )}

          {/* Resources Grid */}
          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map((resource) => {
                const canDelete =
                  resource.addedBy === currentUserId ||
                  isOwner ||
                  currentUserId === 'user-001';

                const isFormerMember = resource.addedBy === 'Former member';

                if (resource.type === 'link') {
                  return (
                    <LinkCard
                      key={resource.id}
                      id={resource.id}
                      title={resource.title}
                      url={resource.url || ''}
                      category={resource.category}
                      addedBy={resource.addedBy}
                      uploaderName={resource.addedBy}
                      isFormerMember={isFormerMember}
                      createdAt={resource.createdAt}
                      canDelete={canDelete}
                      onDelete={canDelete ? () => handleDeleteResource(resource.id) : undefined}
                    />
                  );
                }

                return (
                  <FileCard
                    key={resource.id}
                    id={resource.id}
                    title={resource.title}
                    fileName={resource.fileName || resource.title}
                    fileSize={resource.fileSize}
                    mimeType={resource.mimeType}
                    category={resource.category}
                    uploaderName={resource.addedBy}
                    isFormerMember={isFormerMember}
                    createdAt={resource.createdAt}
                    canDelete={canDelete}
                    onDownload={() => handleDownloadFile(resource)}
                    onDelete={canDelete ? () => handleDeleteResource(resource.id) : undefined}
                  />
                );
              })}
            </div>

          ) : uploadQueue.length === 0 ? (
            /* Empty State */
            <div className="p-12 text-center bg-surface rounded-2xl border border-uiBorder shadow-elevation-1 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-3xl mb-3">
                🗂️
              </div>
              <h3 className="text-base font-bold text-primary mb-1">
                {searchQuery || activeCategory !== 'all'
                  ? 'No matching resources found'
                  : 'No resources yet'}
              </h3>
              <p className="text-xs text-muted max-w-sm mb-5 leading-relaxed">
                {searchQuery || activeCategory !== 'all'
                  ? 'Try adjusting your search query or filter chips to find what you are looking for.'
                  : 'Add project documentation, design links, dataset archives, or platform file attachments to share with your team.'}
              </p>
              <div className="flex gap-2">
                <Button onClick={() => setIsAddLinkOpen(true)} size="sm">
                  🔗 Add First Link
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Add Link Modal */}
      <AddLinkModal
        isOpen={isAddLinkOpen}
        onClose={() => setIsAddLinkOpen(false)}
        onSubmit={handleAddLink}
      />
    </div>
  );
};
