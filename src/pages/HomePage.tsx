import React, { useEffect, useMemo, useState } from "react";
import { Search, Users as UsersIcon } from "lucide-react";
import { Input } from "../components/Input";
import { Card } from "../components/Card";
import { fetchUsers, fetchContent, type User, type Content } from "../api/firestoreApi";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { id } from "date-fns/locale";

// ---------------- TYPES ----------------
type DisplayItem = (User & { type: "user" }) | (Content & { type: "content" });

type Stats = {
  totalUsers: number;
  totalContents: number;
  percentUsersWithContent: number;
  topUsers: { id: string; name: string; contentCount: number }[];
};

// ---------------- COMPONENT ----------------
export const HomePage: React.FC = () => {
  const [items, setItems] = useState<DisplayItem[]>([]);
  const [usersWithType, setUsersWithType] = useState<(User & { type: "user" })[]>([]);
  const [contentWithType, setContentWithType] = useState<(Content & { type: "content" })[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"All" | "User" | "Content">("All");
  const navigate = useNavigate();

  // ---------------- DATA LOAD ----------------
  useEffect(() => {
    async function loadData() {
      const [usersData, contentData] = await Promise.all([
        fetchUsers(),
        fetchContent()
      ]);

      const userStr = localStorage.getItem("user");
      const currentUser = userStr ? JSON.parse(userStr) : null;
      const uid = currentUser?.uid;

      const filteredUsers = uid
        ? usersData.filter(u => u.id !== uid)
        : usersData;

      const users = filteredUsers.map(u => ({ ...u, type: "user" as const }));
      const contents = contentData.map(c => ({ ...c, type: "content" as const }));

      setUsersWithType(users);
      setContentWithType(contents);
      setItems([...users, ...contents]);
    }

    loadData().catch(console.error);
  }, []);

  // ---------------- STATS ----------------
const stats = useMemo(() => {
  const totalUsers = usersWithType.length;
  const totalContents = contentWithType.length;

  // Count content per user (AuthorId -> User.id)
  const contentCountMap: Record<string, number> = {};

  contentWithType.forEach(content => {
    if (content.AuthorId) {
      contentCountMap[content.AuthorId] =
        (contentCountMap[content.AuthorId] || 0) + 1;
    }
  });

  // Users who created at least one content
  const usersWithContent = usersWithType.filter(
    user => contentCountMap[user.id] > 0
  );

  const percentUsersWithContent =
    totalUsers === 0
      ? 0
      : Math.round((usersWithContent.length / totalUsers) * 100);

  // Top 3 users by content count
  const topUsers = usersWithType
    .map(user => ({
      id: user.id,
      name: user.name,
      contentCount: contentCountMap[user.id] || 0
    }))
    .sort((a, b) => b.contentCount - a.contentCount)
    .slice(0, 3);

  return {
    totalUsers,
    totalContents,
    percentUsersWithContent,
    topUsers
  };
}, [usersWithType, contentWithType]);

  // ---------------- FILTER ----------------
  const filteredItems = items.filter(item => {
    const name = item.type === "user" ? item.name : item.title;
    const matchesSearch = name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    if (roleFilter === "All") return matchesSearch;
    if (roleFilter === "User") return matchesSearch && item.type === "user";
    if (roleFilter === "Content") return matchesSearch && item.type === "content";
    return matchesSearch;
  });

  // ---------------- AVATAR ----------------
  const getUserAvatarUrl = (name: string) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&size=128&background=random&color=fff&bold=true`;

  // ---------------- CHART DATA ----------------
  const barData = stats.topUsers.map(u => ({
    name: u.name,
    contents: u.contentCount
  }));

  const pieData = [
    { name: "Users with Content", value: stats.percentUsersWithContent },
    { name: "Users without Content", value: 100 - stats.percentUsersWithContent }
  ];

  const COLORS = ["#3b82f6", "#e5e7eb"];

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Find Users & Content</h1>
          <p className="text-gray-500">Search, analyze and explore</p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Users", value: stats.totalUsers },
            { label: "Total Contents", value: stats.totalContents },
            { label: "% Users with Content", value: `${stats.percentUsersWithContent}%` }
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-4 rounded-xl shadow"
            >
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </motion.div>
          ))}

          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-sm text-gray-500 mb-2">Top Users</p>
            {stats.topUsers.map(u => (
              <div key={u.id} className="flex justify-between text-sm">
                <span>{u.name}</span>
                <span className="font-semibold">{u.contentCount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white p-4 rounded-xl shadow h-64">
            <h3 className="font-semibold mb-2">Top 3 Users by Content</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="contents" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-4 rounded-xl shadow h-64">
            <h3 className="font-semibold mb-2">Users Content Distribution</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SEARCH */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by name or title..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-12"
            />
          </div>

          <div className="flex gap-2">
            {["All", "User", "Content"].map(role => (
              <button
                key={role}
                onClick={() => setRoleFilter(role as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  roleFilter === role
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* GRID */}
        <div className="grid gap-4">
          {filteredItems.map(item => {
            const imgSrc =
              item.type === "user"
                ? item.userImg || getUserAvatarUrl(item.name)
                : item.imageUrl;

            return (
        <Card
          key={item.id}
          id={item.id}
          name={item.type === "user" ? item.name : item.title}
          type={item.type}
          contentImg={imgSrc}
          Status={item.Status}
          onView={() => {
            if (item.type === "user") {
              // Navigate to user details page
              navigate("/user-profile", { state: {
                id: item.id,
                name: item.name,
                email: item.email,
                createdAt: item.createdAt,
                 contents: contentWithType.filter(c => c.AuthorId === item.id)

               } });
            } else if (item.type === "content") {
              // Navigate to content details page
              navigate("/view-component", { state: { content: item } });
            }
          }}
        />

            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <UsersIcon className="w-8 h-8 mx-auto text-gray-400" />
            <p className="text-gray-500">Nothing found</p>
          </div>
        )}
      </div>
    </div>
  );
};