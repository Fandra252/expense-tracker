import Button from "@/components/Button";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { auth } from "@/config/firebase";
import { colors } from "@/constants/theme";
import { useAuth } from "@/contexts/authContext";
import { signOut } from "firebase/auth";
import React from "react";
import { StyleSheet } from "react-native";

const Home = () => {
  const { user } = useAuth();
  // console.log("user: ", user);
  // const handleLogout = async () => {
  //   try {
  //     await signOut(auth);
  //   } catch (error: any) {
  //     console.log("error: ", error);
  //   }
  // };
  return (
    <ScreenWrapper>
      <Typo>{user?.name}</Typo>
      {/* <Button onPress={handleLogout}>
        <Typo color={colors.black}>Logout</Typo>
      </Button> */}
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({});
