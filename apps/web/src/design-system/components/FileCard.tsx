import React from 'react';
import { Card } from './Card';
import {
  IcoFile,
  IcoBar,
  IcoImage,
  IcoBox,
  IcoCode,
  IcoVideo,
  IcoPaperclip,
  IcoDownload,
} from './Icons';

export interface FileCardProps {
  id: string;
  title: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  category?: string;
  uploaderName?: string;
  isFormerMember?: boolean;
  createdAt?: string;
  uploadProgress?: number; // 0 to 100 if actively uploading
  error?: string | null;
  onRetry?: () => void;
  canDelete?: boolean;
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
  className?: string;
}

export const FileCard: React.FC<FileCardProps> = ({
  id,
  title,
  fileName,
  fileSize,
  mimeType,
  category = 'Other',
  uploaderName = 'Unknown',
  isFormerMember = false,
  createdAt,
  uploadProgress,
  error,
  onRetry,
  canDelete = false,
  onDelete,
  onDownload,
  className = '',
}) => {
  // Derive file type icon
  const getFileIcon = (fName?: string, mime?: string) => {
    const ext = fName ? fName.split('.').pop()?.toLowerCase() : '';
    const m = (mime || '').toLowerCase();

    if (ext === 'pdf' || m.includes('pdf')) return <IcoFile size={16} color="#fb7185" />;
    if (['doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext || '') || m.includes('word') || m.includes('text')) return <IcoFile size={16} color="#60a5fa" />;
    if (['xls', 'xlsx', 'csv'].includes(ext || '') || m.includes('excel') || m.includes('spreadsheet')) return <IcoBar size={16} color="#34d399" />;
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext || '') || m.includes('image')) return <IcoImage size={16} color="#f472b6" />;
    if (['zip', 'tar', 'gz', '7z', 'rar'].includes(ext || '') || m.includes('archive') || m.includes('zip')) return <IcoBox size={16} color="#fbbf24" />;
    if (['json', 'yaml', 'yml', 'xml', 'ts', 'js', 'py', 'sql'].includes(ext || '') || m.includes('json') || m.includes('javascript')) return <IcoCode size={16} color="#b29af5" />;
    if (['mp4', 'mov', 'webm', 'mp3', 'wav'].includes(ext || '') || m.includes('video') || m.includes('audio')) return <IcoVideo size={16} color="#a78bfa" />;
    return <IcoPaperclip size={16} color="#aba6b6" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const isUploading = uploadProgress !== undefined && uploadProgress >= 0 && uploadProgress < 100;

  return (
    <Card
      className={`p-4 bg-[#15151a] border border-[#33333e] text-[#f0edf5] rounded-xl hover:shadow-lg transition-all duration-200 flex flex-col justify-between group ${
        error ? 'border-[#fb718580] ring-1 ring-[#fb718530] bg-[#2c1518]' : ''
      } ${className}`}
    >
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl p-1.5 bg-bg rounded-lg border border-uiBorder">
              {getFileIcon(fileName, mimeType)}
            </span>
            <div className="min-w-0">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-primary/10 text-primary border border-primary/20">
                {category}
              </span>
              <p className="text-[11px] text-muted truncate max-w-[150px] mt-0.5" title={fileName}>
                {fileName || title}
              </p>
            </div>
          </div>

          {!isUploading && !error && onDownload && (
            <button
              type="button"
              onClick={() => onDownload(id)}
              className="text-muted hover:text-primary p-1.5 rounded-lg hover:bg-bg transition-colors"
              title="Download file"
            >
              <IcoDownload size={15} />
            </button>
          )}
        </div>

        {/* Title */}
        <h4 className="font-bold text-sm text-primary leading-snug line-clamp-2 mt-1">
          {title}
        </h4>

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-[10px] text-muted font-bold">
              <span>Uploading...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-uiBorder h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-accent h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Callout */}
        {error && (
          <div className="mt-2.5 p-2 bg-warning/20 border border-warning/40 rounded-lg text-xs text-warning flex items-center justify-between">
            <span className="truncate">{error}</span>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="text-[11px] font-bold underline ml-2 shrink-0 hover:text-mainText"
              >
                Retry
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-uiBorder/60 flex items-center justify-between text-[11px] text-muted">
        <div className="flex items-center gap-1.5 truncate">
          <span className="font-semibold text-mainText">{formatFileSize(fileSize)}</span>
          <span>•</span>
          <span>By</span>
          <span className={`font-semibold ${isFormerMember ? 'text-muted italic' : 'text-mainText'}`}>
            {isFormerMember ? 'Former member' : uploaderName}
          </span>
          {createdAt && (
            <>
              <span>•</span>
              <span>{new Date(createdAt).toLocaleDateString()}</span>
            </>
          )}
        </div>

        {canDelete && onDelete && !isUploading && (
          <button
            type="button"
            onClick={() => onDelete(id)}
            className="text-muted hover:text-warning text-xs px-1.5 py-0.5 rounded hover:bg-warning/10 transition-colors ml-2 shrink-0 font-medium"
            title="Delete file"
          >
            Delete
          </button>
        )}
      </div>
    </Card>
  );
};

export default FileCard;
