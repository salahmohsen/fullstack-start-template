import type React from "react";
import type { PropsWithChildren } from "react";

import { getQueryClient, Provider } from "@/lib/trpc/root-provider";

export const TanstackQueryProveder: React.FC<PropsWithChildren> = ({ children }) => {
  const queryClient = getQueryClient();

  return <Provider queryClient={queryClient}>{children}</Provider>;
};
