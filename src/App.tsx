import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import HomePage from './components/HomePage';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <Header />
        <HomePage />
      </div>
    </AuthProvider>
  );
}

export default App;
