import { ReactNode } from "react";

interface ContainerProps {
  className?: string;
  children: ReactNode;
}

export const Container = ({ className, children }: ContainerProps) => {
  return (
    <div className={`border border-input rounded-lg bg-card p-8 ${className || ""}`}>
      {children}
    </div>
  );
};
