import { createBrowserRouter } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import RoleRoute from './RoleRoute'
import LandingPage from '../pages/LandingPage'
import BrowsePage from '../pages/BrowsePage'
import InitiativeDetailPage from '../pages/InitiativeDetailPage'
import LoginPage from '../pages/LoginPage'
import RegisterVolunteerPage from '../pages/RegisterVolunteerPage'
import RegisterOrganizationPage from '../pages/RegisterOrganizationPage'
import FeedPage from '../pages/FeedPage'
import ProfilePage from '../pages/ProfilePage'
import ApplicationsPage from '../pages/ApplicationsPage'
import DashboardPage from '../pages/DashboardPage'
import InitiativeFormPage from '../pages/InitiativeFormPage'
import InitiativeApplicationsPage from '../pages/InitiativeApplicationsPage'
import AdminOrganizationsPage from '../pages/AdminOrganizationsPage'
import AdminOrganizationReviewPage from '../pages/AdminOrganizationReviewPage'
import OrgPublicPage from '../pages/OrgPublicPage'

const router = createBrowserRouter([
  // Public routes
  { path: '/', element: <LandingPage /> },
  { path: '/initiatives', element: <BrowsePage /> },
  { path: '/initiatives/:id', element: <InitiativeDetailPage /> },
  { path: '/organizations/:id', element: <OrgPublicPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register/volunteer', element: <RegisterVolunteerPage /> },
  { path: '/register/organization', element: <RegisterOrganizationPage /> },

  // Volunteer-only routes (actor=USER, role=VOLUNTEER)
  {
    element: <RoleRoute actor="USER" role="VOLUNTEER" />,
    children: [
      { path: '/feed', element: <FeedPage /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/applications', element: <ApplicationsPage /> },
    ],
  },

  // Organization-only routes (actor=ORGANIZATION)
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleRoute actor="ORGANIZATION" />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/initiatives/new', element: <InitiativeFormPage /> },
          { path: '/initiatives/:id/edit', element: <InitiativeFormPage /> },
          { path: '/initiatives/:id/applications', element: <InitiativeApplicationsPage /> },
        ],
      },
    ],
  },

  // Admin-only routes (role=ADMIN)
  {
    element: <RoleRoute role="ADMIN" />,
    children: [
      { path: '/admin/organizations', element: <AdminOrganizationsPage /> },
      { path: '/admin/organizations/:id', element: <AdminOrganizationReviewPage /> },
    ],
  },
])

export default router
