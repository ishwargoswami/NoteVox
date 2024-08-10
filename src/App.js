import "./App.css";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import useClipboard from "react-use-clipboard";
import { useState, useEffect } from "react";
import { FaDownload, FaAdjust } from "react-icons/fa";
import nlp from 'compromise';

const App = () => {
    const [textToCopy, setTextToCopy] = useState('');
    const [isCopied, setCopied] = useClipboard(textToCopy, { successDuration: 1000 });
    const [language, setLanguage] = useState('en-IN');
    const [theme, setTheme] = useState('light');
    const [micAccess, setMicAccess] = useState(null);
    const [notes, setNotes] = useState([]);
    const { transcript, browserSupportsSpeechRecognition, resetTranscript, listening } = useSpeechRecognition();

    useEffect(() => {
        if (listening) {
            setMicAccess(true);
        } else if (micAccess === null) {
            setMicAccess(false);
        }
    }, [listening, micAccess]);

    useEffect(() => {
        localStorage.setItem('transcript', transcript);
    }, [transcript]);

    const startListening = () => SpeechRecognition.startListening({ continuous: true, language });
    const pauseListening = () => SpeechRecognition.stopListening();

    const downloadTranscript = () => {
        const element = document.createElement("a");
        const file = new Blob([transcript], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = "transcript.txt";
        document.body.appendChild(element);
        element.click();
    };

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
        document.body.classList.toggle('dark-theme');
    };


    const executeCommand = () => {
        const words = transcript.trim().split(' ');
        const command = words[words.length - 1].toLowerCase();
        switch (command) {
            case 'copy':
                setCopied();
                break;
            case 'clear':
                resetTranscript();
                break;
            case 'download':
                downloadTranscript();
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        executeCommand();
    }, [transcript]);

    if (!browserSupportsSpeechRecognition) {
        return <p>Your browser does not support speech recognition.</p>;
    }

    return (
        <div className={`container ${theme}`}>
            <div className="top-right-buttons">
                <button onClick={downloadTranscript} className="icon-button">
                    <FaDownload />
                </button>
                <button onClick={toggleTheme} className="icon-button">
                    <FaAdjust />
                </button>
            </div>
            <h2>NoteVox</h2>
            <p>A React hook that converts speech from the microphone to text and makes it available to your React components.</p>

            <div>
                <label htmlFor="language">Select Language: </label>
                <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)}>
                    <option value="en-IN">English (India)</option>
                    <option value="en-US">English (US)</option>
                    <option value="fr-FR">French</option>
                    <option value="de-DE">German</option>
                    <option value="es-ES">Spanish</option>
                </select>
            </div>

            <div className={`main-content ${listening ? 'listening' : ''}`} onClick={() => setTextToCopy(transcript)}>
                {transcript}
            </div>

            <div className="btn-style">
                <button onClick={() => textToCopy && setCopied()}>
                    {isCopied ? 'Copied!' : 'Copy to clipboard'}
                </button>
                <button onClick={startListening}>Start Listening</button>
                <button onClick={pauseListening}>Pause Listening</button>
                <button onClick={resetTranscript}>Clear</button>
            </div>

            <div className="counter-container">
                <p>Character Count: {transcript.length}</p>
                {micAccess === false && <p>Microphone access denied. Please allow microphone access in your browser settings.</p>}
            </div>

            {listening && <div className="listening-indicator">Listening...</div>}

        </div>
    );
};

export default App;
