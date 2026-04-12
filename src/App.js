import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import MainPage from './pages/MainPage/MainPage';
import './App.css';

function App() {
  return (
    <HashRouter>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<MainPage />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;