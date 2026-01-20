import Loading from "@/components/Loading";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, radius, spacingY } from "@/constants/theme";
import { useAuth } from "@/contexts/authContext";
import useFetchData from "@/hooks/useFetchData";
import { WalletType } from "@/types";
import { verticalScale } from "@/utils/styling";
import { useRouter } from "expo-router";
import { orderBy, where } from "firebase/firestore";
import * as Icons from "phosphor-react-native";
import React from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";

const Wallet = () => {
  const router = useRouter();
  const { user } = useAuth();

  const {
    data: wallets,
    error,
    loading,
  } = useFetchData<WalletType>("wallets", [
    where("uid", "==", user?.uid),
    orderBy("created", "desc"),
  ]);
  console.log("wallet: ", wallets.length);
  const getTotalBalance = () => {
    return 2344;
  };
  return (
    <ScreenWrapper style={{ backgroundColor: colors.black }}>
      <View style={styles.container}>
        <View style={styles.balanceView}>
          <View style={{ alignItems: "center" }}>
            <Typo size={45} fontWeight={"500"}>
              ${getTotalBalance()?.toFixed(2)}
            </Typo>
            <Typo size={16} color={colors.neutral300}>
              Total Balance
            </Typo>
          </View>
        </View>
        {/* wallets */}
        <View style={styles.wallets}>
          {/* header */}
          <View style={styles.flexRow}>
            <Typo size={20} fontWeight={"500"}>
              My Wallets
            </Typo>
            <TouchableOpacity
              onPress={() => router.push("/(modals)/walletModal")}
            >
              <Icons.PlusCircleIcon
                size={verticalScale(33)}
                color={colors.primary}
                weight="fill"
              />
            </TouchableOpacity>
          </View>

          {/* todo: wallets list */}
          {loading && <Loading />}
          <FlatList
            data={wallets}
            // keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View>
                <Typo>{item.name}</Typo>
              </View>
            )}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Wallet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: colors.black,
  },
  balanceView: {
    height: verticalScale(160),
    backgroundColor: colors.black,
    alignItems: "center",
    justifyContent: "center",
  },
  flexRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._10,
  },
  wallets: {
    flex: 1,
    backgroundColor: colors.neutral900,
    borderTopStartRadius: radius._30,
    borderTopEndRadius: radius._30,
    borderCurve: "continuous",
    // borderTopRightRadius: radius._30,
    // borderTopLeftRadius: radius._30,
    // borderTopStartRadius: radius._30,
    // borderTopEndRadius: radius._30,
    // marginBottom: spacingX._25,
    // borderRadius: radius._30,
    // borderCurve: "continuous",
    // overflow: "hidden",
    padding: spacingY._25,
    // paddingHorizontal: spacingX._25,
  },
  listStyles: {
    paddingVertical: spacingY._25,
    paddingTop: spacingY._15,
  },
});
