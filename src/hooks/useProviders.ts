import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ProviderProfile } from '../types';

interface UseProvidersOptions {
  query?: string;
  categoryId?: string;
  subcategoryId?: string;
  ville?: string;
  page?: number;
  pageSize?: number;
}

export function useProviders(options: UseProvidersOptions = {}) {
  const { query = '', categoryId, subcategoryId, ville, page = 0, pageSize = 20 } = options;
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      let q = supabase
        .from('provider_profiles')
        .select('*', { count: 'exact' })
        .eq('statut_validation', 'valide')
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (query.trim()) q = q.or(`titre.ilike.%${query}%,description.ilike.%${query}%,quartier.ilike.%${query}%`);
      if (ville) q = q.eq('ville', ville);

      const { data, error: err, count } = await q;
      if (err) setError(err.message);
      else {
        setProviders(data ?? []);
        setTotal(count ?? 0);
      }
      setLoading(false);
    };
    fetch();
  }, [query, categoryId, subcategoryId, ville, page, pageSize]);

  return { providers, loading, error, total };
}
