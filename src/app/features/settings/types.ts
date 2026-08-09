export interface RuntimeSettings {
  general: {
    siteName: string;
    supportEmail: string;
    defaultVisibility: 'public' | 'private';
  };
  storage: {
    maxFileSizeMb: number;
    allowedExtensions: string[];
  };
  permissions: Record<string, boolean>;
}
