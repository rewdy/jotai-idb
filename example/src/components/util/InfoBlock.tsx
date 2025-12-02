import type React from "react";

export type InfoBlockProps = {
  children?: React.ReactNode;
};

/**
 * Component to render styled informational blocks in the UI.
 */
export const InfoBlock: React.FC<InfoBlockProps> = ({ children }) => {
  return children && <div className="info-block">{children}</div>;
};
