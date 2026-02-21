import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Eye,
  Trash2,
  User,
  FileWarning,
  ShieldAlert,
} from "lucide-react";

import {
  fetchReportsWithDetails,
  deleteReport,
  fetchUserNameByUid,
  type ReportWithDetails,
} from "../api/firestoreApi";

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<ReportWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  /* ---------------- LOAD REPORTS ---------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchReportsWithDetails();
      setReports(data);
      setLoading(false);
    }
    load();
  }, []);

  /* ---------------- LOAD USER NAMES ---------------- */
  useEffect(() => {
    async function loadNames() {
      const ids = new Set<string>();
      reports.forEach((r) => {
        if (r.reportedById) ids.add(r.reportedById);
        if (r.reportedId) ids.add(r.reportedId);
      });

      const map: Record<string, string> = {};
      await Promise.all(
        Array.from(ids).map(async (id) => {
          const name = await fetchUserNameByUid(id);
          if (name) map[id] = name;
        })
      );

      setUserNames(map);
    }

    if (reports.length) loadNames();
  }, [reports]);

  /* ---------------- ANALYTICS ---------------- */
  const analytics = useMemo(() => {
    const reporterCount: Record<string, number> = {};
    const contentCount: Record<string, number> = {};
    const userUniqueContent: Record<string, Set<string>> = {};

    reports.forEach((r) => {
      const reporter = r.reportedById;
      const reportedUser = r.reportedId;
      const title = r.content?.title;

      if (reporter) {
        reporterCount[reporter] = (reporterCount[reporter] || 0) + 1;
      }

      if (title) {
        contentCount[title] = (contentCount[title] || 0) + 1;
      }

      if (reportedUser && title) {
        if (!userUniqueContent[reportedUser]) {
          userUniqueContent[reportedUser] = new Set();
        }
        userUniqueContent[reportedUser].add(title);
      }
    });

    const topReporterEntry = Object.entries(reporterCount).sort(
      (a, b) => b[1] - a[1]
    )[0];

    const topContentEntry = Object.entries(contentCount).sort(
      (a, b) => b[1] - a[1]
    )[0];

    const topReportedUserEntry = Object.entries(userUniqueContent)
      .map(([uid, set]) => ({ uid, count: set.size }))
      .sort((a, b) => b.count - a.count)[0];

    return {
      totalReports: reports.length,

      topReporterName: topReporterEntry
        ? userNames[topReporterEntry[0]] || "Unknown"
        : "—",
      topReporterCount: topReporterEntry?.[1] || 0,

      topContentTitle: topContentEntry?.[0] || "—",
      topContentCount: topContentEntry?.[1] || 0,

      topReportedUserName: topReportedUserEntry
        ? userNames[topReportedUserEntry.uid] || "Unknown"
        : "—",
      topReportedUserCount: topReportedUserEntry?.count || 0,

      reporterChartData: Object.entries(reporterCount).map(([uid, count]) => ({
        name: userNames[uid] || "Unknown",
        count,
      })),

      contentChartData: Object.entries(contentCount).map(([title, count]) => ({
        title,
        count,
      })),
    };
  }, [reports, userNames]);

  /* ---------------- ACTIONS ---------------- */
  const handleIgnore = async (id: string) => {
    await deleteReport(id);
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  const handleViewContent = (content: any) => {
    navigate("/view-component", { state: { content } });
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">Loading reports…</div>
    );

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 space-y-8">
      <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-800">
        <AlertTriangle className="text-red-500" />
        Reports Dashboard
      </h1>

      {/* -------- STATS -------- */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Reports",
            value: analytics.totalReports,
            icon: ShieldAlert,
            color: "bg-red-500",
          },
          {
            label: "Top Reporter",
            value: `${analytics.topReporterName} (${analytics.topReporterCount})`,
            icon: User,
            color: "bg-blue-500",
          },
          {
            label: "Top Reported Content",
            value: `${analytics.topContentTitle} (${analytics.topContentCount})`,
            icon: FileWarning,
            color: "bg-orange-500",
          },
          {
            label: "Top Reported User",
            value: `${analytics.topReportedUserName} (${analytics.topReportedUserCount})`,
            icon: AlertTriangle,
            color: "bg-purple-500",
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl shadow p-5 flex items-center gap-4"
          >
            <div
              className={`w-12 h-12 rounded-xl text-white flex items-center justify-center ${stat.color}`}
            >
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="font-bold text-gray-800">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* -------- CHARTS -------- */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow p-5">
          <h3 className="font-semibold mb-3 text-gray-700">
            Who Reported the Most
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={analytics.reporterChartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6"/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <h3 className="font-semibold mb-3 text-gray-700">
            Most Reported Content
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={analytics.contentChartData}>
              <XAxis dataKey="title" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#b91300ff"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* -------- TABLE -------- */}
      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              {["Content", "Reported User", "Reported By", "Created", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-600"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">
                  {r.content?.title ?? "Unknown Content"}
                </td>
                <td className="px-4 py-3">
                  {userNames[r.reportedId] || "Unknown"}
                </td>
                <td className="px-4 py-3">
                  {userNames[r.reportedById] || "Unknown"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {r.createdAt?.toDate
                    ? format(r.createdAt.toDate(), "PPP p")
                    : "-"}
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => handleViewContent(r.content)}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleIgnore(r.id)}
                    className="p-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
