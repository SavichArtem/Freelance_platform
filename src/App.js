import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import './App.css';

function App() {
  return (
    <HashRouter>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>

          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;