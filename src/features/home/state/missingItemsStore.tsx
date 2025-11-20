import React, { createContext, useContext, useMemo, useState } from 'react';

export type MissingItemState = {
  ids: string[];
};

export type MissingItemsActions = {
  addMissingItem: (articleId: string) => void;
  removeMissingItem: (articleId: string) => void;
  clearMissingItems: () => void;
};

type MissingItemsContextValue = MissingItemState & MissingItemsActions;

const MissingItemsContext = createContext<MissingItemsContextValue | undefined>(undefined);

export function MissingItemsProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);

  const value = useMemo<MissingItemsContextValue>(
    () => ({
      ids,
      addMissingItem: (articleId) => {
        setIds((current) => (current.includes(articleId) ? current : [...current, articleId]));
      },
      removeMissingItem: (articleId) => {
        setIds((current) => current.filter((id) => id !== articleId));
      },
      clearMissingItems: () => {
        setIds([]);
      },
    }),
    [ids]
  );

  return <MissingItemsContext.Provider value={value}>{children}</MissingItemsContext.Provider>;
}

export function useMissingItems(): MissingItemsContextValue {
  const ctx = useContext(MissingItemsContext);
  if (!ctx) {
    throw new Error('useMissingItems must be used within a MissingItemsProvider');
  }
  return ctx;
}
