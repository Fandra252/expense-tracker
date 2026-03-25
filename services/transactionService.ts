import { firestore } from "@/config/firebase";
import { colors } from "@/constants/theme";
import { ResponseType, TransactionType, WalletType } from "@/types";
import { getLast7Days } from "@/utils/common";
import { scale } from "@/utils/styling";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { uploadFileToCloudinary } from "./ImageService";

/**
 * CREATE OR UPDATE TRANSACTION
 */
export const createOrUpdateTransaction = async (
  transactionData: Partial<TransactionType>,
): Promise<ResponseType> => {
  try {
    const { id, walletId, amount, type, image } = transactionData;

    if (!walletId || !amount || amount <= 0 || !type) {
      return {
        success: false,
        msg: "Invalid transaction data",
      };
    }

    /**
     * If updating transaction
     * revert old transaction first
     */
    if (id) {
      const oldSnap = await getDoc(doc(firestore, "transactions", id));

      if (!oldSnap.exists()) {
        return {
          success: false,
          msg: "Transaction not found",
        };
      }

      const oldTransaction = oldSnap.data() as TransactionType;

      const revertRes = await revertTransaction(oldTransaction);
      if (!revertRes.success) return revertRes;
    }

    /**
     * Apply new transaction effect
     */
    const applyRes = await applyTransaction(walletId, Number(amount), type);

    if (!applyRes.success) return applyRes;

    /**
     * Upload image only if it's a new file
     */
    if (image && typeof image !== "string") {
      const uploadRes = await uploadFileToCloudinary(image, "transactions");

      if (!uploadRes.success) {
        return {
          success: false,
          msg: uploadRes.msg || "Image upload failed",
        };
      }

      transactionData.image = uploadRes.data;
    }

    /**
     * Save transaction
     */
    const transactionRef = id
      ? doc(firestore, "transactions", id)
      : doc(collection(firestore, "transactions"));

    await setDoc(transactionRef, transactionData, { merge: true });

    return {
      success: true,
      data: { ...transactionData, id: transactionRef.id },
    };
  } catch (error: any) {
    console.log("createOrUpdateTransaction error:", error);

    return {
      success: false,
      msg: error.message,
    };
  }
};

/**
 * APPLY TRANSACTION TO WALLET
 */
const applyTransaction = async (
  walletId: string,
  amount: number,
  type: string,
): Promise<ResponseType> => {
  try {
    const walletRef = doc(firestore, "wallets", walletId);
    const walletSnap = await getDoc(walletRef);

    if (!walletSnap.exists()) {
      return {
        success: false,
        msg: "Wallet not found",
      };
    }

    const wallet = walletSnap.data() as WalletType;

    if (
      wallet.amount == null ||
      wallet.totalIncome == null ||
      wallet.totalExpenses == null
    ) {
      return {
        success: false,
        msg: "Invalid wallet data",
      };
    }

    /**
     * Check balance for expense
     */
    if (type === "expense" && wallet.amount < amount) {
      return {
        success: false,
        msg: "Not enough balance",
      };
    }

    const newWalletAmount =
      type === "income" ? wallet.amount + amount : wallet.amount - amount;

    await updateDoc(walletRef, {
      amount: newWalletAmount,
      totalIncome:
        type === "income" ? wallet.totalIncome + amount : wallet.totalIncome,
      totalExpenses:
        type === "expense"
          ? wallet.totalExpenses + amount
          : wallet.totalExpenses,
    });

    return {
      success: true,
    };
  } catch (error: any) {
    console.log("applyTransaction error:", error);

    return {
      success: false,
      msg: error.message,
    };
  }
};

/**
 * REVERT TRANSACTION FROM WALLET
 */
const revertTransaction = async (
  transaction: TransactionType,
): Promise<ResponseType> => {
  try {
    const walletRef = doc(firestore, "wallets", transaction.walletId);
    const walletSnap = await getDoc(walletRef);

    if (!walletSnap.exists()) {
      return {
        success: false,
        msg: "Wallet not found",
      };
    }

    const wallet = walletSnap.data() as WalletType;

    if (
      wallet.amount == null ||
      wallet.totalIncome == null ||
      wallet.totalExpenses == null
    ) {
      return {
        success: false,
        msg: "Invalid wallet data",
      };
    }

    const revertedAmount =
      transaction.type === "income"
        ? wallet.amount - transaction.amount
        : wallet.amount + transaction.amount;

    await updateDoc(walletRef, {
      amount: revertedAmount,
      totalIncome:
        transaction.type === "income"
          ? wallet.totalIncome - transaction.amount
          : wallet.totalIncome,
      totalExpenses:
        transaction.type === "expense"
          ? wallet.totalExpenses - transaction.amount
          : wallet.totalExpenses,
    });

    return {
      success: true,
    };
  } catch (error: any) {
    console.log("revertTransaction error:", error);

    return {
      success: false,
      msg: error.message,
    };
  }
};

/**
 * DELETE TRANSACTION
 */
export const deleteTransaction = async (
  transactionId: string,
): Promise<ResponseType> => {
  try {
    const transactionRef = doc(firestore, "transactions", transactionId);

    const snap = await getDoc(transactionRef);

    if (!snap.exists()) {
      return {
        success: false,
        msg: "Transaction not found",
      };
    }

    const transaction = snap.data() as TransactionType;

    /**
     * revert wallet changes
     */
    const revertRes = await revertTransaction(transaction);

    if (!revertRes.success) return revertRes;

    /**
     * delete transaction
     */
    await deleteDoc(transactionRef);

    return {
      success: true,
    };
  } catch (error: any) {
    console.log("deleteTransaction error:", error);

    return {
      success: false,
      msg: error.message,
    };
  }
};

export const fetchWeeklyStats = async (uid: string): Promise<ResponseType> => {
  try {
    const db = firestore;
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const transactionQuery = query(
      collection(db, "transactions"),
      where("date", ">=", Timestamp.fromDate(sevenDaysAgo)),
      where("date", "<=", Timestamp.fromDate(today)),
      orderBy("date", "desc"),
      where("uid", "==", uid),
    );

    const querySnapshot = await getDocs(transactionQuery);
    const weeklyData = getLast7Days();
    const transactions: TransactionType[] = [];

    querySnapshot.forEach((doc) => {
      const transaction = doc.data() as TransactionType;
      transaction.id = doc.id;
      transactions.push(transaction);

      const transactionDate = (transaction.date as Timestamp)
        ?.toDate()
        .toISOString()
        .split("T")[0];

      const dayData = weeklyData.find((day) => day.date === transactionDate);

      if (dayData) {
        if (transaction.type === "income") {
          dayData.income += transaction.amount;
        } else if (transaction.type === "expense") {
          dayData.expense += transaction.amount;
        }
      }
    });

    const stats = weeklyData.flatMap((day) => [
      {
        value: day.income,
        label: day.day,
        spacing: scale(4),
        labelWidth: scale(30),
        frontColor: colors.primary,
      },
      { value: day.expense, frontColor: colors.rose },
    ]);

    return {
      success: true,
      data: { stats, transactions },
    };
  } catch (error: any) {
    console.log("error fetching weekly stats:", error);
    return {
      success: false,
      msg: error.message,
    };
  }
};
