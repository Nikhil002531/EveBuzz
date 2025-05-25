export interface EventWithRelations {
  id: string;
  title: string;
  startDate: string; // ISO format
  location?: string;
  category?: string;
}
