import * as Long from "long";

export class Transaction {
  public readonly id: number | Long;
  private _isRolledBack: boolean;
  private _isCommitted: boolean;

  constructor(id: number | Long, committed: boolean = false, rolledBack: boolean = false) {
    this.id = id;
    this._isCommitted = committed;
    this._isRolledBack = rolledBack;
  }

  public commit() {
    if (this._isRolledBack) throw new Error("Transaction has been rolled back and cannot be comitted");
    this._isCommitted = true;
    return true;
  }

  public rollback() {
    if (this._isCommitted) throw new Error("Transaction has been comitted and cannot be rolled back");
    this._isRolledBack = true;
    return true;
  }

  public canCommit() {
    return this._isRolledBack === false;
  }

  public canRollback() {
    return this._isCommitted === false;
  }

  public canWrite() {
    return this._isCommitted === false && this._isRolledBack === false;
  }
}

export class Manager {

  private _transactions: { [ key: string ]: Transaction };

  constructor(transactions: Manager[ "_transactions" ] = {}) {
    this._transactions = transactions || {};
  }

  public addTransaction(transaction: Transaction) {
    this._transactions[ transaction.id.toString() ] = transaction;
  }

  public canCommitTransaction(transaction?: number | Long | Transaction) {
    transaction = this.getTransaction(transaction);
    return transaction && transaction.canCommit();
  }

  public commitTransaction(transaction?: number | Long | Transaction) {
    transaction = this.getTransaction(transaction);
    if (transaction && transaction.canCommit()) return transaction.commit();
    return false;
  }

  public rollbackTransaction(transaction?: number | Long | Transaction) {
    transaction = this.getTransaction(transaction);
    if (transaction && transaction.canRollback()) return transaction.rollback();
    return false;
  }

  public transactionIsWritable(transaction?: number | Long | Transaction) {
    transaction = this.getTransaction(transaction);
    return transaction && transaction.canWrite();
  }

  public getTransaction(transaction?: number | Long | Transaction) {
    if (!transaction) return;
    let result: Transaction | undefined;
    if (typeof transaction === "number" || Long.isLong(transaction)) result = this._transactions[ transaction.toString() ];
    else if (transaction instanceof Transaction) result = this._transactions[ transaction.id.toString() ];
    return result;
  }
}
