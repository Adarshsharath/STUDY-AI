import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    Brain,
    Layers,
    HelpCircle,
    Network,
    CheckCircle2,
    XCircle,
    Trophy,
    Loader2,
    ArrowRight
} from 'lucide-react'
import mermaid from 'mermaid'

// Initialize Mermaid with custom beautiful theme
mermaid.initialize({
    startOnLoad: true,
    theme: 'base',
    securityLevel: 'loose',
    fontFamily: 'Inter, system-ui, sans-serif',
    themeVariables: {
        primaryColor: '#6366f1',
        primaryTextColor: '#fff',
        primaryBorderColor: '#4f46e5',
        lineColor: '#8b5cf6',
        secondaryColor: '#8b5cf6',
        tertiaryColor: '#06b6d4',
        background: '#1e1b4b',
        mainBkg: '#312e81',
        secondBkg: '#4c1d95',
        tertiaryBkg: '#164e63',
        nodeBorder: '#6366f1',
        clusterBkg: '#1e293b',
        clusterBorder: '#475569',
        titleColor: '#f8fafc',
        edgeLabelBackground: '#1e293b',
        nodeTextColor: '#f8fafc',
        fontSize: '16px'
    }
})

const StudyTools = ({ document, onClose }) => {
    const [activeTab, setActiveTab] = useState('flashcards')
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchStudyMaterial(activeTab)
    }, [activeTab])

    const fetchStudyMaterial = async (type) => {
        setLoading(true)
        setError(null)
        try {
            const response = await axios.post(`/api/documents/${document?.id}/study-tools`, { type })
            console.log('Study tools API response:', response.data)
            setData(response.data)
        } catch (err) {
            console.error('Error fetching study tools:', err)
            setError(err.response?.data?.message || 'Failed to generate study material. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-gray-950/80 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full max-w-5xl h-[85vh] glass-morphism rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-blue-600 rounded-xl flex items-center justify-center">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Study Lab</h2>
                            <p className="text-xs text-gray-400 truncate max-w-[200px]">{document?.filename || 'Document'}</p>
                        </div>
                    </div>

                    <div className="flex bg-black/20 p-1 rounded-xl border border-white/5">
                        <TabButton
                            active={activeTab === 'flashcards'}
                            onClick={() => setActiveTab('flashcards')}
                            icon={<Layers className="w-4 h-4" />}
                            label="Flashcards"
                        />
                        <TabButton
                            active={activeTab === 'quiz'}
                            onClick={() => setActiveTab('quiz')}
                            icon={<HelpCircle className="w-4 h-4" />}
                            label="Quiz"
                        />
                        <TabButton
                            active={activeTab === 'mindmap'}
                            onClick={() => setActiveTab('mindmap')}
                            icon={<Network className="w-4 h-4" />}
                            label="Mind Map"
                        />
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 relative">
                    {loading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
                            <p className="text-gray-400 animate-pulse font-medium">Generating {activeTab}...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                                <XCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <p className="text-red-400 font-medium">{error}</p>
                            <button
                                onClick={() => fetchStudyMaterial(activeTab)}
                                className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-sm font-medium border border-white/10"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            {activeTab === 'flashcards' && data && (
                                <FlashcardsView cards={data} key="flashcards" />
                            )}
                            {activeTab === 'quiz' && data && (
                                <QuizView questions={data} key="quiz" />
                            )}
                            {activeTab === 'mindmap' && data && (
                                <MindMapView structure={data} key="mindmap" />
                            )}
                        </AnimatePresence>
                    )}
                </div>
            </motion.div>
        </div>
    )
}

const TabButton = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${active
            ? 'bg-gradient-to-r from-primary-600 to-blue-600 text-white shadow-md'
            : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
    >
        {icon}
        <span className="text-sm font-medium">{label}</span>
    </button>
)

