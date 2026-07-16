/**
 * Calculate grade based on score
 */
export function calculateGrade(score: number): string {
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  if (score >= 40) return 'E';
  return 'F';
}

/**
 * Calculate grade meaning
 */
export function getGradeMeaning(grade: string): string {
  const meanings: Record<string, string> = {
    'A': 'Excellent',
    'B': 'Very Good',
    'C': 'Good',
    'D': 'Fair',
    'E': 'Poor',
    'F': 'Fail',
  };
  return meanings[grade] || '';
}

/**
 * Auto-generate teacher remark based on average score
 */
export function generateTeacherRemark(average: number): string {
  if (average >= 80) return 'Excellent performance. Keep up the great work!';
  if (average >= 70) return 'Very good performance. Strive for excellence!';
  if (average >= 60) return 'Good performance. Can do even better with more effort.';
  if (average >= 50) return 'Fair performance. Needs to work harder for improvement.';
  if (average >= 40) return 'Poor performance. Serious effort is required.';
  return 'Very poor performance. Urgent academic attention needed.';
}

/**
 * Calculate total score from subject scores
 */
export function calculateTotal(scores: { score: number }[]): number {
  return scores.reduce((sum, s) => sum + s.score, 0);
}

/**
 * Calculate average score
 */
export function calculateAverage(total: number, count: number): number {
  if (count === 0) return 0;
  return Math.round((total / count) * 100) / 100;
}

/**
 * Generate a random 4-digit PIN for student
 */
export function generatePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Generate a random password for teachers
 */
export function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Format term name
 */
export function formatTermName(name: string): string {
  const terms: Record<string, string> = {
    'first': 'First Term',
    'second': 'Second Term',
    'third': 'Third Term',
  };
  return terms[name.toLowerCase()] || name;
}
