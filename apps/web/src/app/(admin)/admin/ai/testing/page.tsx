'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { getAdminAccessToken } from '@/lib/api';
import {
  FlaskConical,
  Upload,
  Trash2,
  Download,
  RefreshCw,
  FileImage,
  FileAudio,
  FileText,
  Info,
} from 'lucide-react';
import * as commandCenterApi from '@/lib/api/command-center';
import type { TestAttachment } from '@/types/command-center';

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileIcon(type: string) {
  if (type.startsWith('IMAGE')) return <FileImage className="w-6 h-6 text-blue-400" />;
  if (type.startsWith('AUDIO')) return <FileAudio className="w-6 h-6 text-purple-400" />;
  return <FileText className="w-6 h-6 text-slate-400" />;
}

export default function TestingPage() {
  const [attachments, setAttachments] = useState<TestAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadAttachments(); }, []);

  const loadAttachments = async () => {
    try {
      const token = getAdminAccessToken();
      if (!token) return;
      const data = await commandCenterApi.getAllTestAttachments(token);
      setAttachments(data);
    } catch (error) {
      console.error('Failed to load attachments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      setUploading(true);
      const token = getAdminAccessToken();
      if (!token) return;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let attachmentType = 'FILE';
        if (file.type.startsWith('image/')) attachmentType = 'IMAGE';
        else if (file.type.startsWith('audio/')) attachmentType = 'AUDIO';

        await commandCenterApi.createTestAttachment(token, {
          file,
          attachmentType,
          description: file.name,
        });
      }
      loadAttachments();
    } catch (error) {
      console.error('Failed to upload:', error);
      alert('Upload failed. Check console for details.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this test attachment?')) return;
    try {
      const token = getAdminAccessToken();
      if (!token) return;
      await commandCenterApi.deleteTestAttachment(token, id);
      loadAttachments();
    } catch (error) {
      console.error('Failed to delete attachment:', error);
    }
  };

  const handleDownload = async (attachment: TestAttachment) => {
    try {
      const token = getAdminAccessToken();
      if (!token) return;
      const url = await commandCenterApi.getTestAttachmentDownloadUrl(token, attachment.id);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to get download URL:', error);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[200px]">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
          <FlaskConical className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">AI Testing</h1>
          <p className="text-slate-400 text-sm mt-1">
            Test attachments for AI processing validation
          </p>
        </div>
      </div>

      {/* Upload zone */}
      <div
        className={cn(
          'bg-slate-900/50 rounded-xl border-2 border-dashed transition-colors p-8',
          dragOver ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-white/20'
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <Upload className={cn('w-10 h-10 mx-auto mb-3', dragOver ? 'text-primary' : 'text-slate-500')} />
          <p className="text-sm text-slate-300 mb-1">
            {uploading ? 'Uploading...' : 'Drop files here or click to upload'}
          </p>
          <p className="text-xs text-slate-500 mb-4">
            Supports images, audio, and document files
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Uploading...
              </span>
            ) : (
              'Select Files'
            )}
          </button>
        </div>
      </div>

      {/* Attachments grid */}
      <div className="bg-slate-900/50 rounded-xl border border-white/10 p-6">
        <p className="text-sm text-slate-400 mb-4">{attachments.length} test attachment{attachments.length !== 1 ? 's' : ''}</p>

        {attachments.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <FlaskConical className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No test attachments uploaded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="p-4 rounded-lg bg-slate-800/30 border border-white/10 hover:border-white/20 transition-all">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-800/50 shrink-0">
                    {getFileIcon(attachment.attachmentType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{attachment.fileName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {attachment.attachmentType} • {formatFileSize(attachment.fileSize)}
                    </p>
                    {attachment.description && (
                      <p className="text-xs text-slate-400 mt-1 truncate">{attachment.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-white/5">
                  <button onClick={() => handleDownload(attachment)} className="p-2 rounded-lg hover:bg-white/5 text-slate-400" title="Download">
                    <Download className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(attachment.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info box */}
      <div className="bg-slate-900/50 rounded-xl border border-white/10 p-5">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium mb-2">Test Attachment Use Cases</h3>
            <ul className="text-xs text-slate-400 space-y-1.5">
              <li>• <strong>Images:</strong> Test OCR, handwriting recognition, diagram analysis</li>
              <li>• <strong>Audio:</strong> Test voice-to-text transcription and processing</li>
              <li>• <strong>Documents:</strong> Test document parsing and content extraction</li>
              <li>• Attachments uploaded here can be used in AI testing endpoints</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