const FlashcardsView = ({ cards }) => {
    const [index, setIndex] = useState(0)

    // Validate cards data
    if (!cards || !Array.isArray(cards) || cards.length === 0) {
        return (
            <div className="h-full flex items-center justify-center">
                <p className="text-gray-400">No key points available.</p>
            </div>
        )
    }

    const handleNext = () => {
        setIndex((prev) => (prev + 1) % cards.length)
    }

    const handlePrev = () => {
        setIndex((prev) => (prev - 1 + cards.length) % cards.length)
    }

    const currentCard = cards[index]
    if (!currentCard || !currentCard.title || !currentCard.description) {
        return (
            <div className="h-full flex items-center justify-center">
                <p className="text-gray-400">Invalid card data.</p>
            </div>
        )
    }

    // Color schemes for variety
    const colorSchemes = [
        { from: 'from-blue-500/20', to: 'to-cyan-500/20', border: 'border-blue-500/30', text: 'text-blue-400', glow: 'shadow-blue-500/25' },
        { from: 'from-purple-500/20', to: 'to-pink-500/20', border: 'border-purple-500/30', text: 'text-purple-400', glow: 'shadow-purple-500/25' },
        { from: 'from-green-500/20', to: 'to-emerald-500/20', border: 'border-green-500/30', text: 'text-green-400', glow: 'shadow-green-500/25' },
        { from: 'from-orange-500/20', to: 'to-red-500/20', border: 'border-orange-500/30', text: 'text-orange-400', glow: 'shadow-orange-500/25' },
        { from: 'from-indigo-500/20', to: 'to-blue-500/20', border: 'border-indigo-500/30', text: 'text-indigo-400', glow: 'shadow-indigo-500/25' },
    ]

    const scheme = colorSchemes[index % colorSchemes.length]

    return (
        <div className="h-full flex flex-col items-center justify-center space-y-8 px-4 py-8">
            {/* Main Card */}
            <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`relative w-full max-w-2xl bg-gradient-to-br ${scheme.from} ${scheme.to} backdrop-blur-xl border ${scheme.border} rounded-3xl p-10 shadow-2xl ${scheme.glow}`}
            >
                {/* Number Badge */}
                <div className={`absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-br ${scheme.from} ${scheme.to} border ${scheme.border} flex items-center justify-center font-bold ${scheme.text} shadow-lg`}>
                    {index + 1}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${scheme.from} ${scheme.to} border ${scheme.border} flex items-center justify-center mb-6 shadow-lg`}>
                    <Layers className={`w-8 h-8 ${scheme.text}`} />
                </div>

                {/* Title */}
                <h2 className={`text-3xl font-bold ${scheme.text} mb-4 leading-tight`}>
                    {currentCard.title}
                </h2>

                {/* Description */}
                <p className="text-gray-200 text-lg leading-relaxed">
                    {currentCard.description}
                </p>

                {/* Decorative Elements */}
                <div className={`absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl ${scheme.from} ${scheme.to} rounded-tl-full opacity-10`}></div>
            </motion.div>

            {/* Navigation */}
            <div className="flex items-center space-x-8">
                <button
                    onClick={handlePrev}
                    className="group p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-white border border-white/10 hover:scale-110 active:scale-95"
                >
                    <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                </button>

                <div className="flex flex-col items-center">
                    <div className="text-gray-400 font-bold text-lg mb-2">
                        {index + 1} of {cards.length}
                    </div>
                    <div className="flex space-x-2">
                        {cards.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all ${i === index ? 'w-8 bg-primary-500' : 'w-1.5 bg-white/20'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleNext}
                    className="group p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-white border border-white/10 hover:scale-110 active:scale-95"
                >
                    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    )
}

const QuizView = ({ questions }) => {
    const [index, setIndex] = useState(0)
    const [score, setScore] = useState(0)
    const [selectedOption, setSelectedOption] = useState(null)
    const [showResult, setShowResult] = useState(false)
    const [isFinished, setIsFinished] = useState(false)

    // Validate questions data
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
        return (
            <div className="h-full flex items-center justify-center">
                <p className="text-gray-400">No quiz questions available.</p>
            </div>
        )
    }

    const handleOptionClick = (optIndex) => {
        if (showResult) return
        setSelectedOption(optIndex)
        setShowResult(true)
        if (optIndex === questions[index].correct_index) {
            setScore(score + 1)
        }
    }

    const handleNext = () => {
        if (index + 1 < questions.length) {
            setIndex(index + 1)
            setSelectedOption(null)
            setShowResult(false)
        } else {
            setIsFinished(true)
        }
    }

    if (isFinished) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center">
                    <Trophy className="w-12 h-12 text-yellow-500" />
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-white">Quiz Finished!</h3>
                    <p className="text-gray-400 text-lg mt-2">You scored {score} out of {questions.length}</p>
                </div>
                <button
                    onClick={() => {
                        setIndex(0); setScore(0); setSelectedOption(null); setShowResult(false); setIsFinished(false);
                    }}
                    className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-500/25"
                >
                    Restart Quiz
                </button>
            </div>
        )
    }

    const q = questions[index]

    return (
        <div className="max-w-2xl mx-auto h-full flex flex-col">
            <div className="mb-8">
                <div className="flex justify-between items-end mb-4">
                    <span className="text-primary-400 font-bold text-sm tracking-widest uppercase">Question {index + 1}/{questions.length}</span>
                    <span className="text-gray-500 font-medium">Score: {score}</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((index + 1) / questions.length) * 100}%` }}
                        className="h-full bg-primary-500"
                    />
                </div>
            </div>

            <h3 className="text-2xl font-bold text-white mb-8 leading-tight">{q.question}</h3>

            <div className="space-y-4 flex-1">
                {q.options.map((option, i) => {
                    let styles = "bg-white/5 border-white/10 hover:bg-white/10 text-gray-300"
                    if (showResult) {
                        if (i === q.correct_index) styles = "bg-green-500/20 border-green-500/50 text-green-300"
                        else if (i === selectedOption) styles = "bg-red-500/20 border-red-500/50 text-red-300"
                        else styles = "opacity-40 grayscale pointer-events-none"
                    }

                    return (
                        <button
                            key={i}
                            onClick={() => handleOptionClick(i)}
                            className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 flex items-center justify-between group ${styles}`}
                        >
                            <span className="font-medium">{option}</span>
                            {showResult && i === q.correct_index && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                            {showResult && i === selectedOption && i !== q.correct_index && <XCircle className="w-5 h-5 text-red-500" />}
                        </button>
                    )
                })}
            </div>

            {showResult && (
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleNext}
                    className="mt-8 w-full py-4 bg-white/10 hover:bg-primary-600 text-white font-bold rounded-2xl transition-all border border-white/5 flex items-center justify-center space-x-2"
                >
                    <span>{index + 1 === questions.length ? 'Show Results' : 'Next Question'}</span>
                    <ArrowRight className="w-5 h-5" />
                </motion.button>
            )}
        </div>
    )
}

const MindMapView = ({ structure }) => {
    const chartRef = useRef(null)
    const [renderError, setRenderError] = useState(null)
    const [isRendering, setIsRendering] = useState(true)

    // Validate structure
    if (!structure || typeof structure !== 'object' || !structure.name) {
        return (
            <div className="h-full flex items-center justify-center">
                <p className="text-gray-400">No mind map data available.</p>
            </div>
        )
    }

    useEffect(() => {
        if (structure) {
            renderMermaid()
        }
    }, [structure])

    const renderMermaid = async () => {
        if (!chartRef.current) return
        setIsRendering(true)
        setRenderError(null)

        const generateMermaidText = (node) => {
            // Clean node names to avoid mermaid syntax issues
            const cleanName = (name) => {
                if (!name) return 'Unknown'
                // Remove special characters that might break mermaid syntax
                return name.replace(/[(){}[\]"]/g, '').substring(0, 50)
            }

            let text = "mindmap\n  root((" + cleanName(node.name) + "))\n"
            const addChildren = (children, level) => {
                if (!Array.isArray(children)) return
                children.forEach(child => {
                    const indent = " ".repeat(level * 2)
                    text += indent + cleanName(child.name) + "\n"
                    if (child.children && child.children.length > 0) {
                        addChildren(child.children, level + 1)
                    }
                })
            }
            if (node.children && Array.isArray(node.children)) {
                addChildren(node.children, 2)
            }
            return text
        }

        try {
            const mermaidText = generateMermaidText(structure)
            console.log('Generated Mermaid syntax:', mermaidText)

            const { svg } = await mermaid.render('mindmap-svg-' + Date.now(), mermaidText)
            chartRef.current.innerHTML = svg
            setIsRendering(false)
        } catch (err) {
            console.error('Mermaid render error:', err)
            console.error('Structure:', structure)
            setRenderError(err.message || 'Error rendering mind map')
            setIsRendering(false)
            chartRef.current.innerHTML = `<p class="text-red-400">Error rendering mind map. ${err.message}</p>`
        }
    }

    return (
        <div className="h-full flex flex-col p-4">
            {/* Header */}
            <div className="mb-6 text-center">
                <h3 className="text-2xl font-bold text-white mb-2">Knowledge Map</h3>
                <p className="text-gray-400 text-sm">Visual overview of key concepts and relationships</p>
            </div>

            {/* Mind Map Container */}
            <div className="flex-1 overflow-auto bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-blue-900/20 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-2xl relative">
                {isRendering && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-3xl z-10">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-300 animate-pulse font-medium">Rendering mind map...</p>
                        </div>
                    </div>
                )}
                <div
                    ref={chartRef}
                    className="w-full h-full flex items-center justify-center mindmap-container"
                    style={{
                        minHeight: '500px'
                    }}
                ></div>
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-center">
                <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                    <Network className="w-4 h-4 text-primary-400" />
                    <p className="text-xs text-gray-400">
                        {renderError ? (
                            <span className="text-red-400">⚠️ Error rendering. Try refreshing.</span>
                        ) : (
                            'Scroll to explore the full knowledge structure'
                        )}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default StudyTools
