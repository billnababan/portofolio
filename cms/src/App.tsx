import { Navigate, Outlet, createBrowserRouter, useLocation, type RouteObject } from "react-router-dom";
import { Shell } from "./components/layout/Shell";
import { ErrorBlock, Spinner } from "./components/ui/Bits";
import { useAuth } from "./hooks/useAuth";
import { Account } from "./pages/Account";
import { Activity } from "./pages/Activity";
import { Analytics } from "./pages/Analytics";
import { Certifications } from "./pages/Certifications";
import { Dashboard } from "./pages/Dashboard";
import { Inbox } from "./pages/Inbox";
import { Login } from "./pages/Login";
import { MediaLibrary } from "./pages/MediaLibrary";
import { Profile } from "./pages/Profile";
import { ProjectEditor } from "./pages/ProjectEditor";
import { Projects } from "./pages/Projects";
import { Publish } from "./pages/Publish";
import { Seo } from "./pages/Seo";
import { Skills } from "./pages/Skills";
import { Users } from "./pages/Users";

function Protected() {
  const auth = useAuth();
  const location = useLocation();
  if (auth.isPending) return <Spinner label="Checking your session" />;
  if (auth.isError) return <ErrorBlock error={auth.error} retry={() => auth.refetch()} />;
  if (!auth.data) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Shell me={auth.data} />;
}

function OwnerOnly() {
  const { data } = useAuth();
  return data?.user.role === "owner" ? <Outlet /> : <Navigate to="/" replace />;
}

function GuestOnly() {
  const auth = useAuth();
  if (auth.isPending) return <Spinner />;
  return auth.data ? <Navigate to="/" replace /> : <Login />;
}

function NotFound() {
  return (
    <div className="card p-10 text-center">
      <p className="display text-[64px]">404</p>
      <p className="mt-2 text-mute">This page does not exist in the CMS.</p>
    </div>
  );
}

export const routes: RouteObject[] = [
  { path: "/login", element: <GuestOnly /> },
  {
    element: <Protected />,
    children: [
      { path: "/", element: <Dashboard /> },
      { path: "/analytics", element: <Analytics /> },
      { path: "/inbox", element: <Inbox /> },
      { path: "/inbox/:id", element: <Inbox /> },
      { path: "/content/profile", element: <Profile /> },
      { path: "/content/projects", element: <Projects /> },
      { path: "/content/projects/:id", element: <ProjectEditor /> },
      { path: "/content/skills", element: <Skills /> },
      { path: "/content/certifications", element: <Certifications /> },
      // Not "/media": that path serves the uploaded files.
      { path: "/library", element: <MediaLibrary /> },
      { path: "/seo", element: <Seo /> },
      { path: "/publish", element: <Publish /> },
      { path: "/activity", element: <Activity /> },
      { element: <OwnerOnly />, children: [{ path: "/users", element: <Users /> }] },
      { path: "/account", element: <Account /> },
      { path: "*", element: <NotFound /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
