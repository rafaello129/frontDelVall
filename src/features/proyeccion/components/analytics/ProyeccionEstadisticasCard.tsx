import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  LinearProgress,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TableChart,
  ShowChart
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import type { EstadisticaAgrupada } from '../../types';

interface ProyeccionEstadisticasCardProps {
  data: EstadisticaAgrupada[];
  loading?: boolean;
  title?: string;
  groupByField?: string;
  chartType?: 'bar' | 'pie' | 'line';
}

export const ProyeccionEstadisticasCard: React.FC<ProyeccionEstadisticasCardProps> = ({
  data,
  loading = false,
  title = 'Estadísticas',
  groupByField = 'categoria',
  chartType: initialChartType = 'bar'
}) => {
  const theme = useTheme();
  const [viewType, setViewType] = useState<'chart' | 'table'>('chart');
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>(initialChartType);

  // Colors for charts
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.primary.light,
    theme.palette.secondary.light,
    theme.palette.success.light,
    theme.palette.error.light
  ];

  const handleViewChange = (
    event: React.MouseEvent<HTMLElement>,
    newView: 'chart' | 'table' | null,
  ) => {
    if (newView !== null) {
      setViewType(newView);
    }
  };

  const handleChartTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newType: 'bar' | 'pie' | 'line' | null,
  ) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };

  // Sort data by total
  const sortedData = [...data].sort((a, b) => b.total - a.total);

  // Format money amounts
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Calculate totals
  const totalAmount = data.reduce((sum, item) => sum + item.total, 0);
  const totalCount = data.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">{title}</Typography>
        <Box>
          <ToggleButtonGroup
            size="small"
            value={viewType}
            exclusive
            onChange={handleViewChange}
            aria-label="view type"
          >
            <ToggleButton value="chart" aria-label="chart view">
              {chartType === 'bar' && <BarChartIcon />}
              {chartType === 'pie' && <PieChartIcon />}
              {chartType === 'line' && <ShowChart />}
            </ToggleButton>
            <ToggleButton value="table" aria-label="table view">
              <TableChart />
            </ToggleButton>
          </ToggleButtonGroup>

          {viewType === 'chart' && (
            <ToggleButtonGroup
              size="small"
              value={chartType}
              exclusive
              onChange={handleChartTypeChange}
              aria-label="chart type"
              sx={{ ml: 1 }}
            >
              <ToggleButton value="bar" aria-label="bar chart">
                <BarChartIcon />
              </ToggleButton>
              <ToggleButton value="pie" aria-label="pie chart">
                <PieChartIcon />
              </ToggleButton>
              <ToggleButton value="line" aria-label="line chart">
                <ShowChart />
              </ToggleButton>
            </ToggleButtonGroup>
          )}
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Loading indicator */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Summary chips */}
      <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
        <Chip 
          label={`Total: ${formatMoney(totalAmount)}`} 
          color="primary" 
          variant="outlined" 
        />
        <Chip 
          label={`Cantidad: ${totalCount} proyecciones`} 
          color="secondary" 
          variant="outlined" 
        />
        <Chip 
          label={`Promedio: ${formatMoney(totalAmount / (totalCount || 1))}`} 
          color="default" 
          variant="outlined" 
        />
      </Box>

      {viewType === 'chart' ? (
        <Box sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart
                data={sortedData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoria" />
                <YAxis />
                <Tooltip formatter={(value) => formatMoney(value as number)} />
                <Legend />
                <Bar dataKey="total" fill={theme.palette.primary.main} name="Monto Total" />
                <Bar dataKey="cantidad" fill={theme.palette.secondary.main} name="Cantidad" />
              </BarChart>
            ) : chartType === 'pie' ? (
              <PieChart>
                <Pie
                  data={sortedData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill={theme.palette.primary.main}
                  dataKey="total"
                  nameKey="categoria"
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    percent,
                    index,
                  }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = 25 + innerRadius + (outerRadius - innerRadius);
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                    return (
                      <text
                        x={x}
                        y={y}
                        fill={COLORS[index % COLORS.length]}
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                      >
                        {sortedData[index].categoria} ({(percent * 100).toFixed(0)}%)
                      </text>
                    );
                  }}
                >
                  {sortedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatMoney(value as number)} />
                <Legend />
              </PieChart>
            ) : (
              <LineChart
                data={sortedData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoria" />
                <YAxis />
                <Tooltip formatter={(value) => formatMoney(value as number)} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke={theme.palette.primary.main} 
                  activeDot={{ r: 8 }}
                  name="Monto Total"
                />
                <Line 
                  type="monotone" 
                  dataKey="cantidad" 
                  stroke={theme.palette.secondary.main}
                  name="Cantidad"
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </Box>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>{groupByField.charAt(0).toUpperCase() + groupByField.slice(1)}</strong></TableCell>
                <TableCell align="right"><strong>Total</strong></TableCell>
                <TableCell align="right"><strong>Cantidad</strong></TableCell>
                <TableCell align="right"><strong>Promedio</strong></TableCell>
                {data[0]?.tasaExito !== undefined && (
                  <TableCell align="right"><strong>Tasa Éxito</strong></TableCell>
                )}
                {data[0]?.porcentaje !== undefined && (
                  <TableCell align="right"><strong>% del Total</strong></TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((item, index) => (
                <TableRow 
                  key={index}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {item.categoria}
                  </TableCell>
                  <TableCell align="right">{formatMoney(item.total)}</TableCell>
                  <TableCell align="right">{item.cantidad}</TableCell>
                  <TableCell align="right">{formatMoney(item.promedio)}</TableCell>
                  {item.tasaExito !== undefined && (
                    <TableCell align="right">
                      <Box display="flex" alignItems="center" justifyContent="flex-end">
                        {item.tasaExito.toFixed(1)}%
                        <Box 
                          sx={{ 
                            width: 40, 
                            ml: 1, 
                            height: 6, 
                            borderRadius: 3,
                            bgcolor: 
                              item.tasaExito > 75 ? theme.palette.success.main :
                              item.tasaExito > 50 ? theme.palette.warning.main :
                              theme.palette.error.main
                          }} 
                        />
                      </Box>
                    </TableCell>
                  )}
                  {item.porcentaje !== undefined && (
                    <TableCell align="right">{item.porcentaje.toFixed(1)}%</TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};