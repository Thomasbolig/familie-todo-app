'use client';

import { useState } from 'react';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [activeTab, setActiveTab] = useState('login');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = '/dashboard';
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = '/dashboard';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header */}
      <header style={{ padding: '2rem 0', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>
            📝 Familie TODO
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.9)', maxWidth: '600px', margin: '0 auto' }}>
            Organiser familieprosjekter, del oppgaver og hold oversikt over alt fra skilsmisse til hverdagssysler.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
        <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Velkommen</h2>

          {/* Tabs */}
          <div style={{ display: 'flex', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
            <button
              onClick={() => setActiveTab('login')}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: 'none',
                background: activeTab === 'login' ? '#3b82f6' : 'transparent',
                color: activeTab === 'login' ? 'white' : '#6b7280',
                borderRadius: '0.5rem 0.5rem 0 0',
                cursor: 'pointer'
              }}
            >
              Logg inn
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: 'none',
                background: activeTab === 'signup' ? '#3b82f6' : 'transparent',
                color: activeTab === 'signup' ? 'white' : '#6b7280',
                borderRadius: '0.5rem 0.5rem 0 0',
                cursor: 'pointer'
              }}
            >
              Registrer
            </button>
          </div>

          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">E-post</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="din@email.no"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="form-label">Passord</label>
                <input
                  className="form-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Logg inn
              </button>
            </form>
          )}

          {/* Signup Form */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Navn</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Ditt navn"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="form-label">E-post</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="din@email.no"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="form-label">Passord</label>
                <input
                  className="form-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Opprett konto
              </button>
            </form>
          )}
        </div>

        {/* Features Section */}
        <div style={{ marginTop: '4rem', textAlign: 'center' }}>
          <h2 style={{ color: 'white', marginBottom: '2rem' }}>Funksjoner</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="card">
              <h3 style={{ marginBottom: '0.5rem' }}>🎯 Prosjektbasert</h3>
              <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                Organiser oppgaver under prosjekter som "Selge huset"
              </p>
            </div>
            <div className="card">
              <h3 style={{ marginBottom: '0.5rem' }}>👥 Familiesamarbeid</h3>
              <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                Del prosjekter med familiemedlemmer
              </p>
            </div>
            <div className="card">
              <h3 style={{ marginBottom: '0.5rem' }}>📅 Kalender</h3>
              <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                Håndter barnas aktiviteter og transport
              </p>
            </div>
            <div className="card">
              <h3 style={{ marginBottom: '0.5rem' }}>🔒 Sikkerhet</h3>
              <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                Granulær tilgangskontroll og privatliv
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', margin: '4rem 0', padding: '2rem', background: 'rgba(255,255,255,0.1)', borderRadius: '1rem' }}>
          <h2 style={{ color: 'white', marginBottom: '1rem' }}>Klar til å organisere familielivet?</h2>
          <button className="btn btn-secondary" style={{ background: 'white', color: '#3b82f6' }}>
            Kom i gang nå
          </button>
        </div>
      </main>
    </div>
  );
}