import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import "dayjs/locale/en-gb";
import dayjs from "dayjs";

export default function MUIDatePicker({ name, label, value, onChange, format = "DD/MM/YYYY", returnFormat = "YYYY-MM-DD", size = "medium" }) {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
            <DatePicker
                name={name}
                label={label}
                className="w-full"
                format={format}
                size={size}
                slotProps={{
                    textField: {
                        size: size,
                        fullWidth: true
                    }
                }}
                value={value ? dayjs(value, [returnFormat, "YYYY-MM-DD", "DD/MM/YYYY"]) : null}
                onChange={(newValue) =>
                    onChange(newValue ? newValue.format(returnFormat) : "")
                }
            />
        </LocalizationProvider>
    );
}