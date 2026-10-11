import * as React from "react"
import {
    Card,
    CardContent,
    Stack,
    Typography,
    Box,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { ChartLine, Package, PackageCheck, User, Bell } from "lucide-react";
import { usePage } from "@inertiajs/react";
import { useCurrencyFormatter } from "@/lib/currencyFormatter";

export function OverViewCards() {
    const formatCurrency = useCurrencyFormatter();
    const theme = useTheme();


    const [hiddenCards, setHiddenCards] = React.useState(new Set(['Total Valuation']));

    const toggleCardVisibility = (cardTitle) => {
        setHiddenCards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(cardTitle)) {
                newSet.delete(cardTitle);
            } else {
                newSet.add(cardTitle);
            }
            return newSet;
        });
    };

    const metrics = [
        {
            title: "Total Items",
            value: 1250,
            subtitle: "3,450 units in stock",
            icon: <Package />,
            color: theme.palette.primary.main,
            isAmount: false,
        },
        {
            title: "Total Valuation",
            value: formatCurrency(450000.00),
            subtitle: "Inventory at cost",
            icon: <ChartLine />,
            color: theme.palette.info.main,
            isAmount: true,
        },
            ];

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                },
                gap: { xs: 1.5, md: 2 },
                mb: { xs: 2, md: 3 },
            }}
        >
            {metrics.map((metric) => (
                <Card
                    key={metric.title}
                    elevation={0}
                    onClick={() => {
                        if (metric.isAmount) {
                            toggleCardVisibility(metric.title);
                        } else if (metric.onClick) {
                            metric.onClick();
                        }
                    }}
                    sx={{
                        borderRadius: 2,
                        border: `1px solid ${alpha(metric.color, 0.25)}`,
                        cursor: metric.isAmount || metric.onClick ? "pointer" : "default",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        "&:hover": {
                            transform: (metric.isAmount || metric.onClick) ? "translateY(-2px)" : "none",
                            boxShadow: (metric.isAmount || metric.onClick)
                                ? "0 10px 30px rgba(15,23,42,0.15)"
                                : undefined,
                        },
                    }}
                >
                    <CardContent>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box
                                sx={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: "50%",
                                    backgroundColor: alpha(metric.color, 0.12),
                                    color: metric.color,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {metric.icon}
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography
                                    variant="subtitle2"
                                    color="text.secondary"
                                    sx={{ textTransform: "uppercase", fontWeight: 600 }}
                                >
                                    {metric.title}
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    {metric.isAmount && hiddenCards.has(metric.title) ? "####" : metric.value}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {metric.subtitle}
                                </Typography>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
}
