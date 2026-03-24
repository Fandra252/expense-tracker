import Header from "@/components/Header";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { scale, verticalScale } from "@/utils/styling";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

const Statistics = () => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [chartData, setChartData] = useState([
    {
      value: 40,
      label: "Mon",
      spacing: scale(5),
      labelWidth: scale(30),
      frontColor: colors.primary,
      topLabelComponent: () => (
        <Typo size={10} style={{ marginBottom: 2 }} fontWeight="bold">
          40
        </Typo>
      ),
    },
    {
      value: 20,
      frontColor: colors.rose,
      topLabelComponent: () => (
        <Typo size={10} style={{ marginBottom: 2 }} fontWeight="bold">
          40
        </Typo>
      ),
    },
    {
      value: 50,
      label: "Tue",
      spacing: scale(4),
      labelWidth: scale(30),
      frontColor: colors.primary,
    },
    { value: 40, frontColor: colors.rose },
    {
      value: 75,
      label: "Wed",
      spacing: scale(4),
      labelWidth: scale(30),
      frontColor: colors.primary,
    },
    { value: 25, frontColor: colors.rose },
    {
      value: 30,
      label: "Thu",
      spacing: scale(4),
      labelWidth: scale(30),
      frontColor: colors.primary,
    },
    { value: 60, frontColor: colors.rose },
    {
      value: 60,
      label: "Fri",
      spacing: scale(4),
      labelWidth: scale(30),
      frontColor: colors.primary,
    },
    { value: 40, frontColor: colors.rose },
    {
      value: 65,
      label: "Sta",
      spacing: scale(4),
      labelWidth: scale(30),
      frontColor: colors.primary,
    },
    { value: 30, frontColor: colors.rose },
    {
      value: 65,
      label: "Sun",
      spacing: scale(4),
      labelWidth: scale(30),
      frontColor: colors.primary,
    },
    { value: 30, frontColor: colors.rose },
  ]);

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Header title="Statistics" />
        </View>
        <ScrollView
          contentContainerStyle={{
            gap: spacingY._20,
            paddingTop: spacingY._5,
            paddingBottom: verticalScale(10),
          }}
        >
          <SegmentedControl
            values={["Weekly", "Monthly", "Yearly"]}
            selectedIndex={activeIndex}
            onChange={(event) => {
              setActiveIndex(event.nativeEvent.selectedSegmentIndex);
            }}
            tintColor={colors.neutral200}
            backgroundColor={colors.neutral800}
            appearance="dark"
            activeFontStyle={styles.segmentFontStyle}
            style={styles.segmentStyle}
            fontStyle={{ ...styles.segmentFontStyle, color: colors.white }}
          />
        </ScrollView>
        <View style={styles.chartContainer}>
          {chartData.length > 0 ? (
            <BarChart
              data={chartData}
              barWidth={scale(13)}
              spacing={scale(25)}
              roundedTop
              roundedBottom
              hideRules
              yAxisLabelPrefix="₹"
              yAxisThickness={0}
              xAxisThickness={0}
              yAxisLabelWidth={scale(27)}
              yAxisTextStyle={{
                color: colors.neutral350,
              }}
              xAxisLabelTextStyle={{
                color: colors.neutral350,
                fontSize: verticalScale(12),
              }}
              noOfSections={3}
              minHeight={5}
            />
          ) : (
            <View style={styles.noChart} />
          )}
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Statistics;

const styles = StyleSheet.create({
  chartContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  chartLoadingContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: radius._12,
    backgroundColor: "rgba(0,0,0, 0.06)",
  },
  header: {},
  noChart: {
    height: verticalScale(210),
    backgroundColor: "rgba(0,0,0, 0.06)",
  },
  searchIcon: {
    backgroundColor: colors.neutral700,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
    height: verticalScale(35),
    width: verticalScale(35),
    borderCurve: "continuous",
  },
  segmentStyle: {
    height: scale(37),
  },
  segmentFontStyle: {
    fontSize: verticalScale(14),
    fontWeight: "bold",
    color: colors.black,
  },
  container: {
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._5,
    gap: spacingY._10,
  },
});
