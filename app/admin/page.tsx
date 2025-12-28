"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";

type AttendanceRecord = {
  id: string;
  school_name: string;
  city: string;
  date: string;
  hours: number;
  user_id: string;
  instructor_name?: string;
  notes?: string;
  admin_notes?: string;
  profiles?: {
    full_name: string;
    email: string;
  };
};


type AdminAttendanceRecord = {
  id: string;
  instructor_name: string;
  instructor_email: string;
  school_name: string;
  city: string;
  date: string;
  hours: number;
  notes: string;
};


type User = {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "instructor";
  active: boolean;
};

type Setting = {
  id: string;
  key: string;
  value: string;
};

type Schedule = {
  id: string;
  school_name: string;
  city: string;
  class_name: string;
  activity_hours: string;
  hours_count: number;
  instructor_id: string;
  instructor_name: string;
  instructor_email: string;
  day_of_week: string;
};

// קומפוננטת טאב דיווחי נוכחות
function AttendanceTab({ records, loading, onRefresh }: { records: AttendanceRecord[]; loading: boolean; onRefresh: () => void }) {
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [filterUser, setFilterUser] = useState<string>("");
  const [filterCity, setFilterCity] = useState<string>("");
  const [filterSchool, setFilterSchool] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteValue, setEditingNoteValue] = useState<string>("");
  

  const getMonths = () => {
    const months = new Set<string>();
    records.forEach((record) => {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      months.add(monthKey);
    });
    return Array.from(months).sort().reverse();
  };

  const getUniqueUsers = () => {
    const users = new Map<string, string>();
    records.forEach((r) => {
      if (r.profiles?.email) {
        users.set(r.profiles.email, r.profiles.full_name || r.profiles.email);
      }
    });
    return Array.from(users.entries());
  };

  const getUniqueCities = () => {
    const cities = new Set<string>();
    records.forEach((r) => {
      if (r.city) cities.add(r.city);
    });
    return Array.from(cities).sort();
  };

  const getUniqueSchools = () => {
    const schools = new Set<string>();
    records.forEach((r) => {
      if (r.school_name) schools.add(r.school_name);
    });
    return Array.from(schools).sort();
  };

  const getUniqueDates = () => {
    const dates = new Set<string>();
    records.forEach((r) => {
      if (r.date) dates.add(r.date);
    });
    return Array.from(dates).sort().reverse();
  };

  const getFilteredRecords = () => {
    let filtered = records;

    if (selectedMonth) {
      filtered = filtered.filter((record) => {
        const date = new Date(record.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        return monthKey === selectedMonth;
      });
    }

    if (filterUser) {
      filtered = filtered.filter((r) => r.profiles?.email === filterUser);
    }

    if (filterCity) {
      filtered = filtered.filter((r) => r.city === filterCity);
    }

    if (filterSchool) {
      filtered = filtered.filter((r) => r.school_name === filterSchool);
    }

    if (filterDate) {
      filtered = filtered.filter((r) => r.date === filterDate);
    }

    return filtered;
  };

  const formatMonthName = (monthKey: string) => {
    const [year, month] = monthKey.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("he-IL", { month: "long", year: "numeric" });
  };

  const saveAdminNote = async (recordId: string) => {
    try {
      const res = await fetch("/api/admin/attendance/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordId, admin_notes: editingNoteValue }),
      });
      if (res.ok) {
        onRefresh();
        setEditingNoteId(null);
        setEditingNoteValue("");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const clearFilters = () => {
    setFilterUser("");
    setFilterCity("");
    setFilterSchool("");
    setFilterDate("");
  };

  const exportAttendanceCsv = () => {
    const { downloadCsv, arrayToCsv } = require("@/lib/exportCsv");
    
    const headers = ["שם", "אימייל", "תאריך", "בית ספר", "עיר", "שעות", "הערות", "הערות מנהל"];
    const rows = filteredRecords.map(record => [
      record.profiles?.full_name || "-",
      record.profiles?.email || "-",
      new Date(record.date).toLocaleDateString("he-IL"),
      record.school_name,
      record.city || "-",
      String(record.hours),
      record.notes || "-",
      record.admin_notes || "-"
    ]);

    const csv = arrayToCsv(headers, rows);
    const monthName = selectedMonth ? formatMonthName(selectedMonth).replace(" ", "_") : "all";
    downloadCsv(`דיווחי_נוכחות_${monthName}.csv`, csv);
  };

  const months = getMonths();
  const filteredRecords = getFilteredRecords();
  const totalHours = filteredRecords.reduce((sum, r) => sum + Number(r.hours), 0);
  const activeInstructors = new Set(filteredRecords.map((r) => r.profiles?.email)).size;
  const activeSchools = new Set(filteredRecords.map((r) => r.school_name)).size;
  const hasFilters = filterUser || filterCity || filterSchool || filterDate;

  useEffect(() => {
    if (months.length > 0 && !selectedMonth) {
      setSelectedMonth(months[0]);
    }
  }, [records, months.length]);

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="p-4 bg-gray-50 border-b flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-lg">📊 כל הדיווחים</h2>
          <button
            onClick={() => exportAttendanceCsv()}
            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
          >
            📥 ייצוא
          </button>
        </div>
      
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-gray-500">שעות:</span>
            <span className="font-bold text-blue-600">{totalHours}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-500">דיווחים:</span>
            <span className="font-bold text-green-600">{filteredRecords.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-500">מדריכים:</span>
            <span className="font-bold text-purple-600">{activeInstructors}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-500">בתי ספר:</span>
            <span className="font-bold text-orange-600">{activeSchools}</span>
          </div>
        </div>
      </div>

      {months.length > 0 && (
        <div className="p-3 border-b overflow-x-auto whitespace-nowrap">
          <div className="flex gap-2">
            {months.map((month) => (
              <button
                key={month}
                onClick={() => setSelectedMonth(month)}
                className={`px-4 py-2 rounded-full text-sm ${
                  selectedMonth === month
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {formatMonthName(month)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-3 border-b bg-gray-50 flex flex-wrap gap-3 items-center">
        <span className="text-sm text-gray-500">🔍 סינון:</span>
        
        <select
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          className="p-2 border rounded text-sm"
        >
          <option value="">כל המדריכים</option>
          {getUniqueUsers().map(([email, name]) => (
            <option key={email} value={email}>{name}</option>
          ))}
        </select>

        <select
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
          className="p-2 border rounded text-sm"
        >
          <option value="">כל הערים</option>
          {getUniqueCities().map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>

        <select
          value={filterSchool}
          onChange={(e) => setFilterSchool(e.target.value)}
          className="p-2 border rounded text-sm"
        >
          <option value="">כל בתי הספר</option>
          {getUniqueSchools().map((school) => (
            <option key={school} value={school}>{school}</option>
          ))}
        </select>

        <select
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="p-2 border rounded text-sm"
        >
          <option value="">כל הימים</option>
          {getUniqueDates().map((date) => (
            <option key={date} value={date}>
              {new Date(date).toLocaleDateString("he-IL")}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm text-red-500 hover:text-red-700"
          >
            ✕ נקה סינון
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <p className="p-4 text-center text-gray-500">טוען...</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="p-3 text-right">שם</th>
                <th className="p-3 text-right">אימייל</th>
                <th className="p-3 text-right">תאריך</th>
                <th className="p-3 text-right">בית ספר</th>
                <th className="p-3 text-right">עיר</th>
                <th className="p-3 text-right">שעות</th>
                <th className="p-3 text-right">הערות</th>
                <th className="p-3 text-right">הערות מנהל</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-gray-400">
                    אין דיווחים בחודש זה
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{record.profiles?.full_name || "-"}</td>
                    <td className="p-3 text-sm text-gray-500">{record.profiles?.email || "-"}</td>
                    <td className="p-3">{new Date(record.date).toLocaleDateString("he-IL")}</td>
                    <td className="p-3">{record.school_name}</td>
                    <td className="p-3">{record.city || "-"}</td>
                    <td className="p-3 font-semibold">{record.hours}</td>
                    <td className="p-3 text-sm">{record.notes || "-"}</td>
                    <td className="p-3 text-sm">
                      {editingNoteId === record.id ? (
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={editingNoteValue}
                            onChange={(e) => setEditingNoteValue(e.target.value)}
                            className="p-1 border rounded text-sm w-24"
                            autoFocus
                          />
                          <button
                            onClick={() => saveAdminNote(record.id)}
                            className="text-green-600 hover:text-green-800"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => setEditingNoteId(null)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <span
                          onClick={() => {
                            setEditingNoteId(record.id);
                            setEditingNoteValue(record.admin_notes || "");
                          }}
                          className="cursor-pointer hover:bg-purple-50 px-2 py-1 rounded text-purple-600"
                        >
                          {record.admin_notes || "➕ הוסף"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// קומפוננטת טאב סטטיסטיקות
function StatsTab({ records, adminRecords, users, schedules }: { 
  records: AttendanceRecord[]; 
  adminRecords: AdminAttendanceRecord[];
  users: User[];
  schedules: Schedule[];
}) {
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  const getMonths = () => {
    const months = new Set<string>();
    records.forEach((record) => {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      months.add(monthKey);
    });
    return Array.from(months).sort().reverse();
  };

  const getFilteredRecords = () => {
    if (!selectedMonth) return records;
    return records.filter((record) => {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      return monthKey === selectedMonth;
    });
  };

  const formatMonthName = (monthKey: string) => {
    const [year, month] = monthKey.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("he-IL", { month: "long", year: "numeric" });
  };

  const getInstructorStats = () => {
    const stats = new Map<string, { name: string; email: string; hours: number; reports: number }>();
    
    getFilteredRecords().forEach((record) => {
      const email = record.profiles?.email || "unknown";
      const name = record.profiles?.full_name || email;
      
      if (!stats.has(email)) {
        stats.set(email, { name, email, hours: 0, reports: 0 });
      }
      
      const current = stats.get(email)!;
      current.hours += Number(record.hours);
      current.reports += 1;
    });

    return Array.from(stats.values()).sort((a, b) => b.hours - a.hours);
  };

  const getSchoolStats = () => {
    const stats = new Map<string, { school: string; city: string; hours: number; reports: number }>();
    
    getFilteredRecords().forEach((record) => {
      const school = record.school_name || "לא ידוע";
      const city = record.city || "-";
      
      if (!stats.has(school)) {
        stats.set(school, { school, city, hours: 0, reports: 0 });
      }
      
      const current = stats.get(school)!;
      current.hours += Number(record.hours);
      current.reports += 1;
    });

    return Array.from(stats.values()).sort((a, b) => b.hours - a.hours);
  };


  // חישוב שעות לפי מדריך - מדיווחי מנהל
  const getAdminInstructorStats = () => {
    const stats = new Map<string, { name: string; email: string; hours: number; reports: number }>();
    
    const filteredAdmin = adminRecords.filter((record) => {
      if (!selectedMonth) return true;
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      return monthKey === selectedMonth;
    });

    filteredAdmin.forEach((record) => {
      const email = record.instructor_email || "unknown";
      const name = record.instructor_name || email;
      
      if (!stats.has(name)) {
        stats.set(name, { name, email, hours: 0, reports: 0 });
      }
      
      const current = stats.get(name)!;
      current.hours += Number(record.hours);
      current.reports += 1;
    });

    return stats;
  };

  // חישוב שעות לפי בית ספר - מדיווחי מנהל
  const getAdminSchoolStats = () => {
    const stats = new Map<string, { school: string; city: string; hours: number; reports: number }>();
    
    const filteredAdmin = adminRecords.filter((record) => {
      if (!selectedMonth) return true;
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      return monthKey === selectedMonth;
    });

    filteredAdmin.forEach((record) => {
      const school = record.school_name || "לא ידוע";
      const city = record.city || "-";
      
      if (!stats.has(school)) {
        stats.set(school, { school, city, hours: 0, reports: 0 });
      }
      
      const current = stats.get(school)!;
      current.hours += Number(record.hours);
      current.reports += 1;
    });

    return stats;
  };

  // מיזוג סטטיסטיקות מדריכים - כולל כל המדריכים הפעילים
  const getMergedInstructorStats = () => {
    const instructorStats = getInstructorStats();
    const adminStats = getAdminInstructorStats();
    
    // התחל עם כל המדריכים מטבלת users
    const allInstructors = users
      .filter(u => u.role === "instructor" || u.role === "admin")
      .map(u => ({
        name: u.full_name || u.email,
        email: u.email,
        instructorHours: 0,
        instructorReports: 0,
        adminHours: 0,
        adminReports: 0,
        mismatch: false
      }));

    // עדכן עם נתונים מדיווחי מדריכים
    instructorStats.forEach(stat => {
      const existing = allInstructors.find(i => i.email === stat.email || i.name === stat.name);
      if (existing) {
        existing.instructorHours = stat.hours;
        existing.instructorReports = stat.reports;
      } else {
        allInstructors.push({
          name: stat.name,
          email: stat.email,
          instructorHours: stat.hours,
          instructorReports: stat.reports,
          adminHours: 0,
          adminReports: 0,
          mismatch: false
        });
      }
    });

    // עדכן עם נתונים מדיווחי מנהל
    Array.from(adminStats.values()).forEach(stat => {
      const existing = allInstructors.find(i => i.email === stat.email || i.name === stat.name);
      if (existing) {
        existing.adminHours = stat.hours;
        existing.adminReports = stat.reports;
      } else {
        allInstructors.push({
          name: stat.name,
          email: stat.email,
          instructorHours: 0,
          instructorReports: 0,
          adminHours: stat.hours,
          adminReports: stat.reports,
          mismatch: false
        });
      }
    });

    // חשב mismatch
    allInstructors.forEach(i => {
      i.mismatch = i.instructorHours !== i.adminHours;
    });

    // מיין לפי א-ב
    return allInstructors.sort((a, b) => a.name.localeCompare(b.name, 'he'));
  };

  // מיזוג סטטיסטיקות בתי ספר - כולל כל בתי הספר ממערכת השעות
  const getMergedSchoolStats = () => {
    const schoolStats = getSchoolStats();
    const adminStats = getAdminSchoolStats();
    
    // התחל עם כל בתי הספר ממערכת השעות
    const uniqueSchools = new Map<string, { school: string; city: string }>();
    schedules.forEach(s => {
      if (!uniqueSchools.has(s.school_name)) {
        uniqueSchools.set(s.school_name, { school: s.school_name, city: s.city });
      }
    });

    const allSchools = Array.from(uniqueSchools.values()).map(s => ({
      school: s.school,
      city: s.city,
      instructorHours: 0,
      instructorReports: 0,
      adminHours: 0,
      adminReports: 0,
      mismatch: false
    }));

    // עדכן עם נתונים מדיווחי מדריכים
    schoolStats.forEach(stat => {
      const existing = allSchools.find(s => s.school === stat.school);
      if (existing) {
        existing.instructorHours = stat.hours;
        existing.instructorReports = stat.reports;
      } else {
        allSchools.push({
          school: stat.school,
          city: stat.city,
          instructorHours: stat.hours,
          instructorReports: stat.reports,
          adminHours: 0,
          adminReports: 0,
          mismatch: false
        });
      }
    });

    // עדכן עם נתונים מדיווחי מנהל
    Array.from(adminStats.values()).forEach(stat => {
      const existing = allSchools.find(s => s.school === stat.school);
      if (existing) {
        existing.adminHours = stat.hours;
        existing.adminReports = stat.reports;
      } else {
        allSchools.push({
          school: stat.school,
          city: stat.city,
          instructorHours: 0,
          instructorReports: 0,
          adminHours: stat.hours,
          adminReports: stat.reports,
          mismatch: false
        });
      }
    });

    // חשב mismatch
    allSchools.forEach(s => {
      s.mismatch = s.instructorHours !== s.adminHours;
    });

    // מיין לפי א-ב
    return allSchools.sort((a, b) => a.school.localeCompare(b.school, 'he'));
  };


  const months = getMonths();
  const filteredRecords = getFilteredRecords();
  const instructorStats = getInstructorStats();
  const schoolStats = getSchoolStats();
  const mergedInstructorStats = getMergedInstructorStats();
  const mergedSchoolStats = getMergedSchoolStats();
  const totalHours = filteredRecords.reduce((sum, r) => sum + Number(r.hours), 0);

  const exportAllStatsCsv = () => {
    const { downloadCsv } = require("@/lib/exportCsv");
    
    const monthName = selectedMonth ? formatMonthName(selectedMonth).replace(" ", "_") : "all";
    
    let csv = "=== דיווחי נוכחות ===\n";
    csv += "שם,אימייל,תאריך,בית ספר,עיר,שעות\n";
    filteredRecords.forEach(record => {
      csv += `"${record.profiles?.full_name || "-"}","${record.profiles?.email || "-"}","${new Date(record.date).toLocaleDateString("he-IL")}","${record.school_name}","${record.city || "-"}","${record.hours}"\n`;
    });
    
    csv += "\n=== שעות לפי מדריך ===\n";
    csv += "שם,אימייל,דיווחים,שעות\n";
    instructorStats.forEach(stat => {
      csv += `"${stat.name}","${stat.email}","${stat.reports}","${stat.hours}"\n`;
    });
    
    csv += "\n=== שעות לפי בית ספר ===\n";
    csv += "בית ספר,עיר,דיווחים,שעות\n";
    schoolStats.forEach(stat => {
      csv += `"${stat.school}","${stat.city}","${stat.reports}","${stat.hours}"\n`;
    });

    downloadCsv(`סטטיסטיקות_${monthName}.csv`, csv);
  };

  useEffect(() => {
    if (months.length > 0 && !selectedMonth) {
      setSelectedMonth(months[0]);
    }
  }, [records, months.length]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-lg">📅 בחר חודש</h2>
            <button
              onClick={() => exportAllStatsCsv()}
              className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
            >
              📥 ייצוא הכל
            </button>
          </div>
          <div className="text-sm text-gray-500">
            סה״כ: <span className="font-bold text-blue-600">{totalHours}</span> שעות
          </div>
        </div>
        {months.length > 0 && (
          <div className="overflow-x-auto whitespace-nowrap">
            <div className="flex gap-2">
              {months.map((month) => (
                <button
                  key={month}
                  onClick={() => setSelectedMonth(month)}
                  className={`px-4 py-2 rounded-full text-sm ${
                    selectedMonth === month
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {formatMonthName(month)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="p-4 bg-purple-50 border-b flex items-center justify-between">
            <h2 className="font-bold text-lg">👥 שעות לפי מדריך</h2>
            <span className="text-sm text-gray-500">{mergedInstructorStats.length} מדריכים</span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="p-3 text-right">שם</th>
                  <th className="p-3 text-right text-blue-600">דיווחי מדריך</th>
                  <th className="p-3 text-right text-blue-600">שעות מדריך</th>
                  <th className="p-3 text-right text-purple-600">דיווחי מנהל</th>
                  <th className="p-3 text-right text-purple-600">שעות מנהל</th>
                </tr>
              </thead>
              <tbody>
                {mergedInstructorStats.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-400">
                      אין נתונים בחודש זה
                    </td>
                  </tr>
                ) : (
                  mergedInstructorStats.map((stat, index) => (
                    <tr key={stat.email || stat.name} className={`border-t hover:bg-gray-50 ${stat.mismatch ? "bg-red-50" : ""}`}>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${
                            index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : index === 2 ? "bg-orange-400" : "bg-gray-300"
                          }`}>
                            {index + 1}
                          </span>
                          <div>
                            <div className="font-medium">{stat.name}</div>
                            <div className="text-xs text-gray-400">{stat.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center">{stat.instructorReports}</td>
                      <td className={`p-3 font-bold ${stat.mismatch ? "text-red-600" : "text-green-600"}`}>{stat.instructorHours}</td>
                      <td className="p-3 text-center">{stat.adminReports}</td>
                      <td className={`p-3 font-bold ${stat.mismatch ? "text-red-600" : "text-green-600"}`}>{stat.adminHours}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="p-4 bg-orange-50 border-b flex items-center justify-between">
            <h2 className="font-bold text-lg">🏫 שעות לפי בית ספר</h2>
            <span className="text-sm text-gray-500">{mergedSchoolStats.length} בתי ספר</span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="p-3 text-right">בית ספר</th>
                  <th className="p-3 text-right">עיר</th>
                  <th className="p-3 text-right text-blue-600">דיווחי מדריך</th>
                  <th className="p-3 text-right text-blue-600">שעות מדריך</th>
                  <th className="p-3 text-right text-purple-600">דיווחי מנהל</th>
                  <th className="p-3 text-right text-purple-600">שעות מנהל</th>
                </tr>
              </thead>
              <tbody>
                {mergedSchoolStats.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-400">
                      אין נתונים בחודש זה
                    </td>
                  </tr>
                ) : (
                  mergedSchoolStats.map((stat, index) => (
                    <tr key={stat.school} className={`border-t hover:bg-gray-50 ${stat.mismatch ? "bg-red-50" : ""}`}>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${
                            index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : index === 2 ? "bg-orange-400" : "bg-gray-300"
                          }`}>
                            {index + 1}
                          </span>
                          <span className="font-medium">{stat.school}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-gray-500">{stat.city}</td>
                      <td className="p-3 text-center">{stat.instructorReports}</td>
                      <td className={`p-3 font-bold ${stat.mismatch ? "text-red-600" : "text-green-600"}`}>{stat.instructorHours}</td>
                      <td className="p-3 text-center">{stat.adminReports}</td>
                      <td className={`p-3 font-bold ${stat.mismatch ? "text-red-600" : "text-green-600"}`}>{stat.adminHours}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>





      </div>
    </div>
  );
}


// קומפוננטת טאב דיווח שעות מנהל
function AdminAttendanceTab({ 
  records, 
  schedules, 
  users,
  loading, 
  onRefresh 
}: { 
  records: AdminAttendanceRecord[]; 
  schedules: Schedule[];
  users: User[];
  loading: boolean; 
  onRefresh: () => void 
}) {
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [newRows, setNewRows] = useState<{
    instructor_name: string;
    instructor_email: string;
    school_name: string;
    city: string;
    date: string;
    hours: number;
    notes: string;
  }[]>([]);

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const getDayOfWeek = (date: Date) => {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    return days[date.getDay()];
  };

  const hebrewDays: { [key: string]: string } = {
    sunday: "ראשון",
    monday: "שני",
    tuesday: "שלישי",
    wednesday: "רביעי",
    thursday: "חמישי",
    friday: "שישי",
  };

  const currentDay = getDayOfWeek(today);

  // טעינת מערכת השעות של היום
  useEffect(() => {
    const todaySchedules = schedules.filter(s => s.day_of_week === currentDay);
    if (todaySchedules.length > 0 && newRows.length === 0) {
      setNewRows(todaySchedules.map(s => ({
        instructor_name: s.instructor_name || "",
        instructor_email: s.instructor_email || "",
        school_name: s.school_name,
        city: s.city,
        date: todayStr,
        hours: s.hours_count,
        notes: "",
      })));
    } else if (todaySchedules.length === 0 && newRows.length === 0) {
      setNewRows([{
        instructor_name: "",
        instructor_email: "",
        school_name: "",
        city: "",
        date: todayStr,
        hours: 1,
        notes: "",
      }]);
    }
  }, [schedules, currentDay]);

  // רשימת בתי ספר ייחודיים
  const getUniqueSchools = () => {
    const schools = new Map<string, string>();
    schedules.forEach(s => {
      if (s.school_name) {
        schools.set(s.school_name, s.city);
      }
    });
    return Array.from(schools.entries());
  };

  // עדכון עיר אוטומטי לפי בית ספר
  const handleSchoolChange = (index: number, schoolName: string) => {
    const updated = [...newRows];
    updated[index].school_name = schoolName;
    
    const school = schedules.find(s => s.school_name === schoolName);
    if (school) {
      updated[index].city = school.city;
    }
    setNewRows(updated);
  };

  // עדכון מייל אוטומטי לפי שם מדריך
  const handleInstructorChange = (index: number, instructorName: string) => {
    const updated = [...newRows];
    updated[index].instructor_name = instructorName;
    
    const user = users.find(u => u.full_name === instructorName);
    if (user) {
      updated[index].instructor_email = user.email;
    }
    setNewRows(updated);
  };

  const handleRowChange = (index: number, field: string, value: string | number) => {
    const updated = [...newRows];
    updated[index] = { ...updated[index], [field]: value };
    setNewRows(updated);
  };

  const addRow = () => {
    setNewRows([...newRows, {
      instructor_name: "",
      instructor_email: "",
      school_name: "",
      city: "",
      date: todayStr,
      hours: 1,
      notes: "",
    }]);
  };

  const removeRow = (index: number) => {
    if (newRows.length > 1) {
      setNewRows(newRows.filter((_, i) => i !== index));
    }
  };

  const submitRow = async (index: number) => {
    const row = newRows[index];
    if (!row.instructor_name || !row.school_name || !row.date) {
      alert("יש למלא שם מדריך, בית ספר ותאריך");
      return;
    }

    try {
      const res = await fetch("/api/admin/admin-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      });
      if (res.ok) {
        const updated = [...newRows];
        updated[index] = {
          instructor_name: "",
          instructor_email: "",
          school_name: "",
          city: "",
          date: todayStr,
          hours: 1,
          notes: "",
        };
        setNewRows(updated);
        onRefresh();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const submitAll = async () => {
    const validRows = newRows.filter(r => r.instructor_name && r.school_name && r.date);
    if (validRows.length === 0) {
      alert("אין שורות תקינות לשמירה");
      return;
    }

    try {
      for (const row of validRows) {
        await fetch("/api/admin/admin-attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(row),
        });
      }
      // איפוס לשורה ריקה
      setNewRows([{
        instructor_name: "",
        instructor_email: "",
        school_name: "",
        city: "",
        date: todayStr,
        hours: 1,
        notes: "",
      }]);
      onRefresh();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const deleteRecord = async (id: string) => {
    if (!confirm("האם למחוק רשומה זו?")) return;
    try {
      const res = await fetch(`/api/admin/admin-attendance?id=${id}`, { method: "DELETE" });
      if (res.ok) onRefresh();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // חודשים
  const getMonths = () => {
    const months = new Set<string>();
    records.forEach((record) => {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      months.add(monthKey);
    });
    return Array.from(months).sort().reverse();
  };

  const getFilteredRecords = () => {
    if (!selectedMonth) return records;
    return records.filter((record) => {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      return monthKey === selectedMonth;
    });
  };

  const formatMonthName = (monthKey: string) => {
    const [year, month] = monthKey.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("he-IL", { month: "long", year: "numeric" });
  };

  const exportCsv = () => {
    const headers = ["מדריך", "אימייל", "בית ספר", "עיר", "תאריך", "שעות"];
    const rows = filteredRecords.map(r => [
      r.instructor_name,
      r.instructor_email || "-",
      r.school_name,
      r.city || "-",
      new Date(r.date).toLocaleDateString("he-IL"),
      String(r.hours)
    ]);

    let csv = "\uFEFF" + headers.join(",") + "\n";
    rows.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `דיווחי_מנהל_${selectedMonth || "all"}.csv`;
    link.click();
  };

  const months = getMonths();
  const filteredRecords = getFilteredRecords();
  const totalHours = filteredRecords.reduce((sum, r) => sum + Number(r.hours), 0);

  useEffect(() => {
    if (months.length > 0 && !selectedMonth) {
      setSelectedMonth(months[0]);
    }
  }, [records, months.length]);

  return (
    <div className="space-y-6">
      {/* טופס הוספה */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="p-4 bg-green-50 border-b flex items-center justify-between">
          <h2 className="font-bold text-lg">➕ דיווח שעות - יום {hebrewDays[currentDay]}</h2>
          <div className="flex gap-2">
            <button
              onClick={addRow}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              + הוסף שורה
            </button>
            <button
              onClick={submitAll}
              className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
            >
              ✓ שמור הכל
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-right text-sm">מדריך</th>
                <th className="p-2 text-right text-sm">בית ספר</th>
                <th className="p-2 text-right text-sm">עיר</th>
                <th className="p-2 text-right text-sm">תאריך</th>
                <th className="p-2 text-right text-sm">שעות</th>
                <th className="p-2 text-right text-sm">הערות</th>
                <th className="p-2 text-right text-sm">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {newRows.map((row, index) => (
                <tr key={index} className="border-t">
                  <td className="p-2">
                    <div className="flex flex-col">
                      <input
                        type="text"
                        list="instructors-list"
                        value={row.instructor_name}
                        onChange={(e) => handleInstructorChange(index, e.target.value)}
                        placeholder="שם מדריך..."
                        className="p-1 border rounded text-sm w-28"
                      />
                      <span className="text-xs text-gray-400">{row.instructor_email || ""}</span>
                    </div>
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      list="schools-list"
                      value={row.school_name}
                      onChange={(e) => handleSchoolChange(index, e.target.value)}
                      placeholder="בית ספר..."
                      className="p-1 border rounded text-sm w-28"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.city}
                      onChange={(e) => handleRowChange(index, "city", e.target.value)}
                      placeholder="עיר..."
                      className="p-1 border rounded text-sm w-20"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="date"
                      value={row.date}
                      onChange={(e) => handleRowChange(index, "date", e.target.value)}
                      className="p-1 border rounded text-sm"
                    />
                  </td>


                  <td className="p-2">
                    <input
                      type="number"
                      min="1"
                      value={row.hours}
                      onChange={(e) => handleRowChange(index, "hours", parseInt(e.target.value) || 1)}
                      className="p-1 border rounded text-sm w-14"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.notes || ""}
                      onChange={(e) => handleRowChange(index, "notes", e.target.value)}
                      placeholder="הערות..."
                      className="p-1 border rounded text-sm w-24"
                    />
                  </td>
                  <td className="p-2">
                    <div className="flex gap-1">





                      <button
                        onClick={() => submitRow(index)}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => removeRow(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Datalists */}
        <datalist id="instructors-list">
          {users.map(u => (
            <option key={u.id} value={u.full_name || u.email} />
          ))}
        </datalist>
        <datalist id="schools-list">
          {getUniqueSchools().map(([name]) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </div>

      {/* טבלת היסטוריה */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="p-4 bg-purple-50 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-lg">📋 דיווחי מנהל</h2>
            <button
              onClick={exportCsv}
              className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
            >
              📥 ייצוא
            </button>
          </div>
          <div className="text-sm text-gray-500">
            סה״כ: <span className="font-bold text-purple-600">{totalHours}</span> שעות | 
            <span className="font-bold text-purple-600 mr-1">{filteredRecords.length}</span> רשומות
          </div>
        </div>

        {/* בחירת חודש */}
        {months.length > 0 && (
          <div className="p-3 border-b overflow-x-auto whitespace-nowrap">
            <div className="flex gap-2">
              {months.map((month) => (
                <button
                  key={month}
                  onClick={() => setSelectedMonth(month)}
                  className={`px-4 py-2 rounded-full text-sm ${
                    selectedMonth === month
                      ? "bg-purple-500 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {formatMonthName(month)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <p className="p-4 text-center text-gray-500">טוען...</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="p-3 text-right">מדריך</th>
                  <th className="p-3 text-right">בית ספר</th>
                  <th className="p-3 text-right">עיר</th>
                  <th className="p-3 text-right">תאריך</th>
                  <th className="p-3 text-right">שעות</th>
                  <th className="p-3 text-right">הערות</th>
                  <th className="p-3 text-right">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-gray-400">
                      אין דיווחים
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="border-t hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{record.instructor_name}</div>
                          <div className="text-xs text-gray-400">{record.instructor_email}</div>
                        </div>
                      </td>
                      <td className="p-3">{record.school_name}</td>
                      <td className="p-3 text-sm text-gray-500">{record.city || "-"}</td>
                      <td className="p-3">{new Date(record.date).toLocaleDateString("he-IL")}</td>
                      <td className="p-3 font-semibold">{record.hours}</td>
                      <td className="p-3 text-sm">{record.notes || "-"}</td>
                      <td className="p-3">
                        <button
                          onClick={() => deleteRecord(record.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}







export default function AdminPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"attendance" | "admin-attendance" | "stats" | "users" | "schedules" | "settings">("attendance");
  const [selectedDay, setSelectedDay] = useState<string>("sunday");
  const [adminRecords, setAdminRecords] = useState<AdminAttendanceRecord[]>([]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [chatMessages, setChatMessages] = useState<{role: string; content: string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [showAiSettings, setShowAiSettings] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    school_name: "",
    city: "",
    class_name: "",
    activity_hours: "",
    hours_count: 1,
    instructor_id: "",
    instructor_name: "",
    instructor_email: "",
    day_of_week: "sunday",
  });

  const daysOfWeek = [
    { key: "sunday", label: "ראשון" },
    { key: "monday", label: "שני" },
    { key: "tuesday", label: "שלישי" },
    { key: "wednesday", label: "רביעי" },
    { key: "thursday", label: "חמישי" },
    { key: "friday", label: "שישי" },
  ];

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchRecords(),
      fetchAdminRecords(),
      fetchUsers(),
      fetchSchedules(),
      fetchSettings(),
    ]);
    setLoading(false);
  };

  const fetchRecords = async () => {
    try {
      const res = await fetch("/api/admin/attendance");
      const data = await res.json();
      if (Array.isArray(data)) setRecords(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchAdminRecords = async () => {
    try {
      const res = await fetch("/api/admin/admin-attendance");
      const data = await res.json();
      if (Array.isArray(data)) setAdminRecords(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await fetch("/api/admin/schedules");
      const data = await res.json();
      if (Array.isArray(data)) setSchedules(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (Array.isArray(data)) {
        setSettings(data);
        const prompt = data.find((s: Setting) => s.key === "ai_prompt");
        if (prompt) setAiPrompt(prompt.value);
        const key = data.find((s: Setting) => s.key === "openai_api_key");
        if (key) setApiKey(key.value);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "instructor" : "admin";
    if (!confirm(`האם להפוך משתמש זה ל${newRole === "admin" ? "מנהל" : "מדריך"}?`)) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newRole }),
      });
      if (res.ok) fetchUsers();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const deleteUser = async (userId: string, userName: string) => {
    if (!confirm(`האם להסיר את המשתמש "${userName}"?\nההיסטוריה שלו תישמר.`)) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || "שגיאה");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const addSchedule = async () => {
    if (!newSchedule.school_name.trim() || !newSchedule.city.trim() || !newSchedule.class_name.trim()) {
      alert("יש למלא שם בית ספר, עיר וכיתה");
      return;
    }

    try {
      const res = await fetch("/api/admin/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newSchedule,
          day_of_week: selectedDay,
        }),
      });
      if (res.ok) {
        setNewSchedule({
          school_name: "",
          city: "",
          class_name: "",
          activity_hours: "",
          hours_count: 1,
          instructor_id: "",
          instructor_name: "",
          instructor_email: "",
          day_of_week: selectedDay,
        });
        fetchSchedules();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const getFilteredSchedules = () => {
    return schedules.filter(s => s.day_of_week === selectedDay);
  };

  const deleteSchedule = async (id: string) => {
    if (!confirm("האם למחוק שורה זו?")) return;
    try {
      const res = await fetch(`/api/admin/schedules?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchSchedules();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleInstructorSelect = (instructorId: string) => {
    const instructor = users.find(u => u.id === instructorId);
    if (instructor) {
      setNewSchedule({
        ...newSchedule,
        instructor_id: instructor.id,
        instructor_name: instructor.full_name || "",
        instructor_email: instructor.email,
      });
    } else {
      setNewSchedule({
        ...newSchedule,
        instructor_id: "",
        instructor_name: "",
        instructor_email: "",
      });
    }
  };

  const saveAiPrompt = async () => {
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "ai_prompt", value: aiPrompt }),
      });
      if (res.ok) alert("הפרומפט נשמר בהצלחה!");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const saveApiKey = async () => {
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "openai_api_key", value: apiKey }),
      });
      if (res.ok) alert("מפתח API נשמר בהצלחה!");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !apiKey) {
      if (!apiKey) alert("יש להזין מפתח API קודם");
      return;
    }

    const userMessage = { role: "user", content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/admin/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: chatInput,
          apiKey,
          systemPrompt: aiPrompt,
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setChatMessages(prev => [...prev, { role: "assistant", content: data.response }]);
      } else {
        setChatMessages(prev => [...prev, { role: "assistant", content: "שגיאה: " + data.error }]);
      }
    } catch (error) {
      console.error("Error:", error);
      setChatMessages(prev => [...prev, { role: "assistant", content: "שגיאה בתקשורת עם ה-AI" }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6" dir="rtl">
      <Header userName="מנהל" isAdmin={true} />

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveTab("attendance")}
          className={`px-4 py-2 rounded-lg ${activeTab === "attendance" ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-50"}`}
        >
          📊 דיווחי נוכחות
        </button>

        <button
          onClick={() => setActiveTab("admin-attendance")}
          className={`px-4 py-2 rounded-lg ${activeTab === "admin-attendance" ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-50"}`}
        >
          📝 דיווח שעות
        </button>



        <button
          onClick={() => setActiveTab("stats")}
          className={`px-4 py-2 rounded-lg ${activeTab === "stats" ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-50"}`}
        >
          📈 סטטיסטיקות
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 rounded-lg ${activeTab === "users" ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-50"}`}
        >
          👥 משתמשים
        </button>

        <button
          onClick={() => setActiveTab("schedules")}
          className={`px-4 py-2 rounded-lg ${activeTab === "schedules" ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-50"}`}
        >
          📅 מערכת שעות
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-2 rounded-lg ${activeTab === "settings" ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-50"}`}
        >
          🤖 AI
        </button>
      </div>

      {activeTab === "attendance" && (
        <AttendanceTab records={records} loading={loading} onRefresh={fetchAllData} />
      )}

      {activeTab === "admin-attendance" && (
        <AdminAttendanceTab 
          records={adminRecords} 
          schedules={schedules}
          users={users}
          loading={loading} 
          onRefresh={fetchAllData} 
        />
      )}


      {activeTab === "stats" && (
        <StatsTab records={records} adminRecords={adminRecords} users={users} schedules={schedules} />
      )}

      {activeTab === "users" && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="font-bold text-lg">👥 ניהול משתמשים</h2>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="p-3 text-right">שם</th>
                  <th className="p-3 text-right">אימייל</th>
                  <th className="p-3 text-right">תפקיד</th>
                  <th className="p-3 text-right">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{user.full_name || "-"}</td>
                    <td className="p-3 text-sm text-gray-500">{user.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-sm ${user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}>
                        {user.role === "admin" ? "מנהל" : "מדריך"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleRole(user.id, user.role)}
                          className={`px-3 py-1 rounded text-sm ${user.role === "admin" ? "bg-orange-100 text-orange-800 hover:bg-orange-200" : "bg-green-100 text-green-800 hover:bg-green-200"}`}
                        >
                          {user.role === "admin" ? "הפוך למדריך" : "הפוך למנהל"}
                        </button>
                        <button
                          onClick={() => deleteUser(user.id, user.full_name || user.email)}
                          className="px-3 py-1 rounded text-sm bg-red-100 text-red-800 hover:bg-red-200"
                        >
                          🗑️ הסר
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "schedules" && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="p-4 bg-gray-50 border-b flex items-center justify-between gap-4">
            <h2 className="font-bold text-lg whitespace-nowrap">📅 מערכת שעות</h2>
            
            <div className="flex gap-1">
              {daysOfWeek.map((day) => (
                <button
                  key={day.key}
                  onClick={() => setSelectedDay(day.key)}
                  className={`px-3 py-1 rounded text-sm transition ${
                    selectedDay === day.key
                      ? "bg-blue-500 text-white"
                      : "bg-white hover:bg-gray-100 border"
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>

            <div className="text-sm text-gray-500 whitespace-nowrap">
              סה״כ: <span className="font-bold text-blue-600">{getFilteredSchedules().length}</span> שיעורים
            </div>
          </div>

          <div className="p-4 border-b bg-gray-50">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">בית ספר *</label>
                <input
                  type="text"
                  value={newSchedule.school_name}
                  onChange={(e) => setNewSchedule({ ...newSchedule, school_name: e.target.value })}
                  placeholder="שם בית הספר..."
                  className="p-2 border rounded text-sm w-32"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">עיר *</label>
                <input
                  type="text"
                  value={newSchedule.city}
                  onChange={(e) => setNewSchedule({ ...newSchedule, city: e.target.value })}
                  placeholder="עיר..."
                  className="p-2 border rounded text-sm w-28"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">כיתה/שכבה *</label>
                <input
                  type="text"
                  value={newSchedule.class_name}
                  onChange={(e) => setNewSchedule({ ...newSchedule, class_name: e.target.value })}
                  placeholder="למשל: ד׳-ו׳"
                  className="p-2 border rounded text-sm w-24"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">שעות פעילות</label>
                <input
                  type="text"
                  value={newSchedule.activity_hours}
                  onChange={(e) => setNewSchedule({ ...newSchedule, activity_hours: e.target.value })}
                  placeholder="למשל: 8:00-10:00"
                  className="p-2 border rounded text-sm w-28"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">מס׳ שעות</label>
                <input
                  type="number"
                  min="1"
                  value={newSchedule.hours_count}
                  onChange={(e) => setNewSchedule({ ...newSchedule, hours_count: parseInt(e.target.value) || 1 })}
                  className="p-2 border rounded text-sm w-16"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">מדריך</label>
                <select
                  value={newSchedule.instructor_id}
                  onChange={(e) => handleInstructorSelect(e.target.value)}
                  className="p-2 border rounded text-sm"
                >
                  <option value="">בחר מדריך...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name || user.email} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={addSchedule}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
              >
                ✓ הוסף ליום {daysOfWeek.find(d => d.key === selectedDay)?.label}
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="p-3 text-right">בית ספר</th>
                  <th className="p-3 text-right">עיר</th>
                  <th className="p-3 text-right">כיתה</th>
                  <th className="p-3 text-right">שעות פעילות</th>
                  <th className="p-3 text-right">מס׳ שעות</th>
                  <th className="p-3 text-right">מדריך</th>
                  <th className="p-3 text-right">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredSchedules().length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-gray-400">
                      אין שיעורים ביום {daysOfWeek.find(d => d.key === selectedDay)?.label}
                    </td>
                  </tr>
                ) : (
                  getFilteredSchedules().map((schedule) => (
                    <tr key={schedule.id} className="border-t hover:bg-gray-50">
                      <td className="p-3">{schedule.school_name}</td>
                      <td className="p-3 text-sm text-gray-500">{schedule.city}</td>
                      <td className="p-3">{schedule.class_name}</td>
                      <td className="p-3 text-sm">{schedule.activity_hours || "-"}</td>
                      <td className="p-3 font-semibold text-blue-600">{schedule.hours_count}</td>
                      <td className="p-3">
                        {schedule.instructor_name ? (
                          <div>
                            <div className="font-medium">{schedule.instructor_name}</div>
                            <div className="text-xs text-gray-400">{schedule.instructor_email}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => deleteSchedule(schedule.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          🗑️ מחק
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="space-y-6">
          {/* הגדרות */}
          <div className="bg-white rounded-lg border overflow-hidden">
            <div 
              className="p-4 bg-purple-50 border-b flex items-center justify-between cursor-pointer hover:bg-purple-100"
              onClick={() => setShowAiSettings(!showAiSettings)}
            >
              <h2 className="font-bold text-lg">🤖 הגדרות AI</h2>
              <span className="text-xl">{showAiSettings ? "▲" : "▼"}</span>
            </div>
            {showAiSettings && (
              <div className="p-4 space-y-4">
                {/* API Key */}
                <div>
                  <label className="block mb-2 font-semibold">מפתח OpenAI API:</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="flex-1 p-2 border rounded"
                    />
                    <button
                      onClick={saveApiKey}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      💾 שמור
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    ניתן להשיג מפתח מ-<a href="https://platform.openai.com/api-keys" target="_blank" className="text-blue-500 underline">OpenAI Platform</a>
                  </p>
                </div>

                {/* System Prompt */}
                <div>
                  <label className="block mb-2 font-semibold">פרומפט מערכת:</label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="w-full h-32 p-3 border rounded"
                    placeholder="הוראות ל-AI... לדוגמה: אתה עוזר למנהל מערכת נוכחות. ענה בעברית."
                  />
                  <button
                    onClick={saveAiPrompt}
                    className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    💾 שמור פרומפט
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* צ'אט */}
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="p-4 bg-blue-50 border-b">
              <h2 className="font-bold text-lg">💬 שאל את ה-AI על המערכת</h2>
            </div>
            
            {/* הודעות */}
            <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {chatMessages.length === 0 ? (
                <p className="text-center text-gray-400">
                  שאל כל שאלה על הנתונים במערכת...<br />
                  לדוגמה: "כמה שעות עבד יוסי בדצמבר?" או "מצא חריגות בדיווחים"
                </p>
              ) : (
                chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg max-w-[80%] ${
                      msg.role === "user"
                        ? "bg-blue-500 text-white mr-auto"
                        : "bg-white border mr-auto"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ))
              )}
              {chatLoading && (
                <div className="bg-white border p-3 rounded-lg max-w-[80%]">
                  <p className="text-gray-500">⏳ חושב...</p>
                </div>
              )}
            </div>

            {/* שדה קלט */}
            <div className="p-4 border-t flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                placeholder="הקלד שאלה..."
                className="flex-1 p-2 border rounded"
                disabled={chatLoading}
              />
              <button
                onClick={sendChatMessage}
                disabled={chatLoading || !apiKey}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
              >
                שלח
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}