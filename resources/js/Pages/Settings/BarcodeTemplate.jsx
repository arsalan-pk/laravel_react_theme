// import * as React from "react";
// import Button from "@mui/material/Button";
// import Grid from "@mui/material/Grid";
// import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
// import { Head, router, usePage } from "@inertiajs/react";
// import { useState, useEffect } from "react";
// import Swal from "sweetalert2";
// import Editor from "@monaco-editor/react"; // Import Prism CSS for syntax highlighting
// import ejs from "ejs";
// import axios from "axios";
// import dayjs from "dayjs";
// import JsBarcode from "jsbarcode";

// export default function BarcodeTemplate({
//     template,
//     product,
//     barcode_settings,
//     template_name,
// }) {
//     const [code, setCode] = useState(template);
//     const [renderedTemplate, setRenderedTemplate] = useState("");

//     const shop_name = usePage().props.settings.shop_name;

//     const parsedBarcodeSettings = barcode_settings.barcode_settings
//         ? JSON.parse(barcode_settings.barcode_settings)
//         : {};

//     const [settings] = useState({
//         containerHeight: parsedBarcodeSettings.container_height || "28mm",
//         storeFontSize: parsedBarcodeSettings.store_font_size || "0.8em",
//         priceFontSize: parsedBarcodeSettings.price_font_size || "0.8em",
//         priceMarginTop: parsedBarcodeSettings.price_margin_top || "-3px",
//         priceMarginBottom: parsedBarcodeSettings.price_margin_bottom || "-5px",
//         barcodeMarginTop: parsedBarcodeSettings.barcode_margin_top || "-10px",
//         barcodeHeight: parsedBarcodeSettings.barcode_height || 35,
//         barcodeFontSize: parsedBarcodeSettings.barcode_font_size || 14,
//         barcodeWidth: parsedBarcodeSettings.barcode_width || 1.5,
//         barcodeFormat: parsedBarcodeSettings.barcode_format || "CODE128",
//         productNameMarginTop:
//             parsedBarcodeSettings.product_name_margin_top || "-4px",
//         productNameFontSize:
//             parsedBarcodeSettings.product_name_font_size || "0.7em",
//     });

//     function generateBarcode() {
//         // Ensure that the barcode element is available before calling JsBarcode
//         JsBarcode("#barcode", product.barcode, {
//           format: settings.barcodeFormat,
//           width: settings.barcodeWidth,
//           height: settings.barcodeHeight,
//           fontSize: settings.barcodeFontSize,
//         });
//       }

//     useEffect(() => {
//         const fetchTemplateAndRender = async () => {
//             try {
//                 const data = {
//                     product,
//                     settings,
//                     shop_name,
//                     barcode_settings,
//                 };

//                 // Render the EJS template with the fetched data
//                 const rendered = ejs.render(code, data);
//                 setRenderedTemplate(rendered); // Store rendered HTML
//             } catch (error) {
//                 console.error("Error rendering template:", error);
//             }
//         };

//         fetchTemplateAndRender();
//     }, [code]);

//     useEffect(() => {
//         const timer = setTimeout(() => {
//           generateBarcode(); // Call the barcode generation function
//         }, 500);
//     }, [renderedTemplate]);

//     function handleEditorChange(value, event) {
//         setCode(value);
//     }

//     const saveTemplate = (event) => {
//         event.preventDefault();

//         axios
//             .post("/settings/save-template", { template: code, template_name: template_name })
//             .then((response) => {
//                 // Handle success
//                 Swal.fire(
//                     "Success",
//                     "Template updated successfully!",
//                     "success"
//                 );
//             })
//             .catch((error) => {
//                 // Handle error
//                 console.error("Error saving template:", error);
//                 Swal.fire("Error", "Failed to update template!", "error");
//             });
//     };

//     return (
//         <AuthenticatedLayout>
//             <Head title="Settings" />
//             <Grid container justifyContent="flex-start" sx={{ mt: 1, mb: 1 }}>
//                 <Button
//                     variant="contained"
//                     type="button"
//                     color="primary"
//                     onClick={(event) => saveTemplate(event)}
//                 >
//                     Save Template
//                 </Button>
//             </Grid>

//             <Grid container spacing={2}>
//                 <Grid size={8}>
//                     <Editor
//                         height="85vh"
//                         language="html"
//                         theme="vs-dark"
//                         value={code}
//                         onChange={handleEditorChange}
//                         options={{
//                             inlineSuggest: true,
//                             fontSize: "16px",
//                             formatOnType: false,
//                             autoClosingBrackets: true,
//                             minimap: { scale: 10 },
//                         }}
//                     />
//                 </Grid>
//                 <Grid size={4}>
//                     <div
//                         className="quote-preview"
//                         dangerouslySetInnerHTML={{ __html: renderedTemplate }}
//                     />
//                 </Grid>
//             </Grid>
//         </AuthenticatedLayout>
//     );
// }
