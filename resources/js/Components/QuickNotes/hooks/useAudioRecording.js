import { useState, useRef, useCallback } from 'react';
import { audioUtils, errorUtils } from '../utils';
import { MESSAGES } from '../constants';

export const useAudioRecording = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordedAudio, setRecordedAudio] = useState(null);
    const [recordedMimeType, setRecordedMimeType] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    
    const mediaRecorderRef = useRef(null);
    const audioElementRef = useRef(null);

    const startRecording = useCallback(async (onError) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const options = audioUtils.getBestAudioFormat();
            const recorder = new MediaRecorder(stream, options);
            const chunks = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => {
                const mimeType = recorder.mimeType || 'audio/webm';
                const blob = new Blob(chunks, { type: mimeType });
                const audioUrl = URL.createObjectURL(blob);
                
                setRecordedAudio(audioUrl);
                setRecordedMimeType(mimeType);
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            mediaRecorderRef.current = recorder;
            setIsRecording(true);
            setRecordedAudio(null);
            setRecordedMimeType(null);
            
            return true;
        } catch (error) {
            errorUtils.logError('AudioRecording Start', error);
            onError?.(MESSAGES.ERRORS.MICROPHONE_ACCESS);
            return false;
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current = null;
            setIsRecording(false);
        }
    }, [isRecording]);

    const cancelRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current = null;
            setIsRecording(false);
        }
        
        if (recordedAudio) {
            URL.revokeObjectURL(recordedAudio);
        }
        
        setRecordedAudio(null);
        setRecordedMimeType(null);
    }, [isRecording, recordedAudio]);

    const playRecording = useCallback(() => {
        if (!recordedAudio) return;

        if (audioElementRef.current) {
            audioElementRef.current.pause();
            audioElementRef.current = null;
            setIsPlaying(false);
        } else {
            const audio = new Audio(recordedAudio);
            audio.onended = () => {
                setIsPlaying(false);
                audioElementRef.current = null;
            };
            audio.play();
            audioElementRef.current = audio;
            setIsPlaying(true);
        }
    }, [recordedAudio]);

    const deleteRecording = useCallback(() => {
        if (audioElementRef.current) {
            audioElementRef.current.pause();
            audioElementRef.current = null;
            setIsPlaying(false);
        }
        
        if (recordedAudio) {
            URL.revokeObjectURL(recordedAudio);
        }
        
        setRecordedAudio(null);
        setRecordedMimeType(null);
    }, [recordedAudio]);

    const getAudioFile = useCallback(async () => {
        if (!recordedAudio || !recordedMimeType) return null;
        
        try {
            const response = await fetch(recordedAudio);
            const audioBlob = await response.blob();
            return audioUtils.createAudioFile(audioBlob, recordedMimeType);
        } catch (error) {
            errorUtils.logError('Audio File Creation', error);
            return null;
        }
    }, [recordedAudio, recordedMimeType]);

    // Cleanup on unmount
    const cleanup = useCallback(() => {
        if (audioElementRef.current) {
            audioElementRef.current.pause();
        }
        if (recordedAudio) {
            URL.revokeObjectURL(recordedAudio);
        }
    }, [recordedAudio]);

    return {
        isRecording,
        recordedAudio,
        recordedMimeType,
        isPlaying,
        startRecording,
        stopRecording,
        cancelRecording,
        playRecording,
        deleteRecording,
        getAudioFile,
        cleanup,
        hasRecording: !!recordedAudio
    };
};
