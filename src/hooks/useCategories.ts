import { useAppContext } from '../context/AppContext';
import { Category } from '../types';

export function useCategories() {
  const { categories, addCustomCategory, removeCustomCategory } = useAppContext();
  return { categories, addCustomCategory, removeCustomCategory };
}

export function useCategoryById(id: string): Category | undefined {
  const { categories } = useAppContext();
  return categories.find((c) => c.id === id);
}
