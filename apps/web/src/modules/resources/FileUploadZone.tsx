import React, { useState, useRef } from 'react';

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({ onFilesSelected, disabled }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      onFilesSelected(droppedFiles);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      onFilesSelected(selectedFiles);
      // Reset input value so the same file can be re-selected if needed
      e.target.value = '';
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 cursor-pointer ${
        isDragOver
          ? 'border-[#93B2F8] bg-[#93B2F8]/10 shadow-elevation-2 scale-[1.005]'
          : 'border-uiBorder bg-surface hover:border-accent/60 hover:bg-bg/60 shadow-elevation-1'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={() => {
        if (!disabled) fileInputRef.current?.click();
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />

      <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-transform duration-200 ${
          isDragOver ? 'scale-110 bg-[#93B2F8]/20 text-[#0A1680]' : 'bg-primary/5 text-primary'
        }`}>
          📁
        </div>
        <div>
          <p className="text-sm font-bold text-mainText">
            <span className="text-primary hover:underline">Click to upload</span> or drag and drop files here
          </p>
          <p className="text-xs text-muted mt-0.5">
            Documents (PDF, DOCX, XLSX), Images (PNG, JPG), Archives (ZIP), and Source files up to 25MB
          </p>
        </div>
      </div>
    </div>
  );
};
