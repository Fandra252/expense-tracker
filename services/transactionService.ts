import { firestore } from "@/config/firebase";
import { TransactionType, WalletType } from "@/types";
import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { uploadFileToCloudinary } from "./ImageService";

export const createOrUpdateTransaction = async (
  transactionData: Partial<TransactionType>,
) => {
  try {
    const { id, type, walletId, amount, image } = transactionData;
    if (!walletId || !amount || amount <= 0 || !type) {
      return {
        success: false,
        msg: "Invalid transaction data!",
      };
    }
    if (id) {
    } else {
      const res = await updateWalletForNewTransaction(
        walletId,
        Number(amount!),
        type,
      );
      if (!res.success) {
        return res;
      }
    }

    if (image) {
      const imageUploadRes = await uploadFileToCloudinary(
        image,
        "transactions",
      );
      if (!imageUploadRes.success) {
        return {
          success: false,
          msg: imageUploadRes.msg || "Failed to upload receipt",
        };
      }
      transactionData.image = imageUploadRes.data;
    }

    const transactionRef = id
      ? doc(firestore, "transactions", id)
      : doc(collection(firestore, "transactions"));

    await setDoc(transactionRef, transactionData, { merge: true });

    return {
      success: true,
      data: { ...transactionData, id: transactionRef.id },
    };
  } catch (error: any) {
    console.log("error creating or updating transaction: ", error);
    return {
      success: false,
      msg: error.message,
    };
  }
};

const updateWalletForNewTransaction = async (
  walletId: string,
  amount: number,
  type: string,
) => {
  try {
    const walletRef = doc(firestore, "wallets", walletId);
    const walletSnapshot = await getDoc(walletRef);

    if (!walletSnapshot.exists()) {
      console.log("Error updating wallet for new transaction");
      return {
        success: false,
        msg: "Wallet not found!",
      };
    }

    const walletData = walletSnapshot.data() as WalletType;

    if (type === "expense" && walletData.amount! - amount < 0) {
      return {
        success: false,
        msg: "Not enough balance!",
      };
    }

    const updateType = type === "income" ? "totalIncome" : "totalExpenses";
    const updatedWalletAmount =
      type === "income"
        ? Number(walletData.amount) + amount
        : Number(walletData.amount) - amount;
    const updatedTotalAmount =
      type === "income"
        ? Number(walletData.totalIncome) + amount
        : Number(walletData.totalExpenses) + amount;

    await updateDoc(walletRef, {
      amount: updatedWalletAmount,
      [updateType]: updatedTotalAmount,
    });

    return {
      success: true,
      msg: "Wallet updated successfully",
    };
  } catch (error: any) {
    console.log("error updating wallet: ", error);
    return {
      success: false,
      msg: error.message,
    };
  }
};
