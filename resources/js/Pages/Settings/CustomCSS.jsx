// import * as React from "react";
// import Button from "@mui/material/Button";
// import Grid from "@mui/material/Grid";
// import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
// import { Head, router } from "@inertiajs/react";
// import { useState, useEffect } from "react";
// import Swal from "sweetalert2";
// import Editor from "@monaco-editor/react"; // Import Prism CSS for syntax highlighting
// import axios from "axios";

// export default function CustomCSS({customCSS}) {
//     const [code, setCode] = useState(customCSS);

//     function handleEditorChange(value, event) {
//         setCode(value);
//     }

//     const saveTemplate = (event) => {
//         event.preventDefault();

//         axios
//             .post("/settings/custom-css", { template: code })
//             .then((response) => {
//                 // Handle success
//                 Swal.fire(
//                     "Success",
//                     "CSS updated successfully!",
//                     "success"
//                 );
//             })
//             .catch((error) => {
//                 // Handle error
//                 console.error("Error saving CSS:", error);
//                 Swal.fire("Error", "Failed to update template!", "error");
//             });
//     };

//     return (
//         <AuthenticatedLayout>
//             <Head title="Settings" />
//             <Grid container justifyContent="flex-end" sx={{ mt: 1, mb: 1 }}>
//                 <Button
//                     variant="contained"
//                     type="button"
//                     color="primary"
//                     onClick={(event) => saveTemplate(event)}
//                 >
//                     Save CSS
//                 </Button>
//             </Grid>

//             <Grid container spacing={2}>
//                 <Grid size={12}>
//                     <Editor
//                         height="85vh"
//                         language="css"
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
//             </Grid>
//         </AuthenticatedLayout>
//     );
// }
