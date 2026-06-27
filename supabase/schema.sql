-- ============================================================
-- SERVICE EN CHRIST — Schéma PostgreSQL complet
-- À exécuter dans Supabase > SQL Editor > New Query
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: profiles (extension de auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  prenom        TEXT NOT NULL DEFAULT '',
  nom           TEXT NOT NULL DEFAULT '',
  telephone     TEXT,
  ville         TEXT DEFAULT 'Abidjan',
  quartier      TEXT,
  is_provider   BOOLEAN NOT NULL DEFAULT FALSE,
  is_admin      BOOLEAN NOT NULL DEFAULT FALSE,
  statut_compte TEXT NOT NULL DEFAULT 'actif'
                  CHECK (statut_compte IN ('actif', 'suspendu', 'supprime')),
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: créer automatiquement un profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, prenom, nom, telephone, ville, quartier)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
    COALESCE(NEW.raw_user_meta_data->>'nom', ''),
    COALESCE(NEW.raw_user_meta_data->>'telephone', ''),
    COALESCE(NEW.raw_user_meta_data->>'ville', 'Abidjan'),
    COALESCE(NEW.raw_user_meta_data->>'quartier', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TABLE: categories
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom         TEXT NOT NULL UNIQUE,
  icone       TEXT NOT NULL,
  couleur     TEXT NOT NULL,
  ordre       INTEGER NOT NULL DEFAULT 0,
  actif       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: subcategories
-- ============================================================
CREATE TABLE IF NOT EXISTS subcategories (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id  UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  nom          TEXT NOT NULL,
  actif        BOOLEAN NOT NULL DEFAULT TRUE,
  ordre        INTEGER NOT NULL DEFAULT 0
);

-- ============================================================
-- TABLE: provider_profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS provider_profiles (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                  UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  titre                    TEXT NOT NULL,
  description              TEXT NOT NULL,
  experience_annees        INTEGER,
  telephone_pro            TEXT,
  whatsapp                 TEXT,
  email_pro                TEXT,
  ville                    TEXT NOT NULL DEFAULT 'Abidjan',
  quartier                 TEXT,
  adresse_detail           TEXT,
  tarif_min                NUMERIC(12,0),
  tarif_max                NUMERIC(12,0),
  tarif_unite              TEXT NOT NULL DEFAULT 'FCFA',
  disponibilite            TEXT,
  site_web                 TEXT,
  facebook                 TEXT,
  instagram                TEXT,
  statut_validation        TEXT NOT NULL DEFAULT 'en_attente'
                             CHECK (statut_validation IN (
                               'en_attente','valide','rejete','suspendu'
                             )),
  motif_rejet              TEXT,
  note_moyenne             NUMERIC(3,2) NOT NULL DEFAULT 0,
  nombre_avis              INTEGER NOT NULL DEFAULT 0,
  charte_acceptee          BOOLEAN NOT NULL DEFAULT FALSE,
  charte_version           TEXT NOT NULL DEFAULT '1.0',
  date_acceptation_charte  TIMESTAMPTZ,
  categorie_sante          BOOLEAN NOT NULL DEFAULT FALSE,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  validated_at             TIMESTAMPTZ,
  validated_by             UUID REFERENCES profiles(id)
);

-- ============================================================
-- TABLE: provider_categories
-- ============================================================
CREATE TABLE IF NOT EXISTS provider_categories (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_profile_id  UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  subcategory_id       UUID NOT NULL REFERENCES subcategories(id) ON DELETE CASCADE,
  is_primary           BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(provider_profile_id, subcategory_id)
);

-- ============================================================
-- TABLE: portfolio_photos (max 6 par prestataire)
-- ============================================================
CREATE TABLE IF NOT EXISTS portfolio_photos (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_profile_id  UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  url                  TEXT NOT NULL,
  legende              TEXT,
  ordre                INTEGER NOT NULL DEFAULT 0,
  actif                BOOLEAN NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: contact_events (anonyme — aucun user_id stocké)
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_events (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_profile_id  UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  type_contact         TEXT NOT NULL CHECK (type_contact IN ('appel','whatsapp','email')),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: reports (signalements)
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  provider_id      UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  motif_code       TEXT NOT NULL CHECK (motif_code IN (
                     'fausse_identite','arnaque','comportement_irrespectueux',
                     'fausse_competence','spam','autre'
                   )),
  description      TEXT,
  statut           TEXT NOT NULL DEFAULT 'en_attente'
                     CHECK (statut IN ('en_attente','en_cours','resolu','rejete')),
  decision_admin   TEXT,
  admin_id         UUID REFERENCES profiles(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at      TIMESTAMPTZ
);

-- ============================================================
-- TABLE: audit_logs (journal immuable)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id     UUID NOT NULL REFERENCES profiles(id),
  action       TEXT NOT NULL,
  target_id    UUID,
  target_type  TEXT,
  details      JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_photos   ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_events     ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports            ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories         ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories      ENABLE ROW LEVEL SECURITY;

-- Catégories et sous-catégories : lecture publique
CREATE POLICY "categories_lecture_publique" ON categories
  FOR SELECT USING (true);
CREATE POLICY "subcategories_lecture_publique" ON subcategories
  FOR SELECT USING (true);

-- Profiles : lecture des profils actifs
CREATE POLICY "profiles_lecture_publique" ON profiles
  FOR SELECT USING (statut_compte = 'actif');
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Provider profiles : lecture des validés uniquement (public)
CREATE POLICY "provider_profiles_lecture_valides" ON provider_profiles
  FOR SELECT USING (statut_validation = 'valide');
CREATE POLICY "provider_profiles_lecture_own" ON provider_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "provider_profiles_insert_own" ON provider_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "provider_profiles_update_own" ON provider_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Portfolio photos : lecture si profil validé
CREATE POLICY "portfolio_lecture_valide" ON portfolio_photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM provider_profiles pp
      WHERE pp.id = portfolio_photos.provider_profile_id
      AND pp.statut_validation = 'valide'
    )
  );
CREATE POLICY "portfolio_manage_own" ON portfolio_photos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM provider_profiles pp
      WHERE pp.id = portfolio_photos.provider_profile_id
      AND pp.user_id = auth.uid()
    )
  );

