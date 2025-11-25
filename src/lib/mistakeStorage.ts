export interface MistakeRecord {
  id: string;
  type: 'quiz' | 'exercise' | 'practice';
  problem: string;
  topic: string;
  date: string;
  attempts?: number;
  userAnswer?: string;
  correctAnswer?: string;
  incorrectSteps?: number[];
  stepDetails?: { step: string; explanation: string }[];
}

const STORAGE_KEY = 'mathMistakes';

export const mistakeStorage = {
  // Get all mistakes
  getAll(): MistakeRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading mistakes:', error);
      return [];
    }
  },

  // Add a new mistake
  add(mistake: Omit<MistakeRecord, 'id' | 'date'>): void {
    try {
      const mistakes = this.getAll();
      const newMistake: MistakeRecord = {
        ...mistake,
        id: `mistake-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date: new Date().toISOString(),
      };
      mistakes.push(newMistake);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mistakes));
    } catch (error) {
      console.error('Error saving mistake:', error);
    }
  },

  // Delete a mistake by ID
  delete(id: string): void {
    try {
      const mistakes = this.getAll();
      const filtered = mistakes.filter(m => m.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting mistake:', error);
    }
  },

  // Clear all mistakes
  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing mistakes:', error);
    }
  },

  // Get mistakes by type
  getByType(type: MistakeRecord['type']): MistakeRecord[] {
    return this.getAll().filter(m => m.type === type);
  },

  // Get mistakes by topic
  getByTopic(topic: string): MistakeRecord[] {
    return this.getAll().filter(m => m.topic === topic);
  },
};
