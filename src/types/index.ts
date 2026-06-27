export interface Profile {
  id: string;
  prenom: string;
  nom: string;
  telephone?: string;
  ville: string;
  quartier?: string;
  is_provider: boolean;
  is_admin: boolean;
  statut_compte: 'actif' | 'suspendu' | 'supprime';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  email_ref?: string; // used for auth linkage
}

export interface Category {
  id: string;
  nom: string;
  icone: string; // Lucide icon name
  couleur: string; // Hex color code
  ordre: number;
  actif: boolean;
  created_at: string;
}

export interface Subcategory {
  id: string;
  category_id: string;
  nom: string;
  actif: boolean;
  ordre: number;
}

export interface ProviderProfile {
  id: string;
  user_id: string;
  titre: string;
  description: string;
  experience_annees?: number;
  telephone_pro?: string;
  whatsapp?: string;
  email_pro?: string;
  ville: string;
  quartier?: string;
  adresse_detail?: string;
  tarif_min?: number;
  tarif_max?: number;
  tarif_unite: string; // e.g., 'FCFA', 'FCFA/heure'
  disponibilite?: string;
  site_web?: string;
  facebook?: string;
  instagram?: string;
  statut_validation: 'en_attente' | 'valide' | 'rejete' | 'suspendu';
  motif_rejet?: string;
  note_moyenne: number;
  nombre_avis: number;
  charte_acceptee: boolean;
  charte_version: string;
  date_acceptation_charte?: string;
  categorie_sante: boolean;
  created_at: string;
  updated_at: string;
  validated_at?: string;
  validated_by?: string;
  provider_categories?: any[];
}

export interface ProviderCategory {
  id: string;
  provider_profile_id: string;
  subcategory_id: string;
  is_primary: boolean;
}

export interface PortfolioPhoto {
  id: string;
  provider_profile_id: string;
  url: string;
  legende?: string;
  ordre: number;
  actif: boolean;
  created_at: string;
}

export interface ContactEvent {
  id: string;
  provider_profile_id: string;
  type_contact: 'appel' | 'whatsapp' | 'email';
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id?: string;
  provider_id: string;
  motif_code: 'fausse_identite' | 'arnaque' | 'comportement_irrespectueux' | 'fausse_competence' | 'spam' | 'autre';
  description?: string;
  statut: 'en_attente' | 'en_cours' | 'resolu' | 'rejete';
  decision_admin?: string;
  admin_id?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_id?: string;
  target_type?: string;
  details?: any;
  created_at: string;
}
