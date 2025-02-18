export type DatabaseResult<T> = {
  success: true;
  data: T;
};

export type DatabaseError = {
  success: false;
  message: string;
};

export type DatabaseResponse<T> = DatabaseResult<T> | DatabaseError;

export type DatabaseChanges<T> = {
  add: T[];
  update: {
    id: string;
    data: T;
  }[];
  delete: string[];
};
