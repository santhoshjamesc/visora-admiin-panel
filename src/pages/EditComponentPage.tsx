import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { updateContent } from "../api/firestoreApi";
import { uploadFileStatic } from "../api/SupabaseUploader";
import { ArrowLeft } from "lucide-react";

/* ================= TYPES ================= */
type Quiz = {
  question: string;
  options: string[];
  correctAnswer: number | null;
};

/* ================= TRANSFORM ================= */
const transformComponentData = (data: any) => ({
  ...data,
  quizzes: (data.quizzes || []).map((q: any) => ({
    question: q.questionText || "",
    options: [q.optAText || "", q.optBText || "", q.optCText || ""],
    correctAnswer: q.correctIndex ?? null,
  })),
});

/* ================= COMPONENT ================= */
export const EditComponentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const passedItem = location.state?.content;

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [componentId, setComponentId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [imageUrl, setImageUrl] = useState("");
  const [modelUrl, setModelUrl] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [modelFile, setModelFile] = useState<File | null>(null);

  const [imageName, setImageName] = useState("");
  const [modelName, setModelName] = useState("");

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const loadData = async () => {
      const data = passedItem;
      if (!data) return;

      if (data.AuthorId !== user.uid) {
        alert("You are not authorized to edit this component");
        navigate("/");
        return;
      }

      const transformed = transformComponentData(data);

      setComponentId(data.id);
      setTitle(transformed.title);
      setDescription(transformed.description);
      setImageUrl(transformed.imageUrl);
      setModelUrl(transformed.modelUrl);
      setQuizzes(transformed.quizzes);
      setLoading(false);
    };

    loadData();
  }, [passedItem, navigate]);

  /* ================= QUIZ HELPERS ================= */
  const updateQuiz = (index: number, updated: Partial<Quiz>) => {
    const copy = [...quizzes];
    copy[index] = { ...copy[index], ...updated };
    setQuizzes(copy);
  };

  const updateOption = (qi: number, oi: number, value: string) => {
    const copy = [...quizzes];
    copy[qi].options[oi] = value;
    setQuizzes(copy);
  };

  const addQuiz = () => {
    setQuizzes([...quizzes, { question: "", options: ["", "", ""], correctAnswer: null }]);
  };

  const removeQuiz = (index: number) => {
    setQuizzes(quizzes.filter((_, i) => i !== index));
  };

    const handleBack = () => {
      setComponentId("");
      setTitle("");
      setDescription("");
      setImageUrl("");
      setModelUrl("");
      setQuizzes([]);
      navigate(-1); // go back
  };
  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    setSubmitLoading(true);

    try {
      let finalImageUrl = imageUrl;
      let finalModelUrl = modelUrl;

      if (imageFile) {
        finalImageUrl = await new Promise<string>((resolve) => {
          uploadFileStatic(imageFile, "IMG", (url) => resolve(url || ""));
        });
      }

      if (modelFile) {
        finalModelUrl = await new Promise<string>((resolve) => {
          uploadFileStatic(modelFile, "3D", (url) => resolve(url || ""));
        });
      }

      const transformedQuizzes = quizzes.map((q) => ({
        questionText: q.question,
        optAText: q.options[0],
        optBText: q.options[1],
        optCText: q.options[2],
        correctIndex: q.correctAnswer ?? 0,
      }));

      await updateContent(componentId, {
        title,
        description,
        imageUrl: finalImageUrl,
        modelUrl: finalModelUrl,
        quizzes: transformedQuizzes,
      });

      alert("Component updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update component");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <p className="text-center p-6">Loading...</p>;

  /* ================= PREVIEWS ================= */
  const imagePreview = imageFile ? URL.createObjectURL(imageFile) : imageUrl;
  const modelPreview = modelFile ? URL.createObjectURL(modelFile) : modelUrl;

  const inputClass =
    "w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none";

  return (
    <motion.div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-8">
      <motion.div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-10 space-y-10">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-blue-700 font-medium hover:text-blue-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <h1 className="text-3xl font-bold text-blue-700">Edit Component</h1>

        {/* BASIC FIELDS */}
        <div className="space-y-4">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className={inputClass} />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className={inputClass} />

          {/* IMAGE UPLOAD */}
          <div className="border-2 border-dashed rounded-xl p-4 space-y-3 text-center relative cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setImageFile(e.target.files[0]);
                  setImageName(e.target.files[0].name);
                }
              }}
            />
            <p className="font-medium text-blue-600">
              {imageName || "Click to replace image"}
            </p>

            {imagePreview && (
              <img
                src={imagePreview}
                alt={title}
                    className="mx-auto max-h-56 w-auto rounded-lg shadow-md object-contain"
              />
            )}
          </div>

          {/* MODEL UPLOAD */}
          <div className="border-2 border-dashed rounded-xl p-4 space-y-3 text-center relative cursor-pointer">
            <input
              type="file"
              accept=".glb,.gltf,.fbx,.obj"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setModelFile(e.target.files[0]);
                  setModelName(e.target.files[0].name);
                }
              }}
            />
            <p className="font-medium text-green-600">
              {modelName || "Click to replace 3D model"}
            </p>

            {modelPreview && (
              <model-viewer
                src={modelPreview}
                auto-rotate
                camera-controls
                ar
                style={{
                  width: "100%",
                  height: "300px",
                  borderRadius: "0.75rem",
                  backgroundColor: "#333333ff",
                }}
              />
            )}
          </div>
        </div>

        {/* QUIZZES */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-blue-600">Quizzes</h2>

          <AnimatePresence>
            {quizzes.map((quiz, qi) => (
              <motion.div key={qi} className="border rounded-xl p-4 space-y-3">
                <input value={quiz.question} onChange={(e) => updateQuiz(qi, { question: e.target.value })} placeholder="Question" className={inputClass} />
                {quiz.options.map((opt, oi) => (
                  <input key={oi} value={opt} onChange={(e) => updateOption(qi, oi, e.target.value)} placeholder={`Option ${oi + 1}`} className={inputClass} />
                ))}
                <select value={quiz.correctAnswer ?? ""} onChange={(e) => updateQuiz(qi, { correctAnswer: Number(e.target.value) })} className={inputClass}>
                  <option value="">Select correct</option>
                  {[0, 1, 2].map((i) => (
                    <option key={i} value={i}>Option {i + 1}</option>
                  ))}
                </select>

                {quizzes.length > 1 && (
                  <button onClick={() => removeQuiz(qi)} className="text-red-500 text-sm">
                    Remove Quiz
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          <button onClick={addQuiz} className="w-full border-dashed border-2 rounded-xl py-3">
            + Add Quiz
          </button>
        </div>

        {/* SAVE BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={submitLoading}
          className="w-full bg-blue-600 text-white rounded-xl py-4 flex justify-center items-center"
        >
          {submitLoading && (
            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
          )}
          {submitLoading ? "Saving..." : "Save Changes"}
        </button>
      </motion.div>
    </motion.div>
  );
};
