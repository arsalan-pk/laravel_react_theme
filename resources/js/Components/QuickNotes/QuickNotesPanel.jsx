import React, { useState, useEffect, useRef } from 'react';
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Collapse,
    TextField,
    Button,
    CircularProgress,
    Divider,
    Paper,
    Chip,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    Menu,
    MenuItem,
    Tab,
    Tabs,
} from '@mui/material';
import {
    Close as CloseIcon,
    ExpandLess,
    ExpandMore,
    Send as SendIcon,
    Mic as MicIcon,
    MicOff as MicOffIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Cancel as CancelIcon,
    Check as CheckIcon,
    MoreVert as MoreVertIcon,
    Delete as DeleteForeverIcon,
    Restore as RestoreIcon,
    DeleteSweep as DeleteSweepIcon,
    CheckBox as CheckBoxIcon,
    CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
    Stop as StopIcon,
    PlayArrow as PlayIcon,
    Pause as PauseIcon,
    RecordVoiceOver as RecordVoiceOverIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

const StyledDrawer = styled(Drawer)(({ theme }) => ({
    '& .MuiDrawer-paper': {
        width: 600,
        padding: 0,
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        flexDirection: 'column',
    },
}));

const ChatMessage = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(1, 2),
    marginBottom: theme.spacing(1),
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    borderRadius: '18px 18px 4px 18px',
    maxWidth: '85%',
    alignSelf: 'flex-end',
    position: 'relative',
    direction: 'auto',
    unicodeBidi: 'plaintext',
}));

const MessageContainer = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '16px 0',
    // No height restrictions - let it expand naturally
    // No overflow - messages should be fully visible
});

