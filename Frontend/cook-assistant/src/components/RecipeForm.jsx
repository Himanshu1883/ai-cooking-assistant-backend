
import React, { useState, useRef, useEffect } from "react";

import axios from "axios";



const RecipeForm = () => {

    const [ingredients, setIngredients] = useState("");

    const [recipe, setRecipe] = useState("");

    const [loading, setLoading] = useState(false);



    // Speech synthesis controls

    const utteranceRef = useRef(null);

    const [isSpeaking, setIsSpeaking] = useState(false);

    const [isPaused, setIsPaused] = useState(false);

    const [volume, setVolume] = useState(1);

    const [rate, setRate] = useState(1);

    const [pitch, setPitch] = useState(1);

    const [voices, setVoices] = useState([]);

    const [selectedVoice, setSelectedVoice] = useState(null);



    const [panelOpen, setPanelOpen] = useState(false);

    const commandRecognitionRef = useRef(null);



    const cleanText = (text) => {

        if (!text) return "";

        let cleaned = text.replace(/[#*~`_<>\\]/g, "");

        cleaned = cleaned.replace(/\s+/g, " ").trim();

        cleaned = cleaned.replace(/[^\w\s.,?!-]/g, "");

        return cleaned;

    };



    const speakText = (text) => {

        if (!text) return;



        window.speechSynthesis.cancel();

        const cleanedText = cleanText(text);

        const utterance = new SpeechSynthesisUtterance(cleanedText);

        utterance.lang = "en-US";

        utterance.volume = volume;

        utterance.rate = rate;

        utterance.pitch = pitch;

        utterance.voice = selectedVoice;



        utterance.onstart = () => {

            setIsSpeaking(true);

            setIsPaused(false);

        };



        utterance.onend = () => {

            setIsSpeaking(false);

            setIsPaused(false);

            utteranceRef.current = null;

        };



        utterance.onerror = () => {

            setIsSpeaking(false);

            setIsPaused(false);

            utteranceRef.current = null;

        };



        utteranceRef.current = utterance;

        window.speechSynthesis.speak(utterance);

    };



    const pauseSpeech = () => {

        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {

            window.speechSynthesis.pause();

            setIsPaused(true);

            setIsSpeaking(false);

        }

    };



    const resumeSpeech = () => {

        if (window.speechSynthesis.paused) {

            window.speechSynthesis.resume();

            setIsPaused(false);

            setIsSpeaking(true);

        }

    };



    const stopSpeech = () => {

        window.speechSynthesis.cancel();

        setIsSpeaking(false);

        setIsPaused(false);

        utteranceRef.current = null;

    };



    const handleVoiceInput = () => {

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {

            alert("Speech Recognition not supported in this browser.");

            return;

        }



        const recognition = new SpeechRecognition();

        recognition.lang = "en-US";

        recognition.interimResults = false;

        recognition.maxAlternatives = 1;



        recognition.onresult = (event) => {

            const transcript = event.results[0][0].transcript;

            setIngredients(transcript);

        };



        recognition.onerror = (event) => {

            console.error("Speech recognition error", event.error);

        };



        recognition.start();

    };



    const startCommandRecognition = () => {

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {

            console.warn("Speech Recognition not supported for commands.");

            return;

        }



        if (commandRecognitionRef.current) {

            commandRecognitionRef.current.stop();

            commandRecognitionRef.current = null;

        }



        const recognition = new SpeechRecognition();

        recognition.lang = "en-US";

        recognition.interimResults = false;

        recognition.continuous = true;



        recognition.onresult = (event) => {

            const lastResult = event.results[event.results.length - 1];

            if (!lastResult.isFinal) return;



            const command = lastResult[0].transcript.trim().toLowerCase();

            console.log("Voice command detected:", command);



            if (command.includes("stop")) {

                stopSpeech();

            } else if (command.includes("continue") || command.includes("resume")) {

                resumeSpeech();

            }

        };



        recognition.onerror = (event) => {

            console.error("Command recognition error:", event.error);

        };



        recognition.onend = () => {

            if (commandRecognitionRef.current) {

                recognition.start();

            }

        };



        recognition.start();

        commandRecognitionRef.current = recognition;

    };



    useEffect(() => {

        return () => {

            if (commandRecognitionRef.current) {

                commandRecognitionRef.current.stop();

                commandRecognitionRef.current = null;

            }

            stopSpeech();

        };

    }, []);



    useEffect(() => {

        if (recipe) {

            speakText(recipe);

            startCommandRecognition();

        }

    }, [recipe]);



    useEffect(() => {

        const loadVoices = () => {

            let allVoices = window.speechSynthesis.getVoices();

            let englishVoices = allVoices.filter((v) => v.lang.startsWith("en"));

            setVoices(englishVoices);



            const savedVoiceName = localStorage.getItem("preferredVoice");

            const matchedVoice = englishVoices.find(v => v.name === savedVoiceName);



            if (matchedVoice) {

                setSelectedVoice(matchedVoice);

            } else if (englishVoices.length > 0) {

                setSelectedVoice(englishVoices[0]);

            }

        };



        if (typeof window !== "undefined") {

            if (speechSynthesis.onvoiceschanged !== undefined) {

                speechSynthesis.onvoiceschanged = loadVoices;

            }

            loadVoices();

        }

    }, []);



    useEffect(() => {

        if (selectedVoice) {

            localStorage.setItem("preferredVoice", selectedVoice.name);

        }

    }, [selectedVoice]);



    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);

        setRecipe("");

        stopSpeech();



        try {

            const response = await axios.post("http://127.0.0.1:8000/api/generate_recipe/", {

                ingredients,

            });

            setRecipe(response.data.recipe);

        } catch (error) {

            setRecipe("Error: " + (error.response?.data?.error || "Something went wrong"));

        }

        setLoading(false);

    };



    return (

        <>

            <div className="container mt-5">

                <h2 className="mb-4">🍳 AI Cooking Assistant</h2>

                <form onSubmit={handleSubmit}>

                    <div className="mb-3">

                        <label htmlFor="ingredients" className="form-label">

                            Enter Ingredients (comma-separated)

                        </label>

                        <div className="d-flex gap-2">

                            <input

                                type="text"

                                className="form-control"

                                id="ingredients"

                                value={ingredients}

                                onChange={(e) => setIngredients(e.target.value)}

                                placeholder="e.g. chicken, garlic, lemon"

                                required

                            />

                            <button type="button" className="btn btn-secondary" onClick={handleVoiceInput}>

                                🎤 Speak

                            </button>

                        </div>

                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>

                        {loading ? "Generating..." : "Get Recipe"}

                    </button>

                </form>



                {recipe && (

                    <div className="mt-4">

                        <h4>🍲 Generated Recipe:</h4>

                        <pre style={{ whiteSpace: "pre-wrap" }}>{recipe}</pre>

                    </div>

                )}

            </div>



            {/* Floating controls panel */}

            <div

                style={{

                    position: "fixed",

                    top: "50%",

                    right: panelOpen ? "10px" : "-240px",

                    transform: "translateY(-50%)",

                    width: "230px",

                    background: "#fff",

                    border: "1px solid #ccc",

                    borderRadius: "8px 0 0 8px",

                    boxShadow: "0 0 8px rgba(0,0,0,0.15)",

                    padding: "12px",

                    transition: "right 0.3s ease-in-out",

                    zIndex: 1000,

                }}

            >

                <button

                    onClick={() => setPanelOpen(!panelOpen)}

                    style={{

                        position: "absolute",

                        left: "-30px",

                        top: "50%",

                        transform: "translateY(-50%)",

                        background: "#007bff",

                        color: "#fff",

                        border: "none",

                        borderRadius: "4px",

                        padding: "5px 6px",

                        cursor: "pointer",

                    }}

                >

                    {panelOpen ? "⏴" : "⏵"}

                </button>



                {panelOpen && (

                    <>

                        <div className="mb-2">

                            <label className="form-label">Select Voice</label>

                            <select

                                className="form-select"

                                value={selectedVoice?.name || ""}

                                onChange={(e) => {

                                    const voice = voices.find((v) => v.name === e.target.value);

                                    setSelectedVoice(voice);

                                }}

                            >

                                {voices.map((voice, index) => (

                                    <option key={index} value={voice.name}>

                                        {voice.name} ({voice.lang})

                                    </option>

                                ))}

                            </select>

                        </div>

                        <div className="mb-2">

                            <label>Volume</label>

                            <input type="range" min="0" max="1" step="0.1" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} />

                        </div>

                        <div className="mb-2">

                            <label>Rate</label>

                            <input type="range" min="0.5" max="2" step="0.1" value={rate} onChange={(e) => setRate(parseFloat(e.target.value))} />

                        </div>

                        <div className="mb-2">

                            <label>Pitch</label>

                            <input type="range" min="0" max="2" step="0.1" value={pitch} onChange={(e) => setPitch(parseFloat(e.target.value))} />

                        </div>

                        <div className="d-flex gap-2 mt-2">

                            <button className="btn btn-warning btn-sm" onClick={pauseSpeech}>Pause</button>

                            <button className="btn btn-success btn-sm" onClick={resumeSpeech}>Resume</button>

                            <button className="btn btn-danger btn-sm" onClick={stopSpeech}>Stop</button>

                        </div>

                    </>

                )}

            </div>

        </>

    );

};



export default RecipeForm;