import { Navigate, createBrowserRouter } from "react-router";
import { SignInPage } from "@/modules/auth/components/sign-in-page";
import { OnboardingPage } from "@/modules/onboarding/components/onboarding-page";
import { AppLayout } from "@/modules/shared/components/app-layout";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <Navigate to="/signin" replace />,
      },
      {
        path: "/signin",
        element: <SignInPage />,
      },
      {
        path: "/onboarding",
        element: <OnboardingPage />,
      },
    ],
  },
]);
