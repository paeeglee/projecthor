import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { getProfile } from "@/modules/auth/services/profile";
import { useUserStore } from "@/modules/auth/stores/user-store";

export function useProfile() {
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);
  const user = useUserStore((state) => state.user);

  const hasToken = !!localStorage.getItem("accessToken");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    enabled: hasToken && !user,
  });

  useEffect(() => {
    if (data) {
      setUser({
        id: data.userId,
        email: "",
        hasAnamnesis: true,
        fullName: data.fullName,
      });
    }
  }, [data, setUser]);

  useEffect(() => {
    if (isError) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/signin", { replace: true });
    }
  }, [isError, navigate]);

  return { isLoading: hasToken && !user && isLoading };
}
