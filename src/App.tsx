import { useState } from 'react';
import Stack from './components/Stack';
import { GarageView } from './views/GarageView';
import { WinnersView } from './views/WinnersView';
import { RaceProvider } from './context/RaceContext';
import './App.css';

type Page = 'garage' | 'winners';

const TABS: { id: Page; label: string }[] = [
  { id: 'garage', label: 'Garage' },
  { id: 'winners', label: 'Winners' },
];

export default function App() {
  const [page, setPage] = useState<Page>('garage');

  return (
    <RaceProvider>
      <div className="app">
        <nav className="nav">
          <Stack direction="row" alignItems="center" spacing={0}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`nav-tab${page === tab.id ? ' active' : ''}`}
                onClick={() => setPage(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </Stack>
        </nav>

        <main className="page">
          <div style={{ display: page === 'garage' ? 'block' : 'none' }}><GarageView /></div>
          <div style={{ display: page === 'winners' ? 'block' : 'none' }}><WinnersView /></div>
        </main>
      </div>
    </RaceProvider>
  );
}
