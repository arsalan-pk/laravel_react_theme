import { useState, useRef, useCallback } from 'react';
import { SPEECH_RECOGNITION_CONFIG, MESSAGES } from '../constants';
import { audioUtils, errorUtils } from '../utils';

export const useSpeechRecognition = () => {
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcribedText, setTranscribedText] = useState('');
    const recognitionRef = useRef(null);

    const startRecognition = useCallback((onTranscript, onError) => {
        if (!audioUtils.supportsSpeechRecognition()) {
            onError?.(MESSAGES.ERRORS.SPEECH_UNAVAILABLE);
            return false;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        // Configure recognition
        recognition.continuous = SPEECH_RECOGNITION_CONFIG.CONTINUOUS;
        recognition.interimResults = SPEECH_RECOGNITION_CONFIG.INTERIM_RESULTS;
        recognition.lang = SPEECH_RECOGNITION_CONFIG.PRIMARY_LANGUAGE;
        
        let currentLangIndex = 0;
        const { FALLBACK_LANGUAGES } = SPEECH_RECOGNITION_CONFIG;

        recognition.onstart = () => {
            setIsTranscribing(true);
            console.log('Speech recognition started');
        };

        recognition.onresult = (event) => {
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                }
            }

            if (finalTranscript) {
                const newText = finalTranscript.trim();
                setTranscribedText(prev => prev + (prev ? ' ' : '') + newText);
                onTranscript?.(newText);
            }
        };

        recognition.onerror = (event) => {
            errorUtils.logError('SpeechRecognition', event.error);
            
            // Try fallback language if current one fails
            if (event.error === 'language-not-supported' && currentLangIndex < FALLBACK_LANGUAGES.length) {
                recognition.lang = FALLBACK_LANGUAGES[currentLangIndex];
                currentLangIndex++;
                console.log(`Trying fallback language: ${recognition.lang}`);
                try {
                    recognition.start();
                    return;
                } catch (restartError) {
                    errorUtils.logError('SpeechRecognition Restart', restartError);
                }
            }
            
            setIsTranscribing(false);
            if (event.error !== 'aborted') {
                onError?.(MESSAGES.ERRORS.SPEECH_RECOGNITION);
            }
        };

        recognition.onend = () => {
            setIsTranscribing(false);
            console.log('Speech recognition ended');
        };

        try {
            recognition.start();
            recognitionRef.current = recognition;
            return true;
        } catch (error) {
            errorUtils.logError('SpeechRecognition Start', error);
            onError?.(MESSAGES.ERRORS.SPEECH_UNAVAILABLE);
            return false;
        }
    }, []);

    const stopRecognition = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setIsTranscribing(false);
    }, []);

    const abortRecognition = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.abort();
            recognitionRef.current = null;
        }
        setIsTranscribing(false);
        setTranscribedText('');
    }, []);

    return {
        isTranscribing,
        transcribedText,
        startRecognition,
        stopRecognition,
        abortRecognition,
        clearTranscript: () => setTranscribedText(''),
        isSupported: audioUtils.supportsSpeechRecognition()
    };
};