-- Provider categories : lecture publique (liée aux profils validés)
CREATE POLICY "provider_categories_lecture" ON provider_categories
  FOR SELECT USING (true);
CREATE POLICY "provider_categories_manage_own" ON provider_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM provider_profiles pp
      WHERE pp.id = provider_categories.provider_profile_id
      AND pp.user_id = auth.uid()
    )
  );

-- Contact events : insertion anonyme autorisée
CREATE POLICY "contact_events_insert_public" ON contact_events
  FOR INSERT WITH CHECK (true);

-- Contact events : lecture par le prestataire concerné
CREATE POLICY "contact_events_select_provider" ON contact_events
  FOR SELECT USING (
    provider_profile_id IN (
      SELECT id FROM provider_profiles WHERE user_id = auth.uid()
    )
  );

-- Reports : création par utilisateur inscrit
CREATE POLICY "reports_insert_auth" ON reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Audit logs : insertion par admin uniquement (géré côté app)
CREATE POLICY "audit_logs_insert" ON audit_logs
  FOR INSERT WITH CHECK (auth.uid() = admin_id);

-- ============================================================
-- POLITIQUES ADMIN (accès complet via is_admin)
-- ============================================================
-- Utiliser une fonction helper pour vérifier le rôle admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  );
END;
$$;

-- Admin : accès SELECT complet sur toutes les tables
CREATE POLICY "admin_select_all_profiles" ON profiles
  FOR SELECT USING (public.is_admin());
CREATE POLICY "admin_all_provider_profiles" ON provider_profiles
  FOR ALL USING (public.is_admin());
CREATE POLICY "admin_all_reports" ON reports
  FOR ALL USING (public.is_admin());
