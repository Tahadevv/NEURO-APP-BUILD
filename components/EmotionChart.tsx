import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

interface DataPoint {
  day: string;
  score: number;
}

interface EmotionChartProps {
  data: DataPoint[];
}

const EmotionChart: React.FC<EmotionChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.day),
    datasets: [
      {
        data: data.map(item => item.score),
      },
    ],
  };

  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={styles.container}>
      <BarChart
        data={chartData}
        width={screenWidth - 32} // Full width minus padding
        height={200}
        yAxisSuffix="%"
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`, // #4f46e5 with opacity
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          barPercentage: 0.7,
          propsForBackgroundLines: {
            strokeDasharray: '', // Solid grid lines
            stroke: '#E5E7EB',
            strokeWidth: 1,
          },
          propsForLabels: {
            fontSize: 12,
          },
        }}
        style={styles.chart}
        showValuesOnTopOfBars={true}
        fromZero={true}
        withInnerLines={true}
        segments={5}
        flatColor={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default EmotionChart; 