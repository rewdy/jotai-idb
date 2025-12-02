import type React from "react";
import { Suspense } from "react";
import { ErrorBoundary } from "./ErrorBoundary";

export type WrapperProps = {
  children: React.ReactNode;
};

const TopLevelLoader = () => (
  <div
    aria-busy="true"
    style={{
      padding: "4rem",
      textAlign: "center",
      border: "3px solid #c44c4cff",
    }}
  >
    Loading...
  </div>
);

export const Wrapper: React.FC<WrapperProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<TopLevelLoader />}>{children}</Suspense>
    </ErrorBoundary>
  );
};
