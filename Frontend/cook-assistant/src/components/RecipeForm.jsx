import React, { useState, useRef, useEffect } from "react";

const RecipeForm = () => {
    const [ingredients, setIngredients] = useState("");
    const [recipe, setRecipe] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [panelOpen, setPanelOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const utteranceRef = useRef(null);

    // 🎤 Voice input
    const handleVoiceInput = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech Recognition not supported");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "en-IN";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        setIsListening(true);

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setIngredients(transcript);
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    // 🔈 Speak cleaned recipe
    const speakText = (text) => {
        const cleanText = text.replace(/[#*~`^+=@{}[\]\\|<>]/g, ""); // Remove symbols
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = "en-IN";
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;
        utterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
        };
        window.speechSynthesis.cancel(); // Stop any previous
        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
        setIsPaused(false);
    };

    const pauseSpeech = () => {
        window.speechSynthesis.pause();
        setIsPaused(true);
    };

    const resumeSpeech = () => {
        window.speechSynthesis.resume();
        setIsPaused(false);
    };

    const stopSpeech = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
        utteranceRef.current = null;
    };

    // 🧠 Voice commands for stop/resume
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.lang = "en-IN";
        recognition.continuous = true;
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const lastResult = event.results[event.results.length - 1];
            if (!lastResult.isFinal) return;
            const command = lastResult[0].transcript.trim().toLowerCase();
            console.log("Voice command:", command);
            if (command.includes("stop")) {
                pauseSpeech();
            } else if (command.includes("continue") || command.includes("resume")) {
                resumeSpeech();
            }
        };

        recognition.start();

        return () => recognition.stop();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setRecipe("");
        stopSpeech();

        try {
            // Simulating API call - replace with your actual axios call
            await new Promise(resolve => setTimeout(resolve, 2000));
            const generated = `Here's a delicious recipe using ${ingredients}:\n\nIngredients:\n${ingredients.split(',').map(ing => `- ${ing.trim()}`).join('\n')}\n- Salt and pepper to taste\n- Olive oil\n\nInstructions:\n1. Prepare all ingredients\n2. Heat oil in a pan\n3. Cook ingredients until tender\n4. Season and serve hot\n\nEnjoy your meal!`;
            setRecipe(generated);
            speakText(generated);
        } catch (error) {
            const errorMsg = "Error: " + (error.response?.data?.error || "Something went wrong");
            setRecipe(errorMsg);
            speakText(errorMsg);
        }

        setLoading(false);
    };

    return (
        <>
            {/* Bootstrap CSS */}
            <link 
                href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.1.3/css/bootstrap.min.css" 
                rel="stylesheet" 
            />
            
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
                                style={{
                                    boxShadow: ingredients ? "0 0 0 0.2rem rgba(13, 110, 253, 0.25)" : "none"
                                }}
                            />
                            <button 
                                type="button" 
                                className={`btn ${isListening ? 'btn-danger' : 'btn-secondary'}`}
                                onClick={handleVoiceInput}
                                disabled={isListening}
                            >
                                {isListening ? "🎙️ Listening..." : "🎤 Speak"}
                            </button>
                        </div>
                        {isListening && (
                            <small className="text-muted mt-1 d-block">
                                <em>Listening for your ingredients...</em>
                            </small>
                        )}
                    </div>
                    <button 
                        type="submit" 
                        className="btn btn-primary position-relative" 
                        disabled={loading}
                        style={{
                            minWidth: "150px"
                        }}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Generating...
                            </>
                        ) : (
                            "Get Recipe"
                        )}
                    </button>
                </form>

                {recipe && (
                    <div className="mt-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h4>🍲 Generated Recipe:</h4>
                            <div className="btn-group" role="group">
                                <button
                                    type="button"
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => speakText(recipe)}
                                    disabled={isSpeaking}
                                >
                                    🔊 Read Aloud
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-success btn-sm"
                                    onClick={() => navigator.clipboard.writeText(recipe)}
                                >
                                    📋 Copy
                                </button>
                            </div>
                        </div>
                        <div 
                            className="p-3 border rounded bg-light"
                            style={{
                                maxHeight: "400px",
                                overflowY: "auto"
                            }}
                        >
                            <pre style={{ 
                                whiteSpace: "pre-wrap", 
                                fontFamily: "inherit",
                                margin: 0
                            }}>
                                {recipe}
                            </pre>
                        </div>
                    </div>
                )}

                {/* 🧭 Floating speech panel */}
                <div
                    style={{
                        position: "fixed",
                        top: "50%",
                        right: panelOpen ? "0px" : "-280px",
                        transform: "translateY(-50%)",
                        width: "280px",
                        background: "#ffffff",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                        padding: "20px",
                        borderRadius: "15px 0 0 15px",
                        transition: "right 0.3s ease-in-out",
                        zIndex: 1000,
                        border: "1px solid #dee2e6"
                    }}
                >
                    <button
                        onClick={() => setPanelOpen(!panelOpen)}
                        className="btn btn-primary"
                        style={{
                            position: "absolute",
                            left: "-40px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            borderRadius: "10px 0 0 10px",
                            width: "40px",
                            height: "60px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "18px"
                        }}
                        title="Toggle Panel"
                    >
                        {panelOpen ? "→" : "←"}
                    </button>
                    
                    <h6 className="mb-3 text-center">🔊 Speech Controls</h6>
                    
                    <div className="mb-3 text-center">
                        <small className="text-muted">
                            Status: <strong>
                                {isSpeaking ? (isPaused ? "Paused" : "Speaking") : "Stopped"}
                            </strong>
                        </small>
                    </div>
                    
                    <div className="d-grid gap-2">
                        <button 
                            className="btn btn-success btn-sm" 
                            onClick={resumeSpeech} 
                            disabled={!isPaused}
                        >
                            ▶ Resume
                        </button>
                        <button 
                            className="btn btn-warning btn-sm" 
                            onClick={pauseSpeech} 
                            disabled={!isSpeaking || isPaused}
                        >
                            ⏸ Pause
                        </button>
                        <button 
                            className="btn btn-danger btn-sm" 
                            onClick={stopSpeech}
                        >
                            ⏹ Stop
                        </button>
                    </div>
                    
                    <div className="mt-3 p-2 bg-light rounded">
                        <small className="text-muted">
                            💡 <strong>Voice Commands:</strong><br/>
                            Say "stop" to pause or "resume" to continue
                        </small>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RecipeForm;