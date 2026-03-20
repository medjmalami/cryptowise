export interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  percentage: number;
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;

  if (!password) {
    return {
      score: 0,
      label: 'Too weak',
      color: 'bg-red-500',
      percentage: 0,
    };
  }

  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Character type checks
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  // Normalize score to 0-4 range
  const normalizedScore = Math.min(Math.ceil(score / 2), 4);

  const strengths: Record<number, PasswordStrength> = {
    0: {
      score: 0,
      label: 'Too weak',
      color: 'bg-red-500',
      percentage: 0,
    },
    1: {
      score: 1,
      label: 'Weak',
      color: 'bg-red-500',
      percentage: 25,
    },
    2: {
      score: 2,
      label: 'Fair',
      color: 'bg-yellow-500',
      percentage: 50,
    },
    3: {
      score: 3,
      label: 'Good',
      color: 'bg-blue-500',
      percentage: 75,
    },
    4: {
      score: 4,
      label: 'Strong',
      color: 'bg-green-500',
      percentage: 100,
    },
  };

  return strengths[normalizedScore];
}
