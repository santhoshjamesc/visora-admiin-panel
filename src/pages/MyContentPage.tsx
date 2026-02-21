import React, { useEffect, useState } from "react";
import { Search, Plus, FileText } from "lucide-react";
import { Input } from "../components/Input";
import { Card } from "../components/Card";
import { useNavigate } from "react-router-dom";
import { fetchMyContent, deleteContent } from "../api/firestoreApi";

interface Content {
  id: string;
  title: string;
  imageUrl?: string;
  Status: "active" | "inactive";
}

export const MyContentPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [contents, setContents] = useState<Content[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      const data = await fetchMyContent();
      setContents(data);
    }
    loadData().catch(console.error);
  }, []);

  const filteredContent = contents.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ================= DELETE ================= */
  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this content?\nThis action cannot be undone."
    );

    if (!confirmed) return;

    try {
      await deleteContent(id);

      // Remove from UI instantly
      setContents((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete content");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              My Content
            </h1>
            <p className="text-gray-500">
              Manage your created content
            </p>
          </div>

          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600"
            onClick={() => navigate("/add-component")}
          >
            <Plus className="w-4 h-4" />
            Add Content
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12"
            />
          </div>
        </div>

        {/* List */}
        <div className="grid gap-4">
          {filteredContent.map((item) => (
            <Card
              key={item.id}
              name={item.title}
              Status={item.Status}
              contentImg={item.imageUrl}
              onView={() =>
                navigate("/view-component", { state: { content: item } })
              }
              onEdit={() =>
                navigate("/edit-component", { state: { content: item } })
              }
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredContent.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No content found</p>
          </div>
        )}
      </div>
    </div>
  );
};
