import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Review from './pages/Review'
import Kanban from './pages/Kanban'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import Capture from './pages/Capture'
import Archive from './pages/Archive'

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/review" element={<Review />} />
          <Route path="/kanban" element={<Kanban />} />
          <Route path="/board" element={<Kanban />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/capture" element={<Capture />} />
          <Route path="/archive" element={<Archive />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
