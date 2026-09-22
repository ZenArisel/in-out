import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Transaction, MonthlyBudget } from '../types';

export function subscribeToTransactions(
  userId: string,
  onUpdate: (transactions: Transaction[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = `users/${userId}/transactions`;
  const q = query(collection(db, 'users', userId, 'transactions'), orderBy('date', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Transaction[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          userId: data.userId || userId,
          type: data.type,
          amount: Number(data.amount) || 0,
          category: data.category || 'อื่นๆ',
          date: data.date,
          note: data.note || '',
          paymentMethod: data.paymentMethod || 'cash',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      });
      onUpdate(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function createTransaction(
  data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const transactionId = 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const path = `users/${data.userId}/transactions/${transactionId}`;
  const now = new Date().toISOString();

  const payload: Transaction = {
    id: transactionId,
    userId: data.userId,
    type: data.type,
    amount: Number(data.amount) || 0,
    category: data.category,
    date: data.date,
    note: data.note || '',
    paymentMethod: data.paymentMethod,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const docRef = doc(db, 'users', data.userId, 'transactions', transactionId);
    await setDoc(docRef, payload);
    return transactionId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function editTransaction(
  transactionId: string,
  userId: string,
  data: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const path = `users/${userId}/transactions/${transactionId}`;
  try {
    const docRef = doc(db, 'users', userId, 'transactions', transactionId);
    const updatePayload: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (data.type !== undefined) updatePayload.type = data.type;
    if (data.amount !== undefined) updatePayload.amount = Number(data.amount);
    if (data.category !== undefined) updatePayload.category = data.category;
    if (data.date !== undefined) updatePayload.date = data.date;
    if (data.note !== undefined) updatePayload.note = data.note || '';
    if (data.paymentMethod !== undefined) updatePayload.paymentMethod = data.paymentMethod;

    await updateDoc(docRef, updatePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function removeTransaction(transactionId: string, userId: string): Promise<void> {
  const path = `users/${userId}/transactions/${transactionId}`;
  try {
    const docRef = doc(db, 'users', userId, 'transactions', transactionId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToMonthlyBudget(
  userId: string,
  month: string,
  onUpdate: (budget: MonthlyBudget | null) => void
): () => void {
  const path = `users/${userId}/budgets/${month}`;
  const docRef = doc(db, 'users', userId, 'budgets', month);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        onUpdate({
          id: snapshot.id,
          userId: data.userId || userId,
          month: data.month || month,
          monthlyLimit: Number(data.monthlyLimit) || 0,
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function saveMonthlyBudget(
  userId: string,
  month: string,
  monthlyLimit: number
): Promise<void> {
  const path = `users/${userId}/budgets/${month}`;
  try {
    const docRef = doc(db, 'users', userId, 'budgets', month);
    const payload: MonthlyBudget = {
      id: month,
      userId,
      month,
      monthlyLimit,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
