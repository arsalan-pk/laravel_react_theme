import React from 'react';
import { Fab, Tooltip } from '@mui/material';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import { styled } from '@mui/material/styles';

const StyledFab = styled(Fab)(({ theme }) => ({
    position: 'fixed',
    bottom: 20,
    right: 20,
    zIndex: 1000,
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    '&:hover': {
        backgroundColor: theme.palette.primary.dark,
        transform: 'scale(1.05)',
    },
    transition: 'all 0.2s ease-in-out',
    boxShadow: theme.shadows[6],
}));

const QuickNotesIcon = ({ onClick }) => {
    return (
        <Tooltip title="Quick Notes" placement="left">
            <StyledFab
                size="medium"
                onClick={onClick}
                aria-label="Quick Notes"
            >
                <StickyNote2Icon />
            </StyledFab>
        </Tooltip>
    );
};

export default QuickNotesIcon;
