import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { AboutUs } from './pages/AboutUs';
import MediaGallery from './pages/MediaGallery';
import { Members } from './pages/Members';
import { Events } from './pages/Events';
import { Donations } from './pages/Donations';
import { Posts } from './pages/Posts';
import { Contact } from './pages/Contact';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ImageUploadTest } from './components/ui/ImageUploadTest';
import ImageKitTest from './pages/ImageKitTest';
import { EmailTest } from './pages/EmailTest';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { Terms } from './pages/Terms';
import { RefundPolicy } from './pages/RefundPolicy';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Toaster position="top-right" />
        
        <Routes>
          {/* Admin Routes - No Header/Footer */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Public Routes - With Header/Footer */}
          <Route 
            path="/" 
            element={
              <>
                <Header />
                <main className="flex-1">
                  <Home />
                </main>
                <Footer />
              </>
            } 
          />
          <Route 
            path="/about" 
            element={
              <>
                <Header />
                <main className="flex-1">
                  <AboutUs />
                </main>
                <Footer />
              </>
            } 
          />
          <Route 
            path="/media" 
            element={
              <>
                <Header />
                <main className="flex-1">
                  <MediaGallery />
                </main>
                <Footer />
              </>
            } 
          />
          <Route 
            path="/members" 
            element={
              <>
                <Header />
                <main className="flex-1">
                  <Members />
                </main>
                <Footer />
              </>
            } 
          />
          <Route 
            path="/events" 
            element={
              <>
                <Header />
                <main className="flex-1">
                  <Events />
                </main>
                <Footer />
              </>
            } 
          />
          <Route 
            path="/donations" 
            element={
              <>
                <Header />
                <main className="flex-1">
                  <Donations />
                </main>
                <Footer />
              </>
            } 
          />
          <Route 
            path="/posts" 
            element={
              <>
                <Header />
                <main className="flex-1">
                  <Posts />
                </main>
                <Footer />
              </>
            } 
          />
          <Route 
            path="/contact" 
            element={
              <>
                <Header />
                <main className="flex-1">
                  <Contact />
                </main>
                <Footer />
              </>
            } 
          />
          <Route 
            path="/about" 
            element={
              <>
                <Header />
                <main className="flex-1">
                  <AboutUs />
                </main>
                <Footer />
              </>
            } 
          />
          <Route 
            path="/test-upload" 
            element={
              <>
                <Header />
                <main className="flex-1 py-8">
                  <ImageUploadTest />
                </main>
                <Footer />
              </>
            } 
          />
          <Route 
            path="/imagekit-test" 
            element={
              <>
                <Header />
                <main className="flex-1">
                  <ImageKitTest />
                </main>
                <Footer />
              </>
            } 
          />
          <Route 
            path="/email-test" 
            element={
              <>
                <Header />
                <main className="flex-1">
                  <EmailTest />
                </main>
                <Footer />
              </>
            } 
          />
          <Route 
            path="/privacy-policy" 
            element={
              <>
                <Header />
                <main className="flex-1">
                  <PrivacyPolicy />
                </main>
                <Footer />
              </>
            } 
          />
          <Route 
            path="/terms" 
            element={
              <>
                <Header />
                <main className="flex-1">
                  <Terms />
                </main>
                <Footer />
              </>
            } 
          />
          <Route 
            path="/refund-policy" 
            element={
              <>
                <Header />
                <main className="flex-1">
                  <RefundPolicy />
                </main>
                <Footer />
              </>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;