import { ReactNode } from "react";

interface ErrorProps {
  children: ReactNode;
}

export default function ErrorMessage({ children }: ErrorProps) {
  return <p className="text-sm text-red-500">{children}</p>;
}
