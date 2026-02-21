import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addContent } from "../api/firestoreApi"; // your Firestore API
import { uploadFileStatic } from "../api/SupabaseUploader"; // your Supabase uploader
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ================= TYPES ================= */
type QuizForm = {
  question: string;
  options: [string, string, string];
  correctAnswer: number | null;
};

/* ================= COMPONENT ================= */
export const AddComponentPage: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [modelFile, setModelFile] = useState<File | null>(null);

  const [imageUrl, setImageUrl] = useState("");
  const [modelUrl, setModelUrl] = useState("");
  const navigate = useNavigate();

  const [imageName, setImageName] = useState("");
  const [modelName, setModelName] = useState("");

  const [quizzes, setQuizzes] = useState<QuizForm[]>([
    { question: "", options: ["", "", ""], correctAnswer: null },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState(false);

  /* ================= QUIZ HELPERS ================= */
  const updateQuiz = (index: number, updated: Partial<QuizForm>) => {
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
    setQuizzes([
      ...quizzes,
      { question: "", options: ["", "", ""], correctAnswer: null },
    ]);
  };

  const removeQuiz = (index: number) => {
    setQuizzes(quizzes.filter((_, i) => i !== index));
  };

  /* ================= VALIDATION ================= */
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!imageFile) newErrors.imageFile = "Image file required";
    if (!modelFile) newErrors.modelFile = "3D model file required";

    quizzes.forEach((q, i) => {
      if (!q.question.trim())
        newErrors[`quiz-${i}-question`] = "Question is required";

      q.options.forEach((o, oi) => {
        if (!o.trim())
          newErrors[`quiz-${i}-option-${oi}`] = "Option is required";
      });

      if (q.correctAnswer === null)
        newErrors[`quiz-${i}-correct`] = "Select correct answer";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleBack = () => {
  
    navigate(-1); // go back
  };
  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!validate()) return;

    const userStr = localStorage.getItem("user");
    if (!userStr) {
      alert("User not logged in");
      return;
    }

    setSubmitLoading(true);
    const user = JSON.parse(userStr);

    try {
      // 1️⃣ Upload files to Supabase
      let uploadedImageUrl = "";
      let uploadedModelUrl = "";

      if (imageFile) {
        uploadedImageUrl = await new Promise<string>((resolve) => {
          uploadFileStatic(imageFile, "IMG", (url) => resolve(url || ""));
        });
      }

      if (modelFile) {
        uploadedModelUrl = await new Promise<string>((resolve) => {
          uploadFileStatic(modelFile, "3D", (url) => resolve(url || ""));
        });
      }

      setImageUrl(uploadedImageUrl);
      setModelUrl(uploadedModelUrl);

      // 2️⃣ Transform quizzes
      const transformedQuizzes = quizzes.map((q) => ({
        questionText: q.question.trim(),
        optAText: q.options[0].trim(),
        optBText: q.options[1].trim(),
        optCText: q.options[2].trim(),
        correctIndex: q.correctAnswer ?? 0,
      }));

      // 3️⃣ Upload to Firestore
      const payload = {
        title: title.trim(),
        description: description.trim(),
        imageUrl: uploadedImageUrl,
        modelUrl: uploadedModelUrl,
        quizzes: transformedQuizzes,
        AuthorId: user.uid,
      };

      await addContent(payload);
      alert("Component added successfully!");

      // reset form
      setTitle("");
      setDescription("");
      setImageFile(null);
      setModelFile(null);
      setImageUrl("");
      setModelUrl("");
      setImageName("");
      setModelName("");
      setQuizzes([{ question: "", options: ["", "", ""], correctAnswer: null }]);
      setErrors({});
    } catch (err) {
      console.error(err);
      alert("Failed to add component");
    } finally {
      setSubmitLoading(false);
    }
  };

  /* ================= UI ================= */
  const inputClass =
    "w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none transition";

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
        <h1 className="text-3xl font-bold text-blue-700">Add Component</h1>

        {/* BASIC FIELDS */}
        <div className="space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className={inputClass}
          />
          {errors.title && <p className="text-red-500">{errors.title}</p>}

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className={inputClass}
          />
          {errors.description && <p className="text-red-500">{errors.description}</p>}

          {/* Image Upload */}
          <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 flex flex-col items-center justify-center hover:border-blue-500 transition cursor-pointer relative">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setImageFile(e.target.files[0]);
                  setImageName(e.target.files[0].name);
                }
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <p className="text-blue-600 font-medium mb-2">
              {imageFile ? "Ready to upload" : "Click or drag image to upload"}
            </p>
            {imageName && <p className="text-gray-700 text-sm truncate">{imageName}</p>}
            {errors.imageFile && <p className="text-red-500 mt-2">{errors.imageFile}</p>}
          </div>

          {/* Model Upload */}
          <div className="border-2 border-dashed border-green-300 rounded-xl p-6 flex flex-col items-center justify-center hover:border-green-500 transition cursor-pointer relative">
            <input
              type="file"
              accept=".glb,.gltf,.fbx,.obj"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setModelFile(e.target.files[0]);
                  setModelName(e.target.files[0].name);
                }
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <p className="text-green-600 font-medium mb-2">
              {modelFile ? "Ready to upload" : "Click or drag 3D model to upload"}
            </p>
            {modelName && <p className="text-gray-700 text-sm truncate">{modelName}</p>}
            {errors.modelFile && <p className="text-red-500 mt-2">{errors.modelFile}</p>}
          </div>
        </div>

        {/* QUIZZES */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-blue-600">Quizzes</h2>

          <AnimatePresence>
            {quizzes.map((quiz, qi) => (
              <motion.div
                key={qi}
                className="rounded-2xl border bg-blue-50 p-6 space-y-4"
              >
                <input
                  value={quiz.question}
                  onChange={(e) =>
                    updateQuiz(qi, { question: e.target.value })
                  }
                  placeholder="Question"
                  className={inputClass}
                />

                {quiz.options.map((opt, oi) => (
                  <input
                    key={oi}
                    value={opt}
                    onChange={(e) => updateOption(qi, oi, e.target.value)}
                    placeholder={`Option ${oi + 1}`}
                    className={inputClass}
                  />
                ))}

                <select
                  value={quiz.correctAnswer ?? ""}
                  onChange={(e) =>
                    updateQuiz(qi, {
                      correctAnswer:
                        e.target.value === ""
                          ? null
                          : Number(e.target.value),
                    })
                  }
                  className={inputClass}
                >
                  <option value="">Select correct answer</option>
                  {[0, 1, 2].map((i) => (
                    <option key={i} value={i}>
                      Option {i + 1}
                    </option>
                  ))}
                </select>

                {quizzes.length > 1 && (
                  <button
                    onClick={() => removeQuiz(qi)}
                    className="text-red-500 text-sm"
                  >
                    Remove Quiz
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          <button
            onClick={addQuiz}
            className="w-full border-dashed border-2 rounded-xl py-3 text-blue-600"
          >
            + Add Quiz
          </button>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white rounded-xl py-4 text-lg font-semibold flex items-center justify-center"
          disabled={submitLoading}
        >
          {submitLoading && (
            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
          )}
          {submitLoading ? "Adding..." : "Add Component"}
        </button>
      </motion.div>
    </motion.div>
  );
};
