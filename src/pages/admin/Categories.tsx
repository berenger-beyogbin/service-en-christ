import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Category, Subcategory } from '../../types';
import { Toast } from '../../components/ui/Toast';
import {
  ArrowLeft, Plus, Settings, Edit2,
  Trash2, FolderPlus, X, AlertTriangle, FolderOpen
} from 'lucide-react';

// ─── Small reusable modal wrapper ────────────────────────────────────────────
const Modal: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({ onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
    <div className="absolute inset-0 bg-black/45 backdrop-blur-xs" onClick={onClose} />
    <div className="relative bg-white max-w-md w-full mx-4 p-6 rounded-2xl shadow-2xl border border-border">
      {children}
    </div>
  </div>
);

// ─── Confirmation delete dialog ───────────────────────────────────────────────
interface ConfirmDeleteProps {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}
const ConfirmDelete: React.FC<ConfirmDeleteProps> = ({ title, description, onConfirm, onCancel, loading }) => (
  <Modal onClose={onCancel}>
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-red-50 border border-red-100">
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </span>
        <h3 className="font-bold text-text text-base">{title}</h3>
      </div>
      <p className="text-xs text-muted leading-relaxed">{description}</p>
      <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
        <button
          onClick={onCancel}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-xs font-semibold hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-red-500 hover:bg-red-600 text-white px-4 text-xs font-bold shadow-xs"
        >
          {loading ? "Suppression..." : "Supprimer"}
        </button>
      </div>
    </div>
  </Modal>
);

// ─── Preset icon names (Lucide) ────────────────────────────────────────────────
const ICON_PRESETS = [
  'Wrench','Laptop','GraduationCap','Calendar','Heart','Briefcase',
  'Car','ShoppingBag','Home','Camera','Music','Utensils',
  'Baby','Leaf','Dumbbell','BookOpen','Palette','Truck',
];

const COULEUR_PRESETS = [
  '#1e3a5f','#0ea5e9','#10b981','#f59e0b','#ef4444',
  '#8b5cf6','#ec4899','#14b8a6','#f97316','#6366f1',
];

// ─── Main component ────────────────────────────────────────────────────────────
export const Categories: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // ── Category modals ──
  type CatModal = 'add' | 'edit' | 'delete' | null;
  const [catModal, setCatModal] = useState<CatModal>(null);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catNom, setCatNom] = useState('');
  const [catIcone, setCatIcone] = useState('Wrench');
  const [catCouleur, setCatCouleur] = useState('#1e3a5f');
  const [catOrdre, setCatOrdre] = useState(1);

  // ── Subcategory modals ──
  type SubModal = 'add' | 'edit' | 'delete' | null;
  const [subModal, setSubModal] = useState<SubModal>(null);
  const [editingSub, setEditingSub] = useState<Subcategory | null>(null);
  const [selectedCatId, setSelectedCatId] = useState('');
  const [subName, setSubName] = useState('');
  const [subOrder, setSubOrder] = useState<number>(1);

  useEffect(() => {
    if (profile && !profile.is_admin) navigate('/', { replace: true });
  }, [profile, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: cats } = await supabase.from('categories').select('*').order('ordre', { ascending: true });
      const { data: subs } = await supabase.from('subcategories').select('*').order('ordre', { ascending: true });
      if (cats) setCategories(cats);
      if (subs) setSubcategories(subs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // ── Open helpers ──────────────────────────────────────────────────────────────
  const openAddCat = () => {
    setCatNom('');
    setCatIcone('Wrench');
    setCatCouleur('#1e3a5f');
    setCatOrdre(categories.length + 1);
    setCatModal('add');
  };

  const openEditCat = (cat: Category) => {
    setEditingCat(cat);
    setCatNom(cat.nom);
    setCatIcone(cat.icone);
    setCatCouleur(cat.couleur);
    setCatOrdre(cat.ordre);
    setCatModal('edit');
  };

  const openDeleteCat = (cat: Category) => {
    setEditingCat(cat);
    setCatModal('delete');
  };

  const openAddSub = () => {
    if (categories.length > 0) setSelectedCatId(categories[0].id);
    setSubName('');
    setSubOrder(1);
    setEditingSub(null);
    setSubModal('add');
  };

  const openEditSub = (sub: Subcategory) => {
    setEditingSub(sub);
    setSubName(sub.nom);
    setSubOrder(sub.ordre);
    setSubModal('edit');
  };

  const openDeleteSub = (sub: Subcategory) => {
    setEditingSub(sub);
    setSubModal('delete');
  };

  // ── CRUD: Categories ──────────────────────────────────────────────────────────
  const handleCreateCat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catNom.trim()) {
      setToast({ message: "Le nom est requis.", type: 'error' });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('categories').insert({
        id: `cat-${Date.now()}`,
        nom: catNom.trim(),
        icone: catIcone,
        couleur: catCouleur,
        ordre: catOrdre,
        actif: true,
      });
      if (error) throw error;
      setToast({ message: "Catégorie créée !", type: 'success' });
      setCatModal(null);
      loadData();
    } catch (err: any) {
      setToast({ message: err.message || "Erreur lors de la création.", type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat || !catNom.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('categories')
        .update({ nom: catNom.trim(), icone: catIcone, couleur: catCouleur, ordre: catOrdre })
        .eq('id', editingCat.id);
      if (error) throw error;
      setToast({ message: "Catégorie modifiée !", type: 'success' });
      setCatModal(null);
      loadData();
    } catch (err: any) {
      setToast({ message: err.message || "Erreur lors de la modification.", type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCat = async () => {
    if (!editingCat) return;
    setSaving(true);
    try {
      // Delete subcategories first
      await supabase.from('subcategories').delete().eq('category_id', editingCat.id);
      const { error } = await supabase.from('categories').delete().eq('id', editingCat.id);
      if (error) throw error;
      setToast({ message: "Catégorie supprimée.", type: 'success' });
      setCatModal(null);
      loadData();
    } catch (err: any) {
      setToast({ message: err.message || "Erreur lors de la suppression.", type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // ── CRUD: Subcategories ───────────────────────────────────────────────────────
  const handleCreateSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCatId || !subName.trim()) {
      setToast({ message: "Veuillez remplir tous les champs.", type: 'error' });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('subcategories').insert({
        id: `subcat-${Date.now()}`,
        category_id: selectedCatId,
        nom: subName.trim(),
        ordre: subOrder,
        actif: true,
      });
      if (error) throw error;
      setToast({ message: "Sous-catégorie créée !", type: 'success' });
      setSubModal(null);
      loadData();
    } catch (err: any) {
      setToast({ message: err.message || "Erreur lors de la création.", type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub || !subName.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('subcategories')
        .update({ nom: subName.trim(), ordre: subOrder })
        .eq('id', editingSub.id);
      if (error) throw error;
      setToast({ message: "Sous-catégorie modifiée !", type: 'success' });
      setSubModal(null);
      loadData();
    } catch (err: any) {
      setToast({ message: err.message || "Erreur lors de la modification.", type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSub = async () => {
    if (!editingSub) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('subcategories').delete().eq('id', editingSub.id);
      if (error) throw error;
      setToast({ message: "Sous-catégorie supprimée.", type: 'success' });
      setSubModal(null);
      loadData();
    } catch (err: any) {
      setToast({ message: err.message || "Erreur lors de la suppression.", type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // ── Shared form fields for category ──────────────────────────────────────────
  const CatFormFields = () => (
    <>
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-text uppercase tracking-wider">Nom de la catégorie</label>
        <input
          type="text"
          value={catNom}
          onChange={e => setCatNom(e.target.value)}
          placeholder="ex: Santé et bien-être"
          className="w-full h-11 px-3 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-text uppercase tracking-wider">Icône (nom Lucide)</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={catIcone}
            onChange={e => setCatIcone(e.target.value)}
            className="flex-1 h-11 px-3 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {ICON_PRESETS.map(icon => (
            <button
              key={icon}
              type="button"
              onClick={() => setCatIcone(icon)}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors ${
                catIcone === icon
                  ? 'bg-primary text-white border-primary'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-primary/40'
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-text uppercase tracking-wider">Couleur</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={catCouleur}
            onChange={e => setCatCouleur(e.target.value)}
            className="w-10 h-10 rounded border border-border cursor-pointer bg-transparent"
          />
          <input
            type="text"
            value={catCouleur}
            onChange={e => setCatCouleur(e.target.value)}
            className="flex-1 h-10 px-3 rounded-lg border border-border bg-gray-50 text-sm font-mono"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap pt-1">
          {COULEUR_PRESETS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setCatCouleur(c)}
              style={{ background: c }}
              className={`w-6 h-6 rounded-full border-2 transition-all ${catCouleur === c ? 'border-text scale-110' : 'border-white hover:scale-105'}`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-text uppercase tracking-wider">Ordre d'affichage</label>
        <input
          type="number"
          min={1}
          value={catOrdre}
          onChange={e => setCatOrdre(parseInt(e.target.value) || 1)}
          className="w-full h-11 px-3 rounded-lg border border-border bg-gray-50 text-sm font-semibold focus:bg-white"
        />
      </div>
    </>
  );

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 pt-5 pb-10 space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="p-2 border border-border bg-white rounded-lg hover:bg-gray-50 text-text cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-primary">Gestion des Secteurs d'Activité</h1>
            <p className="text-xs text-muted">Ajustez l'arborescence des services de l'annuaire</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openAddCat}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-primary text-primary hover:bg-primary/5 text-xs font-bold px-4 gap-1.5 cursor-pointer"
          >
            <FolderOpen className="h-4 w-4" />
            Nouvelle catégorie
          </button>
          <button
            onClick={openAddSub}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary hover:bg-secondary text-white text-xs font-bold px-4 gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="h-4.5 w-4.5" />
            Ajouter une sous-catégorie
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-white border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Categories list */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-bold text-sm text-text uppercase tracking-wide">
              Catégories Principales ({categories.length})
            </h3>

            <div className="space-y-3">
              {categories.map(cat => {
                const subs = subcategories.filter(s => s.category_id === cat.id);
                return (
                  <div key={cat.id} className="bg-white p-4 sm:p-5 border border-border rounded-xl space-y-3">
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="flex-shrink-0 font-sans font-black text-xs text-muted tracking-wider uppercase bg-gray-100 px-2 py-0.5 rounded-md">
                          {cat.ordre}
                        </span>
                        <span
                          className="flex-shrink-0 w-2 h-2 rounded-full"
                          style={{ background: cat.couleur || '#1e3a5f' }}
                        />
                        <h4 className="font-bold text-primary text-sm truncate">{cat.nom}</h4>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="inline-flex rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-primary border border-sky-100">
                          {subs.length} sous-cat.
                        </span>
                        <button
                          onClick={() => openEditCat(cat)}
                          title="Modifier"
                          className="p-1.5 rounded-md text-muted hover:text-primary hover:bg-gray-100 transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openDeleteCat(cat)}
                          title="Supprimer"
                          className="p-1.5 rounded-md text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {subs.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
                        {subs.map(sub => (
                          <span
                            key={sub.id}
                            className="group inline-flex items-center gap-1 rounded-md bg-gray-50 text-gray-700 px-2 py-0.5 text-[10px] font-semibold border border-gray-150"
                          >
                            {sub.nom}
                            <button
                              onClick={() => openEditSub(sub)}
                              title="Modifier"
                              className="opacity-0 group-hover:opacity-100 text-muted hover:text-primary transition-opacity"
                            >
                              <Edit2 className="h-2.5 w-2.5" />
                            </button>
                            <button
                              onClick={() => openDeleteSub(sub)}
                              title="Supprimer"
                              className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-500 transition-opacity"
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-5 border border-border rounded-2xl space-y-4">
              <h3 className="font-bold text-text text-xs uppercase tracking-wide">Guide d'Arborescence</h3>
              <p className="text-xs text-muted leading-relaxed">
                Vous pouvez créer, modifier et supprimer des catégories et sous-catégories.
                Survolez un badge de sous-catégorie pour accéder à ses actions.
              </p>
              <div className="rounded-xl border border-amber-100 bg-amber-50/20 p-3.5 text-[11px] text-amber-800 leading-normal flex gap-2">
                <Settings className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
                <span>Supprimer une catégorie supprime aussi toutes ses sous-catégories. Cette action est irréversible.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CATEGORY: Add modal ── */}
      {catModal === 'add' && (
        <Modal onClose={() => setCatModal(null)}>
          <form onSubmit={handleCreateCat} className="space-y-4">
            <div className="flex items-center gap-1.5 border-b border-gray-100 pb-3">
              <FolderOpen className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-text text-base">Nouvelle catégorie</h3>
            </div>
            <CatFormFields />
            <div className="flex gap-3 justify-end pt-3 border-t border-gray-100">
              <button type="button" onClick={() => setCatModal(null)} className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-xs font-semibold hover:bg-gray-50">
                Annuler
              </button>
              <button type="submit" disabled={saving} className="inline-flex h-10 items-center justify-center rounded-lg bg-primary hover:bg-secondary text-white px-4 text-xs font-bold shadow-xs">
                {saving ? "Création..." : "Créer la catégorie"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── CATEGORY: Edit modal ── */}
      {catModal === 'edit' && editingCat && (
        <Modal onClose={() => setCatModal(null)}>
          <form onSubmit={handleUpdateCat} className="space-y-4">
            <div className="flex items-center gap-1.5 border-b border-gray-100 pb-3">
              <Edit2 className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-text text-base">Modifier la catégorie</h3>
            </div>
            <CatFormFields />
            <div className="flex gap-3 justify-end pt-3 border-t border-gray-100">
              <button type="button" onClick={() => setCatModal(null)} className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-xs font-semibold hover:bg-gray-50">
                Annuler
              </button>
              <button type="submit" disabled={saving} className="inline-flex h-10 items-center justify-center rounded-lg bg-primary hover:bg-secondary text-white px-4 text-xs font-bold shadow-xs">
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── CATEGORY: Delete confirm ── */}
      {catModal === 'delete' && editingCat && (
        <ConfirmDelete
          title={`Supprimer « ${editingCat.nom} » ?`}
          description={`Cette action est irréversible. ${subcategories.filter(s => s.category_id === editingCat.id).length} sous-catégorie(s) seront également supprimées.`}
          onConfirm={handleDeleteCat}
          onCancel={() => setCatModal(null)}
          loading={saving}
        />
      )}

      {/* ── SUB-CATEGORY: Add modal ── */}
      {subModal === 'add' && (
        <Modal onClose={() => setSubModal(null)}>
          <form onSubmit={handleCreateSub} className="space-y-4">
            <div className="flex items-center gap-1.5 border-b border-gray-100 pb-3">
              <FolderPlus className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-text text-base">Ajouter une sous-catégorie</h3>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text uppercase tracking-wider">Catégorie Principale</label>
              <select
                value={selectedCatId}
                onChange={e => setSelectedCatId(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm"
              >
                {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text uppercase tracking-wider">Nom de la sous-catégorie</label>
              <input
                type="text"
                value={subName}
                onChange={e => setSubName(e.target.value)}
                placeholder="ex: Carreleur, Webmaster Freelance"
                className="w-full h-11 px-3 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text uppercase tracking-wider">Ordre d'affichage</label>
              <input
                type="number"
                min={1}
                value={subOrder}
                onChange={e => setSubOrder(parseInt(e.target.value) || 1)}
                className="w-full h-11 px-3 rounded-lg border border-border bg-gray-50 text-sm font-semibold focus:bg-white"
              />
            </div>

            <div className="flex gap-3 justify-end pt-3 border-t border-gray-100">
              <button type="button" onClick={() => setSubModal(null)} className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-xs font-semibold hover:bg-gray-50">
                Annuler
              </button>
              <button type="submit" disabled={saving} className="inline-flex h-10 items-center justify-center rounded-lg bg-primary hover:bg-secondary text-white px-4 text-xs font-bold shadow-xs">
                {saving ? "Création..." : "Créer la sous-catégorie"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── SUB-CATEGORY: Edit modal ── */}
      {subModal === 'edit' && editingSub && (
        <Modal onClose={() => setSubModal(null)}>
          <form onSubmit={handleUpdateSub} className="space-y-4">
            <div className="flex items-center gap-1.5 border-b border-gray-100 pb-3">
              <Edit2 className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-text text-base">Modifier la sous-catégorie</h3>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text uppercase tracking-wider">Nom</label>
              <input
                type="text"
                value={subName}
                onChange={e => setSubName(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text uppercase tracking-wider">Ordre d'affichage</label>
              <input
                type="number"
                min={1}
                value={subOrder}
                onChange={e => setSubOrder(parseInt(e.target.value) || 1)}
                className="w-full h-11 px-3 rounded-lg border border-border bg-gray-50 text-sm font-semibold focus:bg-white"
              />
            </div>

            <div className="flex gap-3 justify-end pt-3 border-t border-gray-100">
              <button type="button" onClick={() => setSubModal(null)} className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-xs font-semibold hover:bg-gray-50">
                Annuler
              </button>
              <button type="submit" disabled={saving} className="inline-flex h-10 items-center justify-center rounded-lg bg-primary hover:bg-secondary text-white px-4 text-xs font-bold shadow-xs">
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── SUB-CATEGORY: Delete confirm ── */}
      {subModal === 'delete' && editingSub && (
        <ConfirmDelete
          title={`Supprimer « ${editingSub.nom} » ?`}
          description="Cette sous-catégorie sera supprimée définitivement."
          onConfirm={handleDeleteSub}
          onCancel={() => setSubModal(null)}
          loading={saving}
        />
      )}
    </div>
  );
};

export default Categories;
