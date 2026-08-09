import { DocumentFileType } from './types';

export function documentFileType(filename: string): DocumentFileType {
  const extension = filename.split('.').pop()?.toLowerCase();
  if (extension === 'xlsx' || extension === 'xls') return 'xlsx';
  if (extension === 'doc' || extension === 'docx') return 'doc';
  if (extension === 'ppt' || extension === 'pptx') return 'ppt';
  if (['png', 'jpg', 'jpeg', 'webp'].includes(extension ?? '')) return 'img';
  return 'pdf';
}

export function formatBytes(bytes: number): string {
  if (!bytes) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}
