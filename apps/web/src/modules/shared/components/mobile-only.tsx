import { type ReactNode, useEffect, useState } from "react";

const MOBILE_UA_REGEX =
  /Android|iPhone|iPad|iPod|webOS|BlackBerry|Opera Mini|IEMobile/i;
const MAX_MOBILE_WIDTH = 768;

function isMobileDevice(): boolean {
  return MOBILE_UA_REGEX.test(navigator.userAgent);
}

function isMobileViewport(): boolean {
  return window.innerWidth < MAX_MOBILE_WIDTH;
}

export function MobileOnly({ children }: { children: ReactNode }) {
  const [isMobile, setIsMobile] = useState(
    () => isMobileDevice() && isMobileViewport(),
  );

  useEffect(() => {
    function handleResize() {
      setIsMobile(isMobileDevice() && isMobileViewport());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isMobile) {
    return (
      <div className="flex h-screen items-center justify-center p-8 text-center">
        <div className="flex flex-col items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-4 text-gray-400"
            role="img"
            aria-label="Mobile only"
          >
            <title>Mobile phone icon</title>
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
          <h1 className="text-2xl font-bold">Dispositivo não suportado</h1>
          <p className="mt-2 text-gray-500">
            Este app está disponível apenas em dispositivos móveis.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
