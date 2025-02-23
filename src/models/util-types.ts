export type AllFieldsUnknown<T> = {
  [K in keyof T]: T[K] extends (infer U)[] ? AllFieldsUnknown<U>[] : T[K] extends object ? AllFieldsUnknown<T[K]> : unknown;
};
