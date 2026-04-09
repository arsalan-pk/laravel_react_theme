import * as React from "react";
import { useState, useEffect } from "react";
import {
    Card,
     Grid,
    TextField,
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    LinearProgress,
} from "@mui/material";

export default function Summaries() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    return (
        <Grid size={{ xs: 12, sm: 12, md: 12 }}>
            <Card sx={{ height: "100%", padding: 2, display: 'flex', flexDirection: "column" }}>
                <Grid container spacing={2} size={12}>
                    <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                        <TextField
                            label="Start Date"
                            name="start_date"
                            placeholder="Start Date"
                            type="date"
                            fullWidth
                            slotProps={{
                                inputLabel: {
                                    shrink: true,
                                },
                            }}
                            value={startDate}
                            onChange={(e) =>
                                setStartDate(e.target.value)
                            }
                        />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                        <TextField
                            label="End Date"
                            name="end_date"
                            placeholder="End Date"
                            type="date"
                            fullWidth
                            slotProps={{
                                inputLabel: {
                                    shrink: true,
                                },
                            }}
                            value={endDate}
                            onChange={(e) =>
                                setEndDate(e.target.value)
                            }

                        />
                    </Grid>
                </Grid>

                <Box sx={{ mt: 3, p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Summary Report (Static Demo Data)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        This section shows static demonstration data. In a production environment, this would display
                        dynamic summary reports based on the selected date range.
                    </Typography>
                    
                    {/* Static Performance Metrics */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 2, textAlign: 'center' }}>
                                <Typography variant="h6" color="primary.main">85%</Typography>
                                <Typography variant="caption">Sales Growth</Typography>
                                <LinearProgress variant="determinate" value={85} sx={{ mt: 1 }} />
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 2, textAlign: 'center' }}>
                                <Typography variant="h6" color="success.main">92%</Typography>
                                <Typography variant="caption">Target Achievement</Typography>
                                <LinearProgress variant="determinate" value={92} color="success" sx={{ mt: 1 }} />
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 2, textAlign: 'center' }}>
                                <Typography variant="h6" color="warning.main">78%</Typography>
                                <Typography variant="caption">Inventory Turnover</Typography>
                                <LinearProgress variant="determinate" value={78} color="warning" sx={{ mt: 1 }} />
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 2, textAlign: 'center' }}>
                                <Typography variant="h6" color="info.main">95%</Typography>
                                <Typography variant="caption">Customer Satisfaction</Typography>
                                <LinearProgress variant="determinate" value={95} color="info" sx={{ mt: 1 }} />
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Static Summary Table */}
                    <TableContainer component={Paper} sx={{ mt: 2 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Metric</strong></TableCell>
                                    <TableCell align="right"><strong>Current</strong></TableCell>
                                    <TableCell align="right"><strong>Target</strong></TableCell>
                                    <TableCell align="right"><strong>Variance</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Total Sales</TableCell>
                                    <TableCell align="right">Rs. 250,000</TableCell>
                                    <TableCell align="right">Rs. 300,000</TableCell>
                                    <TableCell align="right" sx={{ color: 'error.main' }}>-16.7%</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Cash Flow</TableCell>
                                    <TableCell align="right">Rs. 125,000</TableCell>
                                    <TableCell align="right">Rs. 150,000</TableCell>
                                    <TableCell align="right" sx={{ color: 'error.main' }}>-16.7%</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Expenses</TableCell>
                                    <TableCell align="right">Rs. 45,000</TableCell>
                                    <TableCell align="right">Rs. 50,000</TableCell>
                                    <TableCell align="right" sx={{ color: 'success.main' }}>-10.0%</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Profit Margin</TableCell>
                                    <TableCell align="right">82%</TableCell>
                                    <TableCell align="right">85%</TableCell>
                                    <TableCell align="right" sx={{ color: 'error.main' }}>-3.5%</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Card>
        </Grid>
    );
}
