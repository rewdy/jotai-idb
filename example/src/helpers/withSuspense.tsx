import React from "react";

/**
 * Higher-order component that wraps a component in React.Suspense.
 */
export const withSuspense = <T extends object>(
  Component: React.ComponentType<T>,
  fallback?: React.ReactNode,
) => {
  const WrappedComponent: React.FC<T> = (props) => {
    return (
      <React.Suspense
        fallback={fallback ?? <span aria-busy="true">Loading...</span>}
      >
        <Component {...props} />
      </React.Suspense>
    );
  };

  WrappedComponent.displayName = `withSuspense(${
    Component.displayName || Component.name || "Component"
  })`;

  return WrappedComponent;
};
