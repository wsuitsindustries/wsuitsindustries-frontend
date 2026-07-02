import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import PageLoader from "./components/PageLoader"
import ScrollToTop from "./components/ScrollToTop"
import ErrorBoundary from "./components/ErrorBoundary"
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"

export default function App() {
  return (
    <BrowserRouter>
      <PageLoader />
      <Navbar />
      <ScrollToTop />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
      <Footer />
    </BrowserRouter>
  )
}