import { Model } from '.';

export interface NewApp {
  name: string;
  url: string;
  urlAlt: string;
  icon: string;
  isPublic: boolean;
  description: string;
}

export interface App extends Model, NewApp {
  orderId: number;
  isPinned: boolean;
  urlAlternative?: string | null;
}
