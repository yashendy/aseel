
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SugarReading } from '../types';
import { MG_DL_PER_MMOL_L } from '../constants';

interface SugarChartProps {
  data: SugarReading[];
  glucoseUnit: 'mg/dL' | 'mmol/L';
  timeWindowHours?: number;
  predictedData?: { time: string, value: number }[];
}

export const SugarChart: React.FC<SugarChartProps> = ({ data, glucoseUnit, timeWindowHours, predictedData }) => {
  const toUserUnit = (valueInMgDl: number) => {
      if (glucoseUnit === 'mmol/L') {
          return valueInMgDl / MG_DL_PER_MMOL_L;
      }
      return valueInMgDl;
  };
  
  const windowMillis = timeWindowHours ? timeWindowHours * 60 * 60 * 1000 : Infinity;
  const now = new Date().getTime();

  const filteredData = timeWindowHours 
    ? data.filter(reading => now - new Date(reading.date).getTime() < windowMillis)
    : data;


  const formattedData = useMemo(() => {
    const historicalData = filteredData
      .map(reading => ({
        date: new Date(reading.date).getTime(),
        name: new Date(reading.date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        value: toUserUnit(reading.value),
        predictedValue: null as number | null,
      }))
      .sort((a, b) => a.date - b.date);

    if (predictedData && historicalData.length > 0) {
      const lastHistoricalPoint = historicalData[historicalData.length - 1];
      
      const predictionPoints = predictedData.map(p => ({
        date: new Date(p.time).getTime(),
        name: new Date(p.time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        value: null,
        predictedValue: toUserUnit(p.value),
      }));

      // Connect the prediction to the last known point
      if (lastHistoricalPoint) {
        lastHistoricalPoint.predictedValue = lastHistoricalPoint.value;
      }
      
      return [...historicalData, ...predictionPoints];
    }

    return historicalData;
  }, [filteredData, predictedData, glucoseUnit]);

  const yDomain = glucoseUnit === 'mmol/L' ? [2, 22] : [40, 400];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={formattedData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis domain={yDomain} tickFormatter={(tick) => tick.toFixed(glucoseUnit === 'mmol/L' ? 1 : 0)}/>
        <Tooltip
          formatter={(value: number, name: string) => [`${value.toFixed(1)} ${glucoseUnit}`, name === 'value' ? 'سكر الدم' : 'التوقع']}
          labelFormatter={(label) => `الوقت: ${label}`}
        />
        <Legend />
        <Line type="monotone" dataKey="value" name="مستوى السكر" stroke="#10b981" dot={false} activeDot={{ r: 8 }} connectNulls={false} />
        <Line type="monotone" dataKey="predictedValue" name="التوقع" stroke="#3b82f6" strokeDasharray="5 5" dot={false} activeDot={{ r: 8 }} connectNulls={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};