CREATE POLICY "admin_select_audit_logs" ON audit_logs
  FOR SELECT USING (public.is_admin());
CREATE POLICY "admin_manage_categories" ON categories
  FOR ALL USING (public.is_admin());
CREATE POLICY "admin_manage_subcategories" ON subcategories
  FOR ALL USING (public.is_admin());
CREATE POLICY "admin_select_contact_events" ON contact_events
  FOR SELECT USING (public.is_admin());

-- ============================================================
-- STORAGE BUCKET (photos profil + portfolio)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', TRUE)
ON CONFLICT DO NOTHING;

-- ============================================================
-- DONNÉES INITIALES — 10 catégories + sous-catégories
-- ============================================================

INSERT INTO categories (nom, icone, couleur, ordre) VALUES
  ('Maison et dépannage',              'Wrench',       '#E74C3C', 1),
  ('Informatique et numérique',        'Monitor',      '#3498DB', 2),
  ('Éducation et formation',           'BookOpen',     '#27AE60', 3),
  ('Événementiel',                     'Calendar',     '#9B59B6', 4),
  ('Transport et logistique',          'Truck',        '#F39C12', 5),
  ('Beauté et habillement',            'Scissors',     '#E91E63', 6),
  ('Commerce et restauration',         'ShoppingBag',  '#FF5722', 7),
  ('Services administratifs et pro',   'Briefcase',    '#607D8B', 8),
  ('Santé, bien-être et accomp.',      'Heart',        '#00BCD4', 9),
  ('Services Église et ministère',     'Church',       '#795548', 10)
ON CONFLICT (nom) DO NOTHING;

