import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: string): number {
  const numeric = price.replace(/[^0-9]/g, '');
  return parseInt(numeric, 10) || 0;
}

export function getSportIcon(type: string) {
  switch (type) {
    case 'gym': return 'Dumbbell';
    case 'futsal': return 'Trophy';
    case 'badminton': return 'Wind';
    case 'padel': return 'Zap';
    case 'jogging': return 'Footprints';
    case 'mini soccer': return 'Goal';
    default: return 'MapPin';
  }
}
