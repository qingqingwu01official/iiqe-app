import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import HomePage from './pages/HomePage'
import FoundationPage from './pages/FoundationPage'
import SprintPage from './pages/SprintPage'
import QuizPage from './pages/QuizPage'
import AnalysisPage from './pages/AnalysisPage'
import GridPage from './pages/GridPage'
import ErrorBookPage from './pages/ErrorBookPage'
import MePage from './pages/MePage'

const BOTTOM_NAV_PATHS = ['/', '/grid', '/errors', '/me']

function AppRoutes() {
  const { pathname } = useLocation()
  const showNav = BOTTOM_NAV_PATHS.includes(pathname)
  return (
    <>
      <Routes>
        <Route path="/"             element={<HomePage />} />
        <Route path="/foundation"   element={<FoundationPage />} />
        <Route path="/sprint"       element={<SprintPage />} />
        <Route path="/quiz"         element={<QuizPage />} />
        <Route path="/analysis/:id" element={<AnalysisPage />} />
        <Route path="/grid"         element={<GridPage />} />
        <Route path="/errors"       element={<ErrorBookPage />} />
        <Route path="/me"           element={<MePage />} />
      </Routes>
      {showNav && <BottomNav />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
