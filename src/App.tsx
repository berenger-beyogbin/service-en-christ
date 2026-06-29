import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminRoute } from './components/auth/AdminRoute';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { BottomNav } from './components/layout/BottomNav';

// Pages existantes (CONSERVER TELLES QUELLES)
import { Home } from './pages/Home';
import { Inscription } from './pages/auth/Inscription';
import { Connexion } from './pages/auth/Connexion';
import { VerificationEmail } from './pages/auth/VerificationEmail';
import { Reinitialisation } from './pages/auth/Reinitialisation';
import { NouveauMotDePasse } from './pages/auth/NouveauMotDePasse';
import { MonProfil } from './pages/profil/MonProfil';
import { ModifierProfil } from './pages/profil/ModifierProfil';
import { Securite } from './pages/profil/Securite';
import { Recherche } from './pages/recherche/Recherche';
import { CreerProfil } from './pages/prestataire/CreerProfil';
import { ModifierProfilPrestataire } from './pages/prestataire/ModifierProfil';
import { MonTableauBord } from './pages/prestataire/MonTableauBord';
import { FichePublique } from './pages/prestataire/FichePublique';
import { Signaler } from './pages/signalement/Signaler';
import { Dashboard } from './pages/admin/Dashboard';
import { Profils } from './pages/admin/Profils';
import { ValidationProfil } from './pages/admin/ValidationProfil';
import { Signalements } from './pages/admin/Signalements';
import { Categories } from './pages/admin/Categories';
import { Statistiques } from './pages/admin/Statistiques';
import { Comptes } from './pages/admin/Comptes';
import { CompteDetail } from './pages/admin/CompteDetail';

// Nouvelles pages statiques (À CRÉER)
import { APropos } from './pages/static/APropos';
import { CGU } from './pages/static/CGU';
import { PolitiqueConfidentialite } from './pages/static/PolitiqueConfidentialite';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-neutral">
          <Header />
          <main className="flex-1 flex flex-col pb-[72px] md:pb-0">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth/inscription" element={<Inscription />} />
              <Route path="/auth/connexion" element={<Connexion />} />
              <Route path="/auth/verification" element={<VerificationEmail />} />
              <Route path="/auth/reinitialisation" element={<Reinitialisation />} />
              <Route path="/auth/nouveau-mot-de-passe" element={<NouveauMotDePasse />} />
              <Route path="/profil" element={<MonProfil />} />
              <Route path="/profil/modifier" element={<ModifierProfil />} />
              <Route path="/profil/securite" element={<Securite />} />
              <Route path="/recherche" element={<Recherche />} />
              <Route path="/prestataire/creer" element={<CreerProfil />} />
              <Route path="/prestataire/modifier" element={<ModifierProfilPrestataire />} />
              <Route path="/prestataire/tableau-de-bord" element={<MonTableauBord />} />
              <Route path="/prestataire/:id" element={<FichePublique />} />
              <Route path="/signaler/:provider_id" element={<Signaler />} />
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<Dashboard />} />
                <Route path="/admin/profils" element={<Profils />} />
                <Route path="/admin/profils/validation/:id" element={<ValidationProfil />} />
                <Route path="/admin/signalements" element={<Signalements />} />
                <Route path="/admin/categories" element={<Categories />} />
                <Route path="/admin/statistiques" element={<Statistiques />} />
                <Route path="/admin/comptes" element={<Comptes />} />
                <Route path="/admin/comptes/:id" element={<CompteDetail />} />
              </Route>
              <Route path="/a-propos" element={<APropos />} />
              <Route path="/cgu" element={<CGU />} />
              <Route path="/confidentialite" element={<PolitiqueConfidentialite />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <BottomNav />
        </div>
      </AuthProvider>
    </Router>
  );
}
