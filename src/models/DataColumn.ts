export enum ChangeVerdict {
  ACCEPT,
  REJECT,
  NOP, // no operation
}

/**
 * Configuration object for a data column.
 *
 * @typeParam DatabaseMode - The type representing the database model.
 * @typeParam EditModel - The type representing the edit model.
 *
 * @property defaultValue - The default value for the data column.
 * @property getDbModelValue - Function to get the value from the database model.
 * @property setEditModelValue - Function to set the value in the edit model.
 * @property equals - Optional function to compare two values for equality.
 * @interface
 */
export type DataColumnConfig<DatabaseMode, EditModel> = {
  defaultValue: unknown;
  getDbModelValue: (data: DatabaseMode) => unknown;
  setEditModelValue: (data: EditModel, sanitizedValue: unknown) => void;
  equals?: (a: unknown, b: unknown) => boolean;
};

export function isEmptyValue(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

export class DataColumn<DatabaseModel, EditModel> {
  public constructor(private readonly config: DataColumnConfig<DatabaseModel, EditModel>) {}

  private isEmptyValue(value: unknown): boolean {
    return isEmptyValue(value);
  }

  private equals(a: unknown, b: unknown): boolean {
    if (this.config.equals) {
      return this.config.equals(a, b);
    }
    return a === b;
  }

  private sanitizeValue(value: unknown): unknown {
    if (this.isEmptyValue(value)) {
      return this.config.defaultValue;
    }
    return value;
  }

  private threeWayCheck(sanitizedOldValue: unknown, sanitizedNewValue: unknown, databaseRecord: DatabaseModel | null): ChangeVerdict {
    if (this.equals(sanitizedOldValue, sanitizedNewValue)) {
      return ChangeVerdict.NOP;
    }
    if (!databaseRecord) {
      return ChangeVerdict.REJECT;
    }
    const dbValue = this.config.getDbModelValue(databaseRecord);
    const sanitizedDbValue = this.sanitizeValue(dbValue);
    if (this.equals(sanitizedNewValue, sanitizedDbValue)) {
      return ChangeVerdict.NOP;
    }
    if (!this.equals(sanitizedOldValue, sanitizedDbValue)) {
      return ChangeVerdict.REJECT;
    }
    return ChangeVerdict.ACCEPT;
  }

  private twoWayCheck(sanitizedOldValue: unknown, sanitizedNewValue: unknown): ChangeVerdict {
    if (this.equals(sanitizedOldValue, sanitizedNewValue)) {
      return ChangeVerdict.NOP;
    }
    return ChangeVerdict.ACCEPT;
  }

  /**
   * Applies a change to the edit model on update, based on the given parameters. Default value will be applied to empty values. \
   * Modifies: `editData` \
   * Effects: Modifies `editData` if the change is accepted.
   *
   * @param params - The parameters for applying the change.
   * @param params.oldValue - The old value of the data column.
   * @param params.newValue - The new value to apply to the data column.
   * @param params.databaseRecord - The current state of the database model.
   * @param params.editData - The edit model to update with the new value.
   * @returns The verdict of the change operation:
   * - `ChangeVerdict.ACCEPT` if the change is accepted
   * - `ChangeVerdict.REJECT` if the old value does not match the database value, meaning the data has been changed by another client
   * - `ChangeVerdict.NOP` if the old value and new value are the same, or the new value and database value are the same
   * @throws ZodError
   */
  public applyOnUpdate({
    oldValue,
    newValue,
    databaseRecord,
    editData,
  }: {
    oldValue: unknown;
    newValue: unknown;
    databaseRecord: DatabaseModel | null;
    editData: EditModel;
  }): ChangeVerdict {
    const sanitizedOldValue = this.sanitizeValue(oldValue);
    const sanitizedNewValue = this.sanitizeValue(newValue);
    const changeVerdict = this.threeWayCheck(sanitizedOldValue, sanitizedNewValue, databaseRecord);
    if (changeVerdict === ChangeVerdict.ACCEPT) {
      this.config.setEditModelValue(editData, sanitizedNewValue);
    }
    return changeVerdict;
  }

  /**
   * Applies a change to the edit model on creation, based on the given parameters. Default value will be applied to empty values. \
   * Modifies: `editData` \
   * Effects: Modifies `editData` if the change is accepted.
   *
   * @param params - The parameters for applying the change.
   * @param params.oldValue - The old value of the data column.
   * @param params.newValue - The new value to apply to the data column.
   * @param params.editData - The edit model to update with the new value.
   * @returns The verdict of the change operation:
   * - `ChangeVerdict.ACCEPT` if the change is accepted
   * - `ChangeVerdict.NOP` if the old value and new value are the same, or the new value and database value are the same
   * @throws ZodError
   */
  public applyOnCreate({ oldValue, newValue, editData }: { oldValue: unknown; newValue: unknown; editData: EditModel }): ChangeVerdict {
    const sanitizedOldValue = this.sanitizeValue(oldValue);
    const sanitizedNewValue = this.sanitizeValue(newValue);
    const changeVerdict = this.twoWayCheck(sanitizedOldValue, sanitizedNewValue);
    if (changeVerdict === ChangeVerdict.ACCEPT) {
      this.config.setEditModelValue(editData, sanitizedNewValue);
    }
    return changeVerdict;
  }
}
