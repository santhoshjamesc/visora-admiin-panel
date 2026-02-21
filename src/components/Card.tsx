import React, { useState } from 'react';
import { updateStatus } from '../api/firestoreApi';

interface UserCardProps {
  id: string;
  name: string;
  userImg?: string;
  contentImg?: string;
  type: "user" | "content";
  Status: "active" | "inactive";
  onView?: () => void;
  onEdit?: () => void; // 👈 optional
  onDelete?: () => void;
}

export const Card: React.FC<UserCardProps> = ({
  id,
  name,
  type,
  userImg,
  contentImg,
  Status,
  onView,
  onEdit,
  onDelete,
}) => {
  const [active, setActive] = useState(Status === "active");
  const changeStatus = () => {
    updateStatus(type, id, active ? "inactive" : "active");
    setActive(!active);
  };

  return (
    <div
      className={`rounded-2xl border w-full p-4 transition-all ${
        active
          ? 'bg-white border-gray-100'
          : 'bg-gray-100 border-gray-200 grayscale'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Image */}
        <div className="w-16 h-16 flex-shrink-0">
          {(contentImg || userImg) && (
            <img
              src={contentImg ?? userImg}
              alt="img"
              className="w-full h-full object-cover rounded-xl"
            />
          )}
        </div>

        {/* Name */}
        <div className="flex-1 font-semibold text-lg truncate">
          {name}
        </div>

        {/* View */}
        {onView && (
          <button
            onClick={onView}
            className="px-4 py-2 rounded-xl border text-sm bg-white"
          >
            View
          </button>
        )}

        {/* Edit – only if provided */}
        {onEdit && (
          <button
            onClick={onEdit}
            className="px-4 py-2 rounded-xl border text-sm bg-white"
          >
            Edit
          </button>
        )}

        {/* Delete – only if provided */}
        {onDelete && (
<button
  onClick={onDelete}
  className="px-4 py-2 rounded-xl text-sm font-medium
             bg-red-600 text-white
             hover:bg-red-700
             active:scale-95
             transition-all shadow-sm"
>
  Delete
</button>

        )}

        {/* Toggle */}
        <button
          onClick={() => changeStatus()}
          className={`relative w-14 h-8 rounded-full transition-colors ${
            active ? 'bg-green-500' : 'bg-gray-400'
          }`}
        >
          <span
            className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white transition-transform ${
              active ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
};
