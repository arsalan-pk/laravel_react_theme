import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import {
    IconButton,
    TextField,
    Grid,
    Divider,
    Table, TableBody, TableRow, TableCell,
    Box,
    Typography
} from "@mui/material";

import PercentIcon from '@mui/icons-material/Percent';
import PaymentsIcon from '@mui/icons-material/Payments';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCreditCard } from "@fortawesome/free-solid-svg-icons";
import InputAdornment from "@mui/material/InputAdornment";
import { router } from "@inertiajs/react";
import axios from "axios";
import Swal from "sweetalert2";
import { usePage } from "@inertiajs/react";
import { X } from "lucide-react";
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useCurrencyFormatter } from "@/lib/currencyFormatter";
import { useCurrencyStore } from "@/stores/currencyStore";

export default function PaymentsCheckoutDialog({
    useCart,
    open,
    setOpen,
    selectedContact,
    formData,
    is_sale = false,
}) {
    const formatCurrency = useCurrencyFormatter();
    const currencySymbol = useCurrencyStore((state) => state.settings.currency_symbol);
    // Support both SalesContext (has charges/discount helpers) and PurchaseContext (no charges helpers)
    const cart = useCart();
    const cartState = cart.cartState || [];
    const cartTotal = cart.cartTotal ?? 0;
    const emptyCart = cart.emptyCart;
    const totalProfit = cart.totalProfit ?? 0;
    const finalTotal = cart.finalTotal ?? cartTotal;
    const charges = cart.charges ?? [];
    const totalChargeAmount = cart.totalChargeAmount ?? 0;
    const discount = cart.discount ?? 0;
    const setContextDiscount = cart.setDiscount ?? (() => { });
    const calculateChargesWithDiscount = cart.calculateChargesWithDiscount ?? (() => 0);
    const return_sale_id = usePage().props.sale_id;
    const edit_sale = usePage().props.edit_sale;
    const edit_sale_id = usePage().props.sale_id;
    const sale_date = formData.sale_date;
    const sale_time = formData.sale_time;

    const [loading, setLoading] = useState(false);
    const [showProfit, setShowProfit] = useState(false);

    const [amount, setAmount] = useState((finalTotal - discount))
    const [payments, setPayments] = useState([])
    const [amountReceived, setAmountReceived] = useState(0)
    const [recalculatedCharges, setRecalculatedCharges] = useState(totalChargeAmount)

    // Calculate reactive final total with discount
    const reactiveFinalTotal = (cartTotal - discount) + recalculatedCharges;
    const return_sale = usePage().props.return_sale  ? true : (reactiveFinalTotal < 0 ? true : false);
    // Initialize recalculated charges when charges/cartTotal/discount change
    useEffect(() => {
        const initialCharges = calculateChargesWithDiscount(discount);
        setRecalculatedCharges(initialCharges);
        setAmount((cartTotal - discount) + initialCharges);
    }, [charges, cartTotal, discount]);

    const [anchorEl, setAnchorEl] = React.useState(null);
    const openPayment = Boolean(anchorEl);
    const handlePaymentClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handlePaymentClose = () => {
        setAnchorEl(null);
    };

    const handleDiscountChange = (event) => {
        const inputDiscount = event.target.value;
        const newDiscount =
            inputDiscount !== "" ? parseFloat(inputDiscount) : 0;
        setContextDiscount(newDiscount);

        const recalculatedChargeAmount = calculateChargesWithDiscount(newDiscount);
        setRecalculatedCharges(recalculatedChargeAmount);
    };

    const handleClose = () => {
        setPayments([])
        setAmountReceived(0)
        setContextDiscount(0)
        setOpen(false);
    };

    useEffect(() => {
        if (open) {
            setContextDiscount(0);
        }
    }, [open])

    useEffect(() => {
        const initialAmount = (cartTotal - discount) + recalculatedCharges;
        setAmount(initialAmount);
        setAmountReceived(payments.reduce((sum, payment) => sum + payment.amount, 0));
    }, [])

    useEffect(() => {
        setAmountReceived(payments.reduce((sum, payment) => sum + payment.amount, 0));
    }, [payments])

    const handleSubmit = (event) => {
        event.preventDefault();

        if (loading) return;

        // Validate that a customer is selected
        if (!selectedContact || !selectedContact.id) {
            Swal.fire({
                title: "Error!",
                text: "Please select a customer before checkout.",
                icon: "error",
                showConfirmButton: true,
            });
            return;
        }

        setLoading(true);

        const submittedFormData = new FormData(event.currentTarget);
        let formJson = Object.fromEntries(submittedFormData.entries());
        // formData = Object.fromEntries(formData);
        formJson.cartItems = cartState;
        formJson.charges = charges;
        formJson.contact_id = selectedContact.id;
        formJson.payments = payments;
        formJson = { ...formData, ...formJson } //Form data from the POS / Purchase form (ensure local values win)
        formJson.profit_amount = totalProfit - discount

        formJson.return_sale = return_sale;
        formJson.return_mode = return_sale ? 'return' : 'sale';
        formJson.return_sale_id = return_sale_id;
        formJson.edit_sale_id = edit_sale_id;
        formJson.edit_sale = edit_sale;
        formJson.sale_time = sale_time;
        formJson.sale_date = sale_date;

        // Ensure net_total is always a numeric value and not overwritten
        formJson.net_total = reactiveFinalTotal;
        // Ensure discount is always a number (default to 0 if not provided or invalid)
        formJson.discount = Number(formJson.discount || discount || 0);

        let url = '/pos/checkout';
        if (!is_sale) { url = "/purchase/store" }
        axios
            .post(url, formJson)
            .then((resp) => {
                const vendorIdFromResponse = resp?.data?.purchase?.contact_id ?? selectedContact?.id ?? null;
                const redirectUrl = resp?.data?.redirect_url
                    ?? (vendorIdFromResponse ? `/vendors/${vendorIdFromResponse}` : null);

                Swal.fire({
                    title: "Success!",
                    text: resp.data.message,
                    icon: "success",
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                });
                emptyCart(); //Clear the cart from the Context API
                setContextDiscount(0);
                setPayments([])
                if (!is_sale) {
                    if (redirectUrl) {
                        window.location.assign(redirectUrl);
                    } else {
                        router.visit("/purchases");
                    }
                } else {
                    router.visit('/receipt/' + (resp.data.encrypted_sale_id || resp.data.sale_id))
                }
                setOpen(false)
            })
            .catch((error) => {
                // Extract user-readable error message
                let errorMessage = 'An error occurred while processing your request.';

                if (error.response?.data?.error) {
                    errorMessage = error.response.data.error;
                } else if (error.response?.data?.message) {
                    errorMessage = error.response.data.message;
                } else if (error.message) {
                    errorMessage = error.message;
                }

                Swal.fire({
                    title: "Failed!",
                    text: errorMessage,
                    icon: "error",
                    showConfirmButton: true,
                });
                // console.log(error);
            }).finally(() => {
                setLoading(false); // Reset submitting state
            });
    };

    // Function to handle the addition of a payment
    const addPayment = (paymentMethod) => {
        const netTotal = (cartTotal - discount) + recalculatedCharges;
        const balance = amountReceived + parseFloat(amount)
        if (netTotal < balance) {
            alert('Payment cannot be exceeded the total amount')
        }
        else if (amount) {
            const newPayment = { payment_method: paymentMethod, amount: parseFloat(amount) };
            setPayments([...payments, newPayment]);
            const newBalance = netTotal - balance;
            setAmount(newBalance > 0 ? newBalance : 0);
        }
        handlePaymentClose()
    };


    // Function to remove a payment
    const deletePayment = (index) => {
        const newPayments = payments.filter((_, i) => i !== index);
        setPayments(newPayments);
    };

    const discountPercentage = () => {
        if (discount < 0 || discount > 100) {
            alert("Discount must be between 0 and 100");
            return;
        }
        const discountAmount = (cartTotal * discount) / 100;
        setContextDiscount(discountAmount);

        const recalculatedChargeAmount = calculateChargesWithDiscount(discountAmount);
        setRecalculatedCharges(recalculatedChargeAmount);
    }

    return (
        <>
            <Dialog
                fullWidth={true}
                fullScreen={window.innerWidth < 768}
                maxWidth={"sm"}
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                PaperProps={{
                    component: 'form',
                    onSubmit: handleSubmit,
                }}
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center" justifyContent="start">
                        <Typography variant="h6">ADD PAYMENTS</Typography>
                        <Box display="flex" alignItems="center">
                            <Typography variant="body1" sx={{
                                fontWeight: 'bold',
                                mr: 1,
                                // color: 'primary.main'
                            }}>
                                {showProfit ? formatCurrency(totalProfit - discount, false) : ''}
                            </Typography>
                            <IconButton
                                onClick={() => setShowProfit(!showProfit)}
                                size="small"
                                // sx={{ color: 'primary.main' }}
                            >
                                {showProfit ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                        </Box>
                    </Box>
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={(theme) => ({
                        position: "absolute",
                        right: 8,
                        top: 8,
                        color: theme.palette.grey[600],
                    })}
                >
                    <X size={26} />
                </IconButton>
                <DialogContent>
                    <Grid container spacing={2} alignItems={'center'}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                type="number"
                                name="discount"
                                label="Discount"
                                variant="outlined"
                                value={discount}
                                onChange={handleDiscountChange}
                                onFocus={(event) => {
                                    event.target.select();
                                }}
                                slotProps={{
                                    inputLabel: {
                                        shrink: true,
                                    },
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                {currencySymbol}
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="start">
                                                <IconButton color="primary" onClick={discountPercentage}>
                                                    <PercentIcon fontSize="small"></PercentIcon>
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                size="large"
                                fullWidth
                                type="number"
                                name="net_total"
                                label="Total"
                                variant="outlined"
                                sx={{ input: { fontWeight: 'bold', } }}
                                value={reactiveFinalTotal}
                                onFocus={(event) => {
                                    event.target.select();
                                }}
                                slotProps={{
                                    inputLabel: {
                                        shrink: true,
                                    },
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                {currencySymbol}
                                            </InputAdornment>
                                        ),
                                        readOnly: true,
                                    },
                                }}
                            />
                        </Grid>

                        <Grid container size={12} flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
                            <Grid size={12} sx={{ mt: '1rem' }}>

                                <TextField
                                    autoFocus
                                    fullWidth
                                    type="number"
                                    name="amount"
                                    label="Amount"
                                    variant="outlined"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    onFocus={(event) => {
                                        event.target.select();
                                    }}
                                    sx={{ input: { fontSize: '1.4rem' } }}
                                    slotProps={{
                                        inputLabel: {
                                            shrink: true,
                                        },
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    {currencySymbol}
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid size={12} spacing={1} container justifyContent={'center'}>
                                <Grid size={{ xs: 6, sm: 4 }}>
                                    {!return_sale &&  (
                                    <Button
                                        fullWidth
                                        component="label"
                                        role={undefined}
                                        variant="contained"
                                        startIcon={<PaymentsIcon />}
                                        onClick={() => addPayment('Cash')}
                                        color="success"
                                    >
                                        CASH
                                    </Button>
                                    )}
                                </Grid>
                                {selectedContact?.id !== 1 && (
                                    <Grid size={{ xs: 6, sm: 4 }}>
                                        <Button
                                            fullWidth
                                            component="label"
                                            role={undefined}
                                            variant="contained"
                                            title=" pay later"
                                            startIcon={<PauseCircleOutlineIcon />}
                                            onClick={() => addPayment('Credit')}
                                            color="error"
                                        >
                                            CREDIT
                                        </Button>
                                    </Grid>
                                )}
                                <Grid size={{ xs: 6, sm: 4 }}>
                                    {!return_sale &&  (   
                                    <Button
                                        fullWidth
                                        component="label"
                                        role={undefined}
                                        variant="contained"
                                        startIcon={<CreditCardIcon />}
                                        onClick={() => addPayment('Bank')}
                                    >
                                        BANK
                                    </Button>
                                    )}
                                </Grid>
                                <Grid size={{ xs: 6, sm: 4 }}>
                                    {!return_sale &&  (
                                    <Button
                                        fullWidth
                                        component="label"
                                        role={undefined}
                                        variant="contained"
                                        startIcon={<FontAwesomeIcon icon={faCreditCard} size={"2xl"} />}
                                        onClick={() => addPayment('Easypaisa')}
                                    >
                                        Easypaisa
                                    </Button>
                                    )}
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Divider sx={{ py: '0.5rem' }}></Divider>

                    <Table sx={{ width: '100%', bgcolor: 'background.paper' }}>
                        <TableBody>
                            {payments.map((payment, index) => (
                                <TableRow key={index}>
                                    {/* Display Payment Method Icon */}
                                    <TableCell sx={{ padding: '5px 16px' }}>
                                        {payment.payment_method === 'Cash' && <PaymentsIcon />}
                                        {payment.payment_method === 'Bank' && <CreditCardIcon />}
                                        {payment.payment_method === 'Easypaisa' && <FontAwesomeIcon icon={faCreditCard} />}
                                        {payment.payment_method === 'Credit' && <PauseCircleOutlineIcon />}
                                        <span className="ml-2"><strong>{payment.payment_method}</strong></span>
                                    </TableCell>

                                    {/* Display Payment Amount */}
                                    <TableCell align="right">
                                        <strong>{formatCurrency(payment.amount)}</strong>
                                    </TableCell>

                                    {/* Action Button to delete payment */}
                                    <TableCell align="center">
                                        <IconButton edge="end" color="error" onClick={() => deletePayment(index)}>
                                            <HighlightOffIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <TextField
                        fullWidth
                        variant="outlined"
                        label={"Note"}
                        name="note"
                        // multiline
                        sx={{ mt: "1rem" }}
                        size="large"
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        fullWidth
                        sx={{ paddingY: "15px", fontSize: "1.5rem" }}
                        type="submit"
                        disabled={amountReceived - ((cartTotal - discount) + recalculatedCharges) < 0 || loading || amountReceived > ((cartTotal - discount) + recalculatedCharges)}
                    >
                        {loading ? 'Loading...' : 'PAY'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}