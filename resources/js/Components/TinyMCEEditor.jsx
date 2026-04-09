import React, { useEffect, useRef, useState } from "react";

const TinyMCEEditor = ({ content, setContent, selectedTemplate }) => {
    const editorRef = useRef(null);

    useEffect(() => {
        // Dynamically load the TinyMCE script
        const script = document.createElement("script");
        script.src = '/tinymce/tinymce.min.js'; // TinyMCE CDN
        script.referrerPolicy = "origin";
        script.onload = () => {
            // Initialize TinyMCE after the script is loaded
            tinymce.init({
                target: editorRef.current,
                height: 500,
                menubar: true,
                plugins: [
                    "visualblocks",
                    "media",
                    'image',
                    "table",
                    "advlist",
                    'code',
                    'lists',
                    'preview',
                    'quickbars',
                ],
                toolbar:
                    "undo redo | formatselect | bold italic backcolor | \
                    alignleft aligncenter alignright alignjustify | \
                    bullist numlist outdent indent | \ code",
                content_style: "body { font-family:Arial,sans-serif; font-size:14px }",
                custom_elements: "style",
                valid_elements: '*[*]',
                extended_valid_elements: 'a[href|target|rel],img[src|alt|width|height]',
                convert_urls: false,
                setup: (editor) => {
                    // Listen for changes in the editor
                    editor.on("Change KeyUp", () => {
                        const updatedContent = editor.getContent();
                        setContent(updatedContent); // Update the state
                    });
                },
            });
        };

        document.body.appendChild(script); // Append the script to the document

        return () => {
            // Cleanup the TinyMCE editor and remove the script
            if (typeof tinymce !== 'undefined') {
                tinymce.remove();
            }
            document.body.removeChild(script);
        };
    }, []);

    useEffect(() => {
        if (editorRef.current && typeof tinymce !== 'undefined') {
            const editor = tinymce.activeEditor;
            if (editor) {
                editor.setContent(content);
            }
        }
    }, [selectedTemplate]);

    return (
        <div>
            {/* Textarea for TinyMCE */}
            <textarea
                ref={editorRef}
                defaultValue={content}
                style={{ visibility: "hidden" }} // Hide the default textarea
            />
            <div
                dangerouslySetInnerHTML={{ __html: content }}
                style={{
                    border: "1px solid #ddd",
                    padding: "10px",
                    marginTop: "10px",
                }}
            />
        </div>
    );
};

export default TinyMCEEditor;
