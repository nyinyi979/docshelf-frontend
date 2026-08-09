export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  documentCount: number;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  documentCount: number;
}
