import { BrowserRouter, Routes, Route } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import MapPage      from './pages/MapPage'
import QuizPage     from './pages/QuizPage'
import ReviewPage   from './pages/ReviewPage'
import ProgressPage from './pages/ProgressPage'
import AnalysisPage from './pages/AnalysisPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="pb-16">
        <Routes>
          <Route path="/"          element={<MapPage />} />
          <Route path="/quiz"      element={<QuizPage />} />
          <Route path="/review"    element={<ReviewPage />} />
          <Route path="/progress"  element={<ProgressPage />} />
          <Route path="/analysis"  element={<AnalysisPage />} />
        </Routes>
      </div>
      <BottomNav />
    </BrowserRouter>
  )
}