const QuickNotesPanel = ({ open, onClose }) => {
    const [days, setDays] = useState([]);
    const [selectedDay, setSelectedDay] = useState(null);
    const [notes, setNotes] = useState([]);
    const [expandedDays, setExpandedDays] = useState({});
    const [loading, setLoading] = useState(false);
    const [sendingNote, setSendingNote] = useState(false);
    const [noteText, setNoteText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [editingNote, setEditingNote] = useState(null);
    const [deleteConfirmNote, setDeleteConfirmNote] = useState(null);
    const [restoreConfirmNote, setRestoreConfirmNote] = useState(null);
    const [permanentDeleteConfirmNote, setPermanentDeleteConfirmNote] = useState(null);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [selectedNote, setSelectedNote] = useState(null);
    const [currentTab, setCurrentTab] = useState(0); // 0 = Active Notes, 1 = Trash
    const [trashedNotes, setTrashedNotes] = useState([]);
    const [deletingNote, setDeletingNote] = useState(false);
    const [restoringNote, setRestoringNote] = useState(false);
    const [permanentDeletingNote, setPermanentDeletingNote] = useState(false);
    const [loadingTrash, setLoadingTrash] = useState(false);
    const [recordedAudio, setRecordedAudio] = useState(null);
    const [recordedMimeType, setRecordedMimeType] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioElement, setAudioElement] = useState(null);
    const [speechRecognition, setSpeechRecognition] = useState(null);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcribedText, setTranscribedText] = useState('');
    const messagesEndRef = useRef(null);

    // Load days when panel opens
    useEffect(() => {
        if (open) {
            loadDays();
        }
    }, [open]);

    // Auto-expand last day's notes when days are loaded
    useEffect(() => {
        if (days.length > 0) {
            // Get the last day (most recent) from the days array
            const lastDay = days[days.length - 1];
            if (lastDay && Object.keys(expandedDays).length === 0) {
                // Only auto-expand last day if no days are currently expanded
                const lastDayDate = lastDay.date.split('T')[0]; // Ensure YYYY-MM-DD format
                setExpandedDays({ [lastDayDate]: true });
                loadNotesForDay(lastDayDate, false);
            }
        }
    }, [days]);

    const loadDays = async () => {
        try {
            const response = await axios.get('/api/todolist/days');
            setDays(response.data);
        } catch (error) {
            console.error('Error loading days:', error);
            setError('Failed to load notes days');
        }
    };

    const loadNotesForDay = async (date, showLoading = true) => {
        if (showLoading) {
            setLoading(true);
        }
        try {
            const response = await axios.get('/api/todolist/by-day', {
                params: { date }
            });
            const loadedNotes = response.data;
            setNotes(loadedNotes);
            setSelectedDay(date); // date is already just YYYY-MM-DD now

            // Recalculate and update day statistics based on loaded notes
            const completedCount = loadedNotes.filter(note => note.is_completed).length;
            const totalCount = loadedNotes.length;
            const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            const isAllCompleted = completedCount === totalCount && totalCount > 0;

            setDays(prevDays => prevDays.map(day => {
                if (day.date === date) {
                    return {
                        ...day,
                        completed_count: completedCount,
                        completion_percentage: completionPercentage,
                        is_all_completed: isAllCompleted,
                        note_count: totalCount
                    };
                }
                return day;
            }));

            // Removed auto-scroll when loading notes to prevent interference with reading
        } catch (error) {
            console.error('Error loading notes:', error);
            setError('Failed to load notes for this day');
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    };

    const handleDayClick = (date) => {
        const isExpanded = expandedDays[date];

        if (isExpanded) {
            // Collapse
            setExpandedDays(prev => ({ ...prev, [date]: false }));
            if (selectedDay === date) {
                setSelectedDay(null);
                setNotes([]);
            }
        } else {
            // Close all other days and expand this one
            setExpandedDays({ [date]: true });
            // Send only the date part (YYYY-MM-DD), not the timestamp
            const dateOnly = date.split('T')[0];
            loadNotesForDay(dateOnly);
        }
    };

    const handleSendNote = async () => {
        if (!noteText.trim() || sendingNote) return;

        setSendingNote(true);
        try {
            if (editingNote) {
                // Update existing note
                const formData = new FormData();
                if (noteText.trim()) {
                    formData.append('note_text', noteText.trim());
                }

                // If there's new recorded audio, include it
                if (recordedAudio && recordedMimeType !== 'existing') {
                    const response = await fetch(recordedAudio);
                    const audioBlob = await response.blob();

                    const mimeType = recordedMimeType || 'audio/webm';
                    const extension = mimeType.includes('webm') ? 'webm' :
                        mimeType.includes('mp4') ? 'mp4' :
                            mimeType.includes('wav') ? 'wav' : 'webm';

                    const audioFile = new File([audioBlob], `voice_note.${extension}`, {
                        type: mimeType,
                        lastModified: Date.now()
                    });

                    formData.append('audio_file', audioFile);
                }

                const response = await axios.post(`/api/todolist/${editingNote.id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'X-HTTP-Method-Override': 'PUT'
                    },
                });

                // Update note in UI
                setNotes(prev => prev.map(note =>
                    note.id === editingNote.id
                        ? response.data.note
                        : note
                ));

                setNoteText('');
                setEditingNote(null);
                deleteRecording();
            } else {
                // Create new note
                const response = await axios.post('/api/todolist', {
                    note_text: noteText.trim()
                });

                // Add new note directly to UI - no additional API calls
                const today = new Date().toISOString().split('T')[0];

                if (selectedDay === today) {
                    // Already viewing today, just add the new note
                    setNotes(prev => [...prev, response.data]);
                } else {
                    // Switch to today and show the new note
                    setExpandedDays({ [today]: true });
                    setSelectedDay(today);
                    setNotes([response.data]); // Just show the new note
                }

                // Scroll to bottom after adding new note
                setTimeout(() => {
                    scrollToBottom();
                }, 100);

                setNoteText('');

                // Update days count locally without API call
                setDays(prevDays => {
                    const existingDayIndex = prevDays.findIndex(day => day.date === today);
                    if (existingDayIndex >= 0) {
                        // Update existing day count
                        const updatedDays = [...prevDays];
                        updatedDays[existingDayIndex] = {
                            ...updatedDays[existingDayIndex],
                            note_count: updatedDays[existingDayIndex].note_count + 1
                        };
                        return updatedDays;
                    } else {
                        // Add new day at the beginning (newest first)
                        const newDay = {
                            date: today,
                            formatted_date: new Date().toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            }),
                            note_count: 1
                        };
                        return [newDay, ...prevDays];
                    }
                });
            }
        } catch (error) {
            console.error('Error saving note:', error);
            setError(editingNote ? 'Failed to update note' : 'Failed to save note');
        } finally {
            setSendingNote(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendNote();
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Try to use a more compatible audio format
            let options = {};
            if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
                options = { mimeType: 'audio/webm;codecs=opus' };
            } else if (MediaRecorder.isTypeSupported('audio/webm')) {
                options = { mimeType: 'audio/webm' };
            } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
                options = { mimeType: 'audio/mp4' };
            }

            const recorder = new MediaRecorder(stream, options);
            const chunks = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = async () => {
                const mimeType = recorder.mimeType || 'audio/webm';
                const blob = new Blob(chunks, { type: mimeType });
                const audioUrl = URL.createObjectURL(blob);
                setRecordedAudio(audioUrl);
                setRecordedMimeType(mimeType);
                stream.getTracks().forEach(track => track.stop());

                // Stop speech recognition when recording stops
                if (speechRecognition) {
                    speechRecognition.stop();
                }
                setIsTranscribing(false);
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
            setRecordedAudio(null); // Clear any previous recording
            setRecordedMimeType(null);
            setTranscribedText('');

            // Start speech recognition
            startSpeechRecognition();

        } catch (error) {
            console.error('Error starting recording:', error);
            setError('Could not access microphone');
        }
    };

    const startSpeechRecognition = () => {
        // Check if browser supports speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn('Speech recognition not supported in this browser');
            return;
        }

        const recognition = new SpeechRecognition();

        // Configure speech recognition
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US'; // English (United States)

        recognition.onstart = () => {
            setIsTranscribing(true);
        };

        recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }

            if (finalTranscript) {
                setTranscribedText(prev => prev + finalTranscript);
                // Also add to the text input
                setNoteText(prev => {
                    const newText = prev + (prev ? ' ' : '') + finalTranscript.trim();
                    return newText;
                });
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsTranscribing(false);
            if (event.error !== 'aborted') {
                setError('Speech recognition failed. Voice will still be recorded.');
            }
        };

        recognition.onend = () => {
            setIsTranscribing(false);
        };

        try {
            recognition.start();
            setSpeechRecognition(recognition);
        } catch (error) {
            console.error('Failed to start speech recognition:', error);
            setError('Speech recognition unavailable. Voice will still be recorded.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
            setMediaRecorder(null);
        }
        if (speechRecognition) {
            speechRecognition.stop();
            setSpeechRecognition(null);
        }
        setIsTranscribing(false);
    };

    const cancelRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
            setMediaRecorder(null);
        }
        if (speechRecognition) {
            speechRecognition.abort();
            setSpeechRecognition(null);
        }
        setRecordedAudio(null);
        setRecordedMimeType(null);
        setIsTranscribing(false);
        setTranscribedText('');

        // Clear the transcribed text from the input
        setNoteText(prev => {
            if (transcribedText && prev.includes(transcribedText)) {
                return prev.replace(transcribedText, '').trim();
            }
            return prev;
        });
    };

    const playRecording = () => {
        if (recordedAudio) {
            if (audioElement) {
                audioElement.pause();
                setAudioElement(null);
                setIsPlaying(false);
            } else {
                const audio = new Audio(recordedAudio);
                audio.onended = () => {
                    setIsPlaying(false);
                    setAudioElement(null);
                };
                audio.play();
                setAudioElement(audio);
                setIsPlaying(true);
            }
        }
    };

    const deleteRecording = () => {
        if (audioElement) {
            audioElement.pause();
            setAudioElement(null);
            setIsPlaying(false);
        }
        if (recordedAudio) {
            URL.revokeObjectURL(recordedAudio);
        }
        setRecordedAudio(null);
        setRecordedMimeType(null);
    };

    const sendWithAudio = async () => {
        if (!recordedAudio) return;

        setSendingNote(true);
        try {
            // Convert audio URL to blob
            const response = await fetch(recordedAudio);
            const audioBlob = await response.blob();

            // Create a proper File object with correct MIME type
            const mimeType = recordedMimeType || 'audio/webm';
            const extension = mimeType.includes('webm') ? 'webm' :
                mimeType.includes('mp4') ? 'mp4' :
                    mimeType.includes('wav') ? 'wav' : 'webm';

            const audioFile = new File([audioBlob], `voice_note.${extension}`, {
                type: mimeType,
                lastModified: Date.now()
            });

            // Create form data for file upload
            const formData = new FormData();
            if (noteText.trim()) {
                formData.append('note_text', noteText.trim());
            }
            formData.append('audio_file', audioFile);

            // Send to server
            const uploadResponse = await axios.post('/api/todolist', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (uploadResponse.data) {
                // Add new note directly to UI
                const today = new Date().toISOString().split('T')[0];

                if (selectedDay === today) {
                    // Already viewing today, just add the new note
                    setNotes(prev => [...prev, uploadResponse.data]);
                } else {
                    // Switch to today and show the new note
                    setExpandedDays({ [today]: true });
                    setSelectedDay(today);
                    setNotes([uploadResponse.data]);
                }

                // Update days count locally
                setDays(prevDays => {
                    const existingDayIndex = prevDays.findIndex(day => day.date === today);
                    if (existingDayIndex >= 0) {
                        const updatedDays = [...prevDays];
                        updatedDays[existingDayIndex] = {
                            ...updatedDays[existingDayIndex],
                            note_count: updatedDays[existingDayIndex].note_count + 1
                        };
                        return updatedDays;
                    } else {
                        const newDay = {
                            date: today,
                            formatted_date: new Date().toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            }),
                            note_count: 1,
                            completed_count: 0,
                            completion_percentage: 0,
                            is_all_completed: false
                        };
                        return [newDay, ...prevDays];
                    }
                });

                setNoteText('');
                deleteRecording();

                // Scroll to bottom after adding new note
                setTimeout(() => {
                    scrollToBottom();
                }, 100);
            }
        } catch (error) {
            console.error('Error uploading audio:', error);
            console.error('Error response:', error.response?.data);
            setError(error.response?.data?.message || 'Failed to send voice note');
        } finally {
            setSendingNote(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleEditNote = (note) => {
        setEditingNote(note);
        setNoteText(note.note_text || '');
        // If the note has audio, we'll keep it unless user records new audio
        if (note.audio_url) {
            setRecordedAudio(note.audio_url);
            setRecordedMimeType('existing'); // Mark as existing audio
        }
    };

    const handleCancelEdit = () => {
        setEditingNote(null);
        setNoteText('');
    };

    const handleDeleteNote = (note) => {
        setDeleteConfirmNote(note);
    };

    const confirmDeleteNote = async () => {
        if (!deleteConfirmNote || deletingNote) return;

        setDeletingNote(true);
        try {
            const response = await axios.delete(`/api/todolist/${deleteConfirmNote.id}`);

            if (response.data.success) {
                // Remove note from UI
                setNotes(prev => prev.filter(note => note.id !== deleteConfirmNote.id));

                // Update day count locally
                const noteDate = deleteConfirmNote.note_date || deleteConfirmNote.created_at.split('T')[0];
                setDays(prevDays => {
                    const existingDayIndex = prevDays.findIndex(day => day.date === noteDate);
                    if (existingDayIndex >= 0) {
                        const updatedDays = [...prevDays];
                        const newCount = updatedDays[existingDayIndex].note_count - 1;

                        if (newCount <= 0) {
                            // Remove day if no notes left
                            return updatedDays.filter((_, index) => index !== existingDayIndex);
                        } else {
                            // Update count
                            updatedDays[existingDayIndex] = {
                                ...updatedDays[existingDayIndex],
                                note_count: newCount
                            };
                            return updatedDays;
                        }
                    }
                    return prevDays;
                });

                // Clear modal and show success message
                setDeleteConfirmNote(null);
                setError('');
                setSuccessMessage('Todo deleted successfully');
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error deleting note:', error);
            setError('Failed to delete note');
            // Don't close modal on error so user can retry
        } finally {
            setDeletingNote(false);
        }
    };

    const cancelDeleteNote = () => {
        setDeleteConfirmNote(null);
    };

    const handleMenuOpen = (event, note) => {
        setMenuAnchor(event.currentTarget);
        setSelectedNote(note);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
        setSelectedNote(null);
    };

    const handleMenuEdit = () => {
        if (selectedNote) {
            handleEditNote(selectedNote);
        }
        handleMenuClose();
    };

    const handleMenuDelete = () => {
        if (selectedNote) {
            handleDeleteNote(selectedNote);
        }
        handleMenuClose();
    };

    const loadTrashedNotes = async () => {
        setLoadingTrash(true);
        try {
            const response = await axios.get('/api/todolist/trashed');
            if (response.data.success) {
                setTrashedNotes(response.data.notes);
            }
        } catch (error) {
            console.error('Error loading trashed notes:', error);
            setError('Failed to load trashed notes');
        } finally {
            setLoadingTrash(false);
        }
    };

    const handleRestoreClick = (note) => {
        setRestoreConfirmNote(note);
    };

    const handlePermanentDeleteClick = (note) => {
        setPermanentDeleteConfirmNote(note);
    };

    const confirmRestore = async () => {
        if (!restoreConfirmNote || restoringNote) return;

        setRestoringNote(true);
        try {
            const response = await axios.post(`/api/todolist/${restoreConfirmNote.id}/restore`);
            if (response.data.success) {
                // Remove from trash
                setTrashedNotes(prev => prev.filter(note => note.id !== restoreConfirmNote.id));
                // Reload active notes
                loadDays();

                // Clear modal and show success message
                setRestoreConfirmNote(null);
                setError('');
                setSuccessMessage('Todo restored successfully');
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error restoring note:', error);
            setError('Failed to restore note');
            // Don't close modal on error so user can retry
        } finally {
            setRestoringNote(false);
        }
    };

    const confirmPermanentDelete = async () => {
        if (!permanentDeleteConfirmNote || permanentDeletingNote) return;

        setPermanentDeletingNote(true);
        try {
            const response = await axios.delete(`/api/todolist/${permanentDeleteConfirmNote.id}/force`);
            if (response.data.success) {
                // Remove from trash permanently
                setTrashedNotes(prev => prev.filter(note => note.id !== permanentDeleteConfirmNote.id));

                // Clear modal and show success message
                setPermanentDeleteConfirmNote(null);
                setError('');
                setSuccessMessage('Todo permanently deleted');
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error permanently deleting note:', error);
            setError('Failed to permanently delete note');
            // Don't close modal on error so user can retry
        } finally {
            setPermanentDeletingNote(false);
        }
    };

    const cancelRestore = () => {
        setRestoreConfirmNote(null);
    };

    const cancelPermanentDelete = () => {
        setPermanentDeleteConfirmNote(null);
    };

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
        if (newValue === 1) { // Trash tab
            loadTrashedNotes();
        }
    };

    const toggleComplete = async (noteId) => {
        try {
            // Send API request first to get accurate data
            const response = await axios.patch(`/api/todolist/${noteId}/toggle-complete`);
            if (response.data.success) {
                // Update the note in the current notes list
                setNotes(prev => prev.map(note =>
                    note.id === noteId
                        ? {
                            ...note,
                            is_completed: response.data.note.is_completed,
                            completed_at: response.data.note.completed_at
                        }
                        : note
                ));

                // Recalculate completion statistics for the current day
                const updatedNotes = notes.map(note =>
                    note.id === noteId
                        ? {
                            ...note,
                            is_completed: response.data.note.is_completed,
                            completed_at: response.data.note.completed_at
                        }
                        : note
                );

                // Count completed notes in the current view
                const completedCount = updatedNotes.filter(note => note.is_completed).length;
                const totalCount = updatedNotes.length;
                const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                const isAllCompleted = completedCount === totalCount && totalCount > 0;

                // Update the days statistics
                setDays(prevDays => prevDays.map(day => {
                    if (day.date.split('T')[0] === selectedDay) {
                        return {
                            ...day,
                            completed_count: completedCount,
                            completion_percentage: completionPercentage,
                            is_all_completed: isAllCompleted
                        };
                    }
                    return day;
                }));

                setError('');
            }
        } catch (error) {
            console.error('Error toggling completion:', error);
            setError('Failed to update todo status');
        }
    };

    return (
        <StyledDrawer
            anchor="right"
            open={open}
            onClose={onClose}
        >
            {/* Header */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                borderBottom: '1px solid',
                borderColor: 'divider'
            }}>
                <Typography variant="h6" component="h2">
                    Quick Todo List
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={currentTab} onChange={handleTabChange} aria-label="todo tabs">
                    <Tab label="Active Todos" />
                    <Tab label="Trash" />
                </Tabs>
            </Box>

            {/* Scrollable Content */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {successMessage && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
                        {successMessage}
                    </Alert>
                )}

                {/* Active Notes Tab */}
                {currentTab === 0 && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                            Todos by Day
                        </Typography>
                        <List dense>
                            {days.map((day) => (
                                <React.Fragment key={day.date}>
                                    <ListItem disablePadding>
                                        <ListItemButton
                                            onClick={() => handleDayClick(day.date)}
                                            sx={{
                                                borderRadius: 1,
                                                mb: 0.5,
                                                backgroundColor: expandedDays[day.date]
                                                    ? 'action.selected'
                                                    : day.is_all_completed
                                                        ? 'success.light'
                                                        : 'transparent',
                                                border: day.is_all_completed ? '1px solid' : 'none',
                                                borderColor: day.is_all_completed ? 'success.main' : 'transparent',
                                                '&:hover': {
                                                    backgroundColor: expandedDays[day.date]
                                                        ? 'action.selected'
                                                        : day.is_all_completed
                                                            ? 'success.main'
                                                            : 'action.hover',
                                                },
                                            }}
                                        >
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="subtitle2" fontWeight={600}>
                                                            {day.formatted_date}
                                                        </Typography>
                                                        {day.is_all_completed && (
                                                            <CheckBoxIcon
                                                                fontSize="small"
                                                                sx={{ color: 'success.main' }}
                                                            />
                                                        )}
                                                    </Box>
                                                }
                                                secondary={
                                                    <Typography variant="caption" color="text.secondary">
                                                        {day.completed_count}/{day.note_count} completed
                                                        ({day.completion_percentage}%)
                                                    </Typography>
                                                }
                                            />
                                            {expandedDays[day.date] ?
                                                <ExpandLess color="primary" /> :
                                                <ExpandMore color="action" />
                                            }
                                        </ListItemButton>
                                    </ListItem>
                                    <Collapse in={expandedDays[day.date]} timeout="auto" unmountOnExit>
                                        <Box sx={{ pl: 2, pr: 1 }}>
                                            {loading && selectedDay === day.date.split('T')[0] ? (
                                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                                    <CircularProgress size={20} />
                                                </Box>
                                            ) : selectedDay === day.date.split('T')[0] ? (
                                                <MessageContainer>
                                                    {notes.map((note) => (
                                                        <Paper
                                                            key={note.id}
                                                            elevation={1}
                                                            sx={{
                                                                p: 2,
                                                                mb: 1.5,
                                                                backgroundColor: note.is_completed ? '#f0f9ff' : '#ffffff',
                                                                border: note.is_completed ? '1px solid #10b981' : '1px solid #e5e7eb',
                                                                borderRadius: 2,
                                                                transition: 'all 0.2s ease',
                                                                '&:hover': {
                                                                    boxShadow: 2,
                                                                }
                                                            }}
                                                        >
                                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                                                {/* Checkbox */}
                                                                <Box
                                                                    onClick={() => toggleComplete(note.id)}
                                                                    sx={{
                                                                        cursor: 'pointer',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        width: 24,
                                                                        height: 24,
                                                                        borderRadius: '4px',
                                                                        border: note.is_completed ? '2px solid #10b981' : '2px solid #d1d5db',
                                                                        backgroundColor: note.is_completed ? '#10b981' : 'transparent',
                                                                        transition: 'all 0.2s ease',
                                                                        '&:hover': {
                                                                            borderColor: '#10b981',
                                                                            backgroundColor: note.is_completed ? '#059669' : '#f0fdf4',
                                                                        }
                                                                    }}
                                                                >
                                                                    {note.is_completed && (
                                                                        <CheckBoxIcon
                                                                            sx={{
                                                                                color: 'white',
                                                                                fontSize: 16
                                                                            }}
                                                                        />
                                                                    )}
                                                                </Box>

                                                                {/* Message Content */}
                                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                    {note.note_text && (
                                                                        <Typography
                                                                            variant="body1"
                                                                            sx={{
                                                                                direction: 'auto',
                                                                                unicodeBidi: 'plaintext',
                                                                                textAlign: 'left',
                                                                                whiteSpace: 'pre-wrap',
                                                                                wordBreak: 'break-word',
                                                                                textDecoration: note.is_completed ? 'line-through' : 'none',
                                                                                color: note.is_completed ? '#6b7280' : '#111827',
                                                                                fontSize: '18px',
                                                                                lineHeight: 1.6,
                                                                                fontWeight: note.is_completed ? 600 : 700,
                                                                            }}
                                                                        >
                                                                            {note.note_text}
                                                                        </Typography>
                                                                    )}

                                                                    {note.audio_url && (
                                                                        <Box sx={{
                                                                            mt: note.note_text ? 1 : 0,
                                                                            p: 1.5,
                                                                            backgroundColor: '#f0f9ff',
                                                                            borderRadius: 2,
                                                                            border: '1px solid #0ea5e9',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: 1
                                                                        }}>
                                                                            <MicIcon sx={{ color: '#0ea5e9', fontSize: 20 }} />
                                                                            <Typography variant="body2" sx={{ color: '#0369a1', fontWeight: 500 }}>
                                                                                Voice Note
                                                                            </Typography>
                                                                            <audio
                                                                                controls
                                                                                style={{
                                                                                    height: '32px',
                                                                                    flex: 1,
                                                                                    minWidth: '200px'
                                                                                }}
                                                                            >
                                                                                <source src={note.audio_url} type="audio/wav" />
                                                                                <source src={note.audio_url} type="audio/mpeg" />
                                                                                Your browser does not support the audio element.
                                                                            </audio>
                                                                        </Box>
                                                                    )}

                                                                    {/* Timestamp */}
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                                                        <Typography
                                                                            variant="caption"
                                                                            sx={{
                                                                                color: '#6b7280',
                                                                                fontSize: '12px'
                                                                            }}
                                                                        >
                                                                            {note.created_at}
                                                                        </Typography>
                                                                        {note.is_completed && (
                                                                            <Box sx={{
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                gap: 0.5,
                                                                                color: '#10b981'
                                                                            }}>
                                                                                <CheckBoxIcon sx={{ fontSize: 12 }} />
                                                                                <Typography
                                                                                    variant="caption"
                                                                                    sx={{
                                                                                        color: '#10b981',
                                                                                        fontSize: '12px',
                                                                                        fontWeight: 500
                                                                                    }}
                                                                                >
                                                                                    Completed
                                                                                </Typography>
                                                                            </Box>
                                                                        )}
                                                                    </Box>
                                                                </Box>

                                                                {/* Menu Button */}
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={(event) => handleMenuOpen(event, note)}
                                                                    sx={{
                                                                        color: '#6b7280',
                                                                        '&:hover': {
                                                                            backgroundColor: '#f3f4f6',
                                                                            color: '#374151'
                                                                        }
                                                                    }}
                                                                >
                                                                    <MoreVertIcon fontSize="small" />
                                                                </IconButton>
                                                            </Box>
                                                        </Paper>
                                                    ))}
                                                    {notes.length === 0 && (
                                                        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                                                            <Typography variant="body2">
                                                                No todos for this day yet. Add one below!
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                    <div ref={messagesEndRef} />
                                                </MessageContainer>
                                            ) : null}
                                        </Box>
                                    </Collapse>
                                </React.Fragment>
                            ))}
                        </List>
                    </Box>
                )}

                {/* Trash Tab */}
                {currentTab === 1 && (
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                            Deleted Notes
                        </Typography>
                        {loadingTrash ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : trashedNotes.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <DeleteSweepIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                                <Typography variant="body2" color="text.secondary">
                                    No deleted notes
                                </Typography>
                            </Box>
                        ) : (
                            <List dense>
                                {trashedNotes.map((note) => (
                                    <ListItem key={note.id} sx={{ mb: 1 }}>
                                        <Paper sx={{ width: '100%', p: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <Box sx={{ flex: 1 }}>
                                                    {note.note_text && (
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                direction: 'auto',
                                                                unicodeBidi: 'plaintext',
                                                                textAlign: 'left',
                                                                whiteSpace: 'pre-wrap',
                                                                wordBreak: 'break-word',
                                                                mb: 1
                                                            }}
                                                        >
                                                            {note.note_text}
                                                        </Typography>
                                                    )}

                                                    {note.audio_url && (
                                                        <Box sx={{
                                                            mt: note.note_text ? 1 : 0,
                                                            p: 1.5,
                                                            backgroundColor: '#fff3e0',
                                                            borderRadius: 2,
                                                            border: '1px solid #ff9800',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1,
                                                            mb: 1
                                                        }}>
                                                            <MicIcon sx={{ color: '#f57c00', fontSize: 20 }} />
                                                            <Typography variant="body2" sx={{ color: '#e65100', fontWeight: 500 }}>
                                                                Deleted Voice Note
                                                            </Typography>
                                                            <audio
                                                                controls
                                                                style={{
                                                                    height: '32px',
                                                                    flex: 1,
                                                                    minWidth: '200px'
                                                                }}
                                                            >
                                                                <source src={note.audio_url} type="audio/wav" />
                                                                <source src={note.audio_url} type="audio/webm" />
                                                                <source src={note.audio_url} type="audio/mpeg" />
                                                                Your browser does not support the audio element.
                                                            </audio>
                                                        </Box>
                                                    )}
                                                    <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
                                                        Created: {note.created_at}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ opacity: 0.6, display: 'block' }}>
                                                        Deleted: {note.deleted_at}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleRestoreClick(note)}
                                                        sx={{ color: 'success.main' }}
                                                        title="Restore"
                                                    >
                                                        <RestoreIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handlePermanentDeleteClick(note)}
                                                        sx={{ color: 'error.main' }}
                                                        title="Delete Permanently"
                                                    >
                                                        <DeleteForeverIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                        </Paper>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Box>
                )}
            </Box>

            {/* Fixed Bottom Input - Only show on Active Notes tab */}
            {currentTab === 0 && (
                <Box sx={{
                    p: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'background.paper'
                }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                        {editingNote ? 'Edit Todo' : 'Add New Todo'}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            maxRows={6}
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your todo here... (Supports Urdu text)"
                            variant="outlined"
                            size="small"
                            InputProps={{
                                style: {
                                    direction: 'auto',
                                    textAlign: 'left',
                                }
                            }}
                            sx={{
                                '& .MuiInputBase-input': {
                                    direction: 'auto',
                                    unicodeBidi: 'plaintext',
                                    fontSize: '18px',
                                    fontWeight: 700,
                                }
                            }}
                        />
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            {/* Recording Controls */}
                            {!isRecording && !recordedAudio && (
                                <IconButton
                                    color="primary"
                                    onClick={startRecording}
                                    size="small"
                                    sx={{
                                        border: '1px solid',
                                        borderColor: 'primary.main',
                                        position: 'relative'
                                    }}
                                    title="Start Recording with Speech Recognition"
                                >
                                    <MicIcon />
                                    <RecordVoiceOverIcon
                                        sx={{
                                            position: 'absolute',
                                            top: -2,
                                            right: -2,
                                            fontSize: 12,
                                            color: 'success.main',
                                            backgroundColor: 'white',
                                            borderRadius: '50%'
                                        }}
                                    />
                                </IconButton>
                            )}

                            {isRecording && (
                                <>
                                    <IconButton
                                        color="error"
                                        onClick={stopRecording}
                                        size="small"
                                        sx={{
                                            border: '1px solid',
                                            borderColor: 'error.main',
                                        }}
                                        title="Stop Recording"
                                    >
                                        <StopIcon />
                                    </IconButton>
                                    <IconButton
                                        color="warning"
                                        onClick={cancelRecording}
                                        size="small"
                                        sx={{
                                            border: '1px solid',
                                            borderColor: 'warning.main',
                                        }}
                                        title="Cancel Recording"
                                    >
                                        <CancelIcon />
                                    </IconButton>
                                </>
                            )}

                            {recordedAudio && (
                                <>
                                    <IconButton
                                        color="success"
                                        onClick={playRecording}
                                        size="small"
                                        sx={{
                                            border: '1px solid',
                                            borderColor: 'success.main',
                                        }}
                                        title={isPlaying ? "Pause" : "Play Recording"}
                                    >
                                        {isPlaying ? <PauseIcon /> : <PlayIcon />}
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={deleteRecording}
                                        size="small"
                                        sx={{
                                            border: '1px solid',
                                            borderColor: 'error.main',
                                        }}
                                        title="Delete Recording"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                    <Button
                                        variant="outlined"
                                        onClick={sendWithAudio}
                                        size="small"
                                        disabled={sendingNote}
                                        startIcon={sendingNote ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                                        title="Send with Voice Note"
                                    >
                                        {sendingNote ? 'Uploading...' : 'Send Audio'}
                                    </Button>
                                </>
                            )}

                            {editingNote && (
                                <Button
                                    variant="outlined"
                                    onClick={handleCancelEdit}
                                    startIcon={<CancelIcon />}
                                    size="small"
                                >
                                    Cancel
                                </Button>
                            )}

                            {/* Regular Send Button */}
                            {!recordedAudio && (
                                <Button
                                    variant="contained"
                                    onClick={handleSendNote}
                                    disabled={!noteText.trim() || sendingNote}
                                    startIcon={sendingNote ? <CircularProgress size={16} color="inherit" /> : (editingNote ? <CheckIcon /> : <SendIcon />)}
                                    size="small"
                                >
                                    {sendingNote ? (editingNote ? 'Updating...' : 'Sending...') : (editingNote ? 'Update' : 'Send')}
                                </Button>
                            )}
                        </Box>
                        {isRecording && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                                <Chip
                                    label="🎤 Recording Audio... Click Stop when done"
                                    color="error"
                                    size="small"
                                    sx={{
                                        alignSelf: 'flex-start',
                                        animation: 'pulse 1.5s infinite'
                                    }}
                                />
                                {isTranscribing && (
                                    <Chip
                                        label="🗣️ Converting speech to text..."
                                        color="info"
                                        size="small"
                                        sx={{
                                            alignSelf: 'flex-start',
                                            animation: 'pulse 1.5s infinite'
                                        }}
                                    />
                                )}
                            </Box>
                        )}

                        {recordedAudio && !isRecording && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                <Chip
                                    label="🎵 Voice note ready - Play to preview or Send"
                                    color="success"
                                    size="small"
                                    sx={{ alignSelf: 'flex-start' }}
                                />
                            </Box>
                        )}
                    </Box>
                </Box>
            )}

            {/* Dropdown Menu */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <MenuItem onClick={handleMenuEdit}>
                    <EditIcon fontSize="small" sx={{ mr: 1 }} />
                    Edit
                </MenuItem>
                <MenuItem onClick={handleMenuDelete} sx={{ color: 'error.main' }}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                    Delete
                </MenuItem>
            </Menu>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={!!deleteConfirmNote}
                onClose={deletingNote ? undefined : cancelDeleteNote}
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
            >
                <DialogTitle id="delete-dialog-title">
                    Delete Note
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-dialog-description">
                        Are you sure you want to delete this note? This action cannot be undone.
                    </DialogContentText>
                    {deleteConfirmNote && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                "{deleteConfirmNote.note_text}"
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelDeleteNote} color="primary" disabled={deletingNote}>
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmDeleteNote}
                        color="error"
                        variant="contained"
                        disabled={deletingNote}
                    >
                        {deletingNote ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Restore Confirmation Dialog */}
            <Dialog
                open={!!restoreConfirmNote}
                onClose={restoringNote ? undefined : cancelRestore}
                aria-labelledby="restore-dialog-title"
                aria-describedby="restore-dialog-description"
            >
                <DialogTitle id="restore-dialog-title">
                    Restore Note
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="restore-dialog-description">
                        Are you sure you want to restore this note? It will be moved back to your active notes.
                    </DialogContentText>
                    {restoreConfirmNote && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                "{restoreConfirmNote.note_text}"
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelRestore} color="primary" disabled={restoringNote}>
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmRestore}
                        color="success"
                        variant="contained"
                        disabled={restoringNote}
                    >
                        {restoringNote ? 'Restoring...' : 'Restore'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Permanent Delete Confirmation Dialog */}
            <Dialog
                open={!!permanentDeleteConfirmNote}
                onClose={permanentDeletingNote ? undefined : cancelPermanentDelete}
                aria-labelledby="permanent-delete-dialog-title"
                aria-describedby="permanent-delete-dialog-description"
            >
                <DialogTitle id="permanent-delete-dialog-title">
                    Permanently Delete Note
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="permanent-delete-dialog-description">
                        Are you sure you want to permanently delete this note? This action cannot be undone and the note will be lost forever.
                    </DialogContentText>
                    {permanentDeleteConfirmNote && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 1, color: 'error.contrastText' }}>
                            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                "{permanentDeleteConfirmNote.note_text}"
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelPermanentDelete} color="primary" disabled={permanentDeletingNote}>
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmPermanentDelete}
                        color="error"
                        variant="contained"
                        disabled={permanentDeletingNote}
                    >
                        {permanentDeletingNote ? 'Deleting...' : 'Delete Forever'}
                    </Button>
                </DialogActions>
            </Dialog>
        </StyledDrawer>
    );
};

export default QuickNotesPanel;
