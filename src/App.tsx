import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import About from "./pages/About";
import Mission from "./pages/Mission";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Blog from "./pages/Blog";
import Article from "./pages/Article";
import Testimonials from "./pages/Testimonials";
import Events from "./pages/Events";
import FAQ from "./pages/FAQ";
import Shop from "./pages/Shop";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DashboardInvoices from "./pages/dashboard/DashboardInvoices";
import DashboardDownloads from "./pages/dashboard/DashboardDownloads";
import DashboardMessages from "./pages/dashboard/DashboardMessages";
import DashboardNotifications from "./pages/dashboard/DashboardNotifications";
import DashboardProfile from "./pages/dashboard/DashboardProfile";
import Admin from "./pages/Admin";
import AdminServices from "./pages/admin/AdminServices";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminCalendar from "./pages/admin/AdminCalendar";
import AdminUsers from "./pages/admin/AdminUsers";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/a-propos" element={<About />} />
          <Route path="/notre-mission" element={<Mission />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<Article />} />
          <Route path="/temoignages" element={<Testimonials />} />
          <Route path="/evenements" element={<Events />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/boutique" element={<Shop />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/connexion" element={<Login />} />
          <Route path="/inscription" element={<Register />} />
          <Route
            path="/tableau-de-bord"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tableau-de-bord/factures"
            element={
              <ProtectedRoute>
                <DashboardInvoices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tableau-de-bord/telechargements"
            element={
              <ProtectedRoute>
                <DashboardDownloads />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tableau-de-bord/messages"
            element={
              <ProtectedRoute>
                <DashboardMessages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tableau-de-bord/notifications"
            element={
              <ProtectedRoute>
                <DashboardNotifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tableau-de-bord/profil"
            element={
              <ProtectedRoute>
                <DashboardProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/administration"
            element={
              <ProtectedRoute staffOnly>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/administration/services"
            element={
              <ProtectedRoute staffOnly>
                <AdminServices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/administration/blog"
            element={
              <ProtectedRoute staffOnly>
                <AdminBlog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/administration/evenements"
            element={
              <ProtectedRoute staffOnly>
                <AdminEvents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/administration/boutique"
            element={
              <ProtectedRoute staffOnly>
                <AdminProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/administration/temoignages"
            element={
              <ProtectedRoute staffOnly>
                <AdminTestimonials />
              </ProtectedRoute>
            }
          />
          <Route
            path="/administration/rendez-vous"
            element={
              <ProtectedRoute staffOnly>
                <AdminAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/administration/calendrier"
            element={
              <ProtectedRoute staffOnly>
                <AdminCalendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/administration/utilisateurs"
            element={
              <ProtectedRoute adminOnly>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route path="/confidentialite" element={<Privacy />} />
          <Route path="/conditions" element={<Terms />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
