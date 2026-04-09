import React, { useState } from 'react';
import QuickNotesIcon from './QuickNotesIcon';
import QuickNotesPanel from './QuickNotesPanel';

const QuickNotes = () => {
    const [panelOpen, setPanelOpen] = useState(false);

    const handleIconClick = () => {
        setPanelOpen(true);
    };

    const handlePanelClose = () => {
        setPanelOpen(false);
    };

    return (
        <>
            <QuickNotesIcon onClick={handleIconClick} />
            <QuickNotesPanel open={panelOpen} onClose={handlePanelClose} />
        </>
    );
};

export default QuickNotes;