-- Sous-catégories (insertion par nom de catégorie)
DO $$
DECLARE v_cat_id UUID;
BEGIN

  SELECT id INTO v_cat_id FROM categories WHERE nom = 'Maison et dépannage';
  INSERT INTO subcategories (category_id, nom, ordre) VALUES
    (v_cat_id,'Plomberie',1),(v_cat_id,'Électricité',2),(v_cat_id,'Peinture',3),
    (v_cat_id,'Maçonnerie',4),(v_cat_id,'Menuiserie',5),(v_cat_id,'Climatisation',6),
    (v_cat_id,'Nettoyage',7),(v_cat_id,'Jardinage',8),(v_cat_id,'Sécurité / Serrurerie',9),(v_cat_id,'Autre',10)
  ON CONFLICT DO NOTHING;

  SELECT id INTO v_cat_id FROM categories WHERE nom = 'Informatique et numérique';
  INSERT INTO subcategories (category_id, nom, ordre) VALUES
    (v_cat_id,'Maintenance informatique',1),(v_cat_id,'Développement web',2),
    (v_cat_id,'Développement mobile',3),(v_cat_id,'Graphisme / Design',4),
    (v_cat_id,'Community management',5),(v_cat_id,'Formation bureautique',6),
    (v_cat_id,'Formation IA',7),(v_cat_id,'Cybersécurité',8),(v_cat_id,'Réparation téléphone',9),(v_cat_id,'Autre',10)
  ON CONFLICT DO NOTHING;

  SELECT id INTO v_cat_id FROM categories WHERE nom = 'Éducation et formation';
  INSERT INTO subcategories (category_id, nom, ordre) VALUES
    (v_cat_id,'Cours de soutien scolaire',1),(v_cat_id,'Répétiteur primaire',2),
    (v_cat_id,'Répétiteur secondaire',3),(v_cat_id,'Préparation examens (BEPC/BAC)',4),
    (v_cat_id,'Formation professionnelle',5),(v_cat_id,'Langues étrangères',6),
    (v_cat_id,'Formation en informatique',7),(v_cat_id,'Accompagnement étudiant',8),(v_cat_id,'Autre',9)
  ON CONFLICT DO NOTHING;

  SELECT id INTO v_cat_id FROM categories WHERE nom = 'Événementiel';
  INSERT INTO subcategories (category_id, nom, ordre) VALUES
    (v_cat_id,'Décoration',1),(v_cat_id,'Sonorisation',2),(v_cat_id,'Photographie',3),
    (v_cat_id,'Vidéographie',4),(v_cat_id,'Animation',5),(v_cat_id,'Protocole / Hôtesse',6),
    (v_cat_id,'Location de matériel',7),(v_cat_id,'Traiteur événementiel',8),(v_cat_id,'Autre',9)
  ON CONFLICT DO NOTHING;

  SELECT id INTO v_cat_id FROM categories WHERE nom = 'Transport et logistique';
  INSERT INTO subcategories (category_id, nom, ordre) VALUES
    (v_cat_id,'Chauffeur particulier',1),(v_cat_id,'Livraison de colis',2),
    (v_cat_id,'Déménagement',3),(v_cat_id,'Location de véhicule',4),
    (v_cat_id,'Transport événementiel',5),(v_cat_id,'Autre',6)
  ON CONFLICT DO NOTHING;

  SELECT id INTO v_cat_id FROM categories WHERE nom = 'Beauté et habillement';
  INSERT INTO subcategories (category_id, nom, ordre) VALUES
    (v_cat_id,'Coiffure femme',1),(v_cat_id,'Coiffure homme / Barbier',2),
    (v_cat_id,'Couture / Stylisme',3),(v_cat_id,'Maquillage',4),
    (v_cat_id,'Pressing / Blanchisserie',5),(v_cat_id,'Esthétique / Soins corps',6),(v_cat_id,'Autre',7)
  ON CONFLICT DO NOTHING;

  SELECT id INTO v_cat_id FROM categories WHERE nom = 'Commerce et restauration';
  INSERT INTO subcategories (category_id, nom, ordre) VALUES
    (v_cat_id,'Traiteur',1),(v_cat_id,'Pâtisserie / Boulangerie',2),
    (v_cat_id,'Restauration à domicile',3),(v_cat_id,'Vente de produits alimentaires',4),
    (v_cat_id,'Vente de produits divers',5),(v_cat_id,'Autre',6)
  ON CONFLICT DO NOTHING;

  SELECT id INTO v_cat_id FROM categories WHERE nom = 'Services administratifs et pro';
  INSERT INTO subcategories (category_id, nom, ordre) VALUES
    (v_cat_id,'Comptabilité / Fiscalité',1),(v_cat_id,'Assistance administrative',2),
    (v_cat_id,'Rédaction / Traduction',3),(v_cat_id,'Conseil en gestion',4),
    (v_cat_id,'Juridique',5),(v_cat_id,'Marketing / Communication',6),(v_cat_id,'Autre',7)
  ON CONFLICT DO NOTHING;

  SELECT id INTO v_cat_id FROM categories WHERE nom = 'Santé, bien-être et accomp.';
  INSERT INTO subcategories (category_id, nom, ordre) VALUES
    (v_cat_id,'Coaching de vie',1),(v_cat_id,'Accompagnement personnel (non médical)',2),
    (v_cat_id,'Nutrition et conseils alimentaires (non thérapeutique)',3),
    (v_cat_id,'Sport / Fitness / Yoga',4),(v_cat_id,'Massage bien-être',5),
    (v_cat_id,'Soins esthétiques non médicaux',6),(v_cat_id,'Autre',7)
  ON CONFLICT DO NOTHING;

  SELECT id INTO v_cat_id FROM categories WHERE nom = 'Services Église et ministère';
  INSERT INTO subcategories (category_id, nom, ordre) VALUES
    (v_cat_id,'Musicien / Instrumentiste',1),(v_cat_id,'Chantre / Choriste',2),
    (v_cat_id,'Technicien son / Régie',3),(v_cat_id,'Projection / Présentation',4),
    (v_cat_id,'Communication Église',5),(v_cat_id,'Formation biblique',6),
    (v_cat_id,'Encadrement jeunesse',7),(v_cat_id,'Secrétariat pastoral',8),(v_cat_id,'Autre',9)
  ON CONFLICT DO NOTHING;

END $$;
