import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const Feedback = () => {
    const location=useLocation();
    const navigate=useNavigate();

    const {topic="Is AI dangerous?",feedback={}}= location.state || {};
    const handleBack=()=>navigate("/home");
  return (
    <div className="max-w-4xl mx-auto p-6 mt-10 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">🤖 AI Debate Feedback</h1>

      <div className="mb-4">
        <p className="text-lg font-semibold">🗣️ Debate Topic:</p>
        <p className="text-gray-700">{topic}</p>
      </div>

      <div className="mb-6">
        <p className="text-lg font-semibold">💡 Summary by AI:</p>
        <p className="text-gray-700">
          {feedback.summary ||
            "Both sides provided strong arguments. Proposition clearly structured their points, while Opposition delivered excellent rebuttals."}
        </p>
      </div>

      <div className="mb-6">
        <p className="text-lg font-semibold">📈 Strengths Noted by AI:</p>
        <ul className="list-disc list-inside text-gray-700">
          {(feedback.strengths || [
            "Clear structure in speech",
            "Strong use of examples",
            "Good teamwork and flow of arguments",
          ]).map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <p className="text-lg font-semibold">⚠️ Suggestions for Improvement:</p>
        <ul className="list-disc list-inside text-gray-700">
          {(feedback.improvements || [
            "More engagement with opponent's arguments",
            "Improve delivery clarity",
            "Support points with stronger data",
          ]).map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="text-center">
        <button
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={handleBack}
        >
          ⬅️ Back to Home
        </button>
      </div>
    </div>
  )
}

export default Feedback
