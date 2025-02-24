export type DataActionResponse = {
  processed: boolean;
  success: boolean;
  message: string;
};

export type DataAction = { key: string; oldValue: unknown; newValue: unknown };

export type OrderingAction = {
  oldOrdering: string[];
  newOrdering: string[];
};
