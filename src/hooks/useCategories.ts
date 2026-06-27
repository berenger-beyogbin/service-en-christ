import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Category, Subcategory } from '../types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const [catsRes, subsRes] = await Promise.all([
        supabase.from('categories').select('*').eq('actif', true).order('ordre'),
        supabase.from('subcategories').select('*').eq('actif', true).order('ordre')
      ]);
      if (catsRes.error) setError(catsRes.error.message);
      else setCategories(catsRes.data ?? []);
      if (!subsRes.error) setSubcategories(subsRes.data ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  return { categories, subcategories, loading, error };
}
