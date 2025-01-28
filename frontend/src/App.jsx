import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import ErrorBoundary from './components/common/ErrorBoundary';
import NotificationContainer from './components/common/NotificationContainer';
import Dashboard from './components/Dashboard';
import ProfileManagement from './components/ProfileManagement';
import ChoreManagement from './components/ChoreManagement';
import RewardManagement from './components/RewardManagement';
import PenaltyManagement from './components/PenaltyManagement';
import Navigation from './components/Navigation';

function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <Router>
          <div className="min-h-screen bg-gray-100">
            <Navigation />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/profiles" element={<ProfileManagement />} />
                <Route path="/chores" element={<ChoreManagement />} />
                <Route path="/rewards" element={<RewardManagement />} />
                <Route path="/penalties" element={<PenaltyManagement />} />
              </Routes>
            </main>
            <NotificationContainer />
          </div>
        </Router>
      </ErrorBoundary>
    </Provider>
  );
}

export default App; 