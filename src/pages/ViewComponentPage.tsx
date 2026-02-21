import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import '@google/model-viewer';
import { doc, getDoc } from "firebase/firestore";
import { db } from "../api/firebase"; // adjust path
import { ArrowLeft } from "lucide-react"; // optional icon

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": any;
    }
  }
}

// Quiz type
type Quiz = {
  questionText: string;
  optAText: string;
  optBText: string;
  optCText?: string;
  correctIndex: number | null;
};

// Content type
export type Content = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  modelUrl: string;
  quizzes: Quiz[];
  AuthorId: string;
  Status: string;
  type: string;
};

// Fetch author name by UID
export const fetchUserNameByUid = async (uid: string) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data().name : "Unknown Author";
};

export const ViewComponentPage: React.FC = () => {
  const location = useLocation();
  const [modelSrc, setModelSrc] = useState<string>("");
  const navigate = useNavigate();
  const [data, setData] = useState<Content | null>(null);
  const [authorName, setAuthorName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const contentFromState = (location.state as { content?: Content })?.content;
    if (!contentFromState) {
      console.warn("No content passed, redirecting back");
      navigate("/my-content");
      return;
    }

    setData(contentFromState);

    fetchUserNameByUid(contentFromState.AuthorId)
      .then(name => setAuthorName(name))
      .finally(() => setLoading(false));
  }, [location.state, navigate]);
useEffect(() => {
  if (!data?.modelUrl) return;

  const fetchModel = async () => {
    try {
      const response = await fetch(data.modelUrl, {
        // For Google Drive, you may need to add credentials if private
        // mode: "cors" // optional
      });
      if (!response.ok) throw new Error("Failed to fetch model");

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      setModelSrc(objectUrl);
    } catch (err) {
      console.error("Error loading model:", err);
    }
  };

  fetchModel();

  // Cleanup on unmount
  return () => {
    if (modelSrc) URL.revokeObjectURL(modelSrc);
  };
}, [data?.modelUrl]);
  const handleBack = () => {
    setData(null);
    setAuthorName("");
    navigate(-1); // go back
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-8"
    >
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-10 space-y-8">

        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-blue-700 font-medium hover:text-blue-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Title & Author */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-700">{data.title}</h1>
          <p className="text-blue-900/70 text-sm">By: {authorName}</p>
        </div>

        <p className="text-blue-900/80">{data.description}</p>

        {/* Image Viewer */}
        <div className="bg-blue-50 p-4 rounded-xl shadow-inner">
          <p className="font-medium text-blue-700 mb-2">Image:</p>
          <img
            src={data.imageUrl}
            alt={data.title}
            className="mx-auto max-h-100 w-auto rounded-lg shadow-md object-contain"
          />
        </div>

        {/* 3D Model Viewer */}
        <div className="bg-blue-50 p-4 rounded-xl shadow-inner mt-4">
          <p className="font-medium text-blue-700 mb-2">3D Model:</p>
        <model-viewer
          src={modelSrc} // use the downloaded blob URL
          alt={data.title}
          auto-rotate
          camera-controls
          ar
          style={{
            width: "100%",
            height: "400px",
            borderRadius: "0.75rem",
            backgroundColor: "black",
          }}
        />

        </div>

        {/* Quizzes */}
        {data.quizzes?.length > 0 && (
          <div className="space-y-6 mt-6">
            <h2 className="text-xl font-semibold text-blue-600">Quizzes</h2>
            {data.quizzes.map((quiz, qi) => (
              <motion.div
                key={qi}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-blue-100 bg-blue-50 p-6 space-y-3 shadow-sm"
              >
                <h3 className="font-medium text-blue-700">{quiz.questionText}</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {[quiz.optAText, quiz.optBText, quiz.optCText].filter(Boolean).map((opt, oi) => (
                    <li
                      key={oi}
                      className={`${
                        quiz.correctIndex === oi
                          ? "font-semibold text-blue-800"
                          : "text-blue-900/70"
                      }`}
                    >
                      {opt}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
