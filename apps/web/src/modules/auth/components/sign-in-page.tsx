import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import {
  type SignInFormData,
  signInSchema,
} from "@/modules/auth/schemas/sign-in-schema";
import { getProfile } from "@/modules/auth/services/profile";
import { signIn } from "@/modules/auth/services/sign-in";
import { useUserStore } from "@/modules/auth/stores/user-store";
import { Button } from "@/modules/shared/ui/button";
import { Input } from "@/modules/shared/ui/input";
import { Label } from "@/modules/shared/ui/label";

export function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      navigate("/home", { replace: true });
      return;
    }

    document.body.style.backgroundImage = "url('/bg_signin.jpg')";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";

    return () => {
      document.body.style.backgroundImage = "";
      document.body.style.backgroundSize = "";
      document.body.style.backgroundPosition = "";
      document.body.style.backgroundRepeat = "";
    };
  }, [navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const setUser = useUserStore((state) => state.setUser);

  async function onSubmit(data: SignInFormData) {
    setIsSubmitting(true);
    try {
      const { accessToken, refreshToken, user } = await signIn(
        data.email,
        data.password,
      );
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      const profile = await getProfile();
      setUser({ ...user, fullName: profile.fullName });
      queryClient.setQueryData(["profile"], profile);

      navigate(user.hasAnamnesis ? "/home" : "/onboarding");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-svh flex-col justify-center">
      <div className="mx-auto w-full max-w-md rounded-2xl bg-background/80 p-8 backdrop-blur-md">
        <h1 className="mb-8 text-2xl font-bold">Sign in</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@email.com"
              {...register("email")}
            />
            {errors.email && (
              <span className="text-sm text-red-400">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Your password"
                className="pr-11"
                {...register("password")}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <span className="text-sm text-red-400">
                {errors.password.message}
              </span>
            )}
          </div>

          <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
