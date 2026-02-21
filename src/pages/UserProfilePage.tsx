import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Card } from "../components/Card";
import { type Content } from "../api/firestoreApi";
import { ArrowLeft } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: { seconds: number; nanoseconds: number };
  contents: Content[];
}

// Function to generate avatar initials
const getAvatarInitials = (name: string) => {
  const parts = name.split(" ");
  const initials = parts
    .map(part => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return initials;
};

// Function to generate random gradient for avatar
const getAvatarGradient = (name: string) => {
  const colors = ["#3b82f6", "#8b5cf6", "#f97316", "#14b8a6", "#e11d48"];
  const index = name.charCodeAt(0) % colors.length;
  const nextIndex = (index + 1) % colors.length;
  return `linear-gradient(135deg, ${colors[index]}, ${colors[nextIndex]})`;
};

export const UserProfilePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state as User | undefined;

  if (!user)
    return (
      <p className="p-6 text-center text-red-500">No user data provided.</p>
    );

  const joinedDate = user.createdAt
    ? new Date(user.createdAt.seconds * 1000)
    : null;

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4 md:p-6">
      {/* BACK BUTTON */}
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-700 font-medium hover:text-blue-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

      {/* USER INFO */}
      <div className="flex items-center space-x-6 bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold"
          style={{ background: getAvatarGradient(user.name) }}
        >
          {getAvatarInitials(user.name)}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
          <p className="text-gray-500">{user.email}</p>
          <p className="text-gray-600 mt-1">
            <span className="font-semibold">Joined:</span>{" "}
            {joinedDate ? format(joinedDate, "PPP") : "-"}
          </p>
          <p className="text-gray-600 mt-1">
            <span className="font-semibold">Content:</span> {user.contents.length}
          </p>
        </div>
      </div>

      {/* USER CONTENT */}
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Contents</h2>
      {user.contents.length === 0 ? (
        <p className="text-gray-500">This user has not authored any content.</p>
      ) : (
        <div className="grid  gap-4">
          {user.contents.map(item => (
            <Card
              key={item.id}
              name={item.title}
              Status={item.Status}
              contentImg={item.imageUrl}
              onView={() =>
                navigate("/view-component", { state: { content: item } })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};
