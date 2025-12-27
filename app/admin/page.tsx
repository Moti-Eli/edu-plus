"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";

type AttendanceRecord = {
  id: string;
  school_name: string;
  city: string;
  date: string;
  start_time: string;
  end_time: string;
  hours: number;
  instructor_name?: string;
  profiles: {
    full_name: string;
    email: string;
  };
};

type User = {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "instructor";
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
// קומפוננטת טאב דיווחי נוכחות
function AttendanceTab({ records, loading }: { records: AttendanceRecord[]; loading: boolean }) {
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [filterUser, setFilterUser] = useState<string>("");
  const [filterCity, setFilterCity] = useState<string>("");
  const [filterSchool, setFilterSchool] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>("");

  const getMonths = () => {
    const months = new Set<string>();
    records.forEach((record) => {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      months.add(monthKey);
    });
    return Array.from(months).sort().reverse();
  };

  // רשימות ייחודיות לסינון
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

    // סינון לפי חודש
    if (selectedMonth) {
      filtered = filtered.filter((record) => {
        const date = new Date(record.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        return monthKey === selectedMonth;
      });
    }

    // סינון לפי משתמש
    if (filterUser) {
      filtered = filtered.filter((r) => r.profiles?.email === filterUser);
    }

    // סינון לפי עיר
    if (filterCity) {
      filtered = filtered.filter((r) => r.city === filterCity);
    }

    // סינון לפי בית ספר
    if (filterSchool) {
      filtered = filtered.filter((r) => r.school_name === filterSchool);
    }
   // סינון לפי תאריך
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

  const clearFilters = () => {
    setFilterUser("");
    setFilterCity("");
    setFilterSchool("");
    setFilterDate("");
  };


  const exportAttendanceCsv = () => {
    const { downloadCsv, arrayToCsv } = require("@/lib/exportCsv");
    
    const headers = ["שם", "אימייל", "תאריך", "בית ספר", "עיר", "שעת התחלה", "שעת סיום", "סה״כ שעות"];
    const rows = filteredRecords.map(record => [
      record.profiles?.full_name || "-",
      record.profiles?.email || "-",
      new Date(record.date).toLocaleDateString("he-IL"),
      record.school_name,
      record.city || "-",
      record.start_time?.slice(0, 5) || "-",
      record.end_time?.slice(0, 5) || "-",
      String(record.hours)
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
      {/* כותרת עם סטטיסטיקות */}

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

      {/* סינון */}
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

      {/* טבלה עם גלילה */}
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
                <th className="p-3 text-right">סה״כ</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-400">
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
                    <td className="p-3">{record.start_time?.slice(0, 5)} - {record.end_time?.slice(0, 5)}</td>
                    <td className="p-3 font-semibold">{record.hours}</td>
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
function StatsTab({ records, manualRecords }: { records: AttendanceRecord[]; manualRecords: AttendanceRecord[] }) {
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

  // חישוב שעות לפי מדריך
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

  // חישוב שעות לפי בית ספר
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


  // חישוב שעות לפי מדריך - מנוכחות מדריכים
const getManualInstructorStats = () => {
  const stats = new Map<string, { name: string; hours: number; reports: number }>();
  
  const filteredManual = manualRecords.filter((record) => {
    if (!selectedMonth) return true;
    const date = new Date(record.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    return monthKey === selectedMonth;
  });

  filteredManual.forEach((record) => {
    const name = record.instructor_name || "לא ידוע";
    
    if (!stats.has(name)) {
      stats.set(name, { name, hours: 0, reports: 0 });
    }
    
    const current = stats.get(name)!;
    current.hours += Number(record.hours);
    current.reports += 1;
  });

  return Array.from(stats.values()).sort((a, b) => b.hours - a.hours);
};

// חישוב שעות לפי בית ספר - מנוכחות מדריכים
const getManualSchoolStats = () => {
  const stats = new Map<string, { school: string; city: string; hours: number; reports: number }>();
  
  const filteredManual = manualRecords.filter((record) => {
    if (!selectedMonth) return true;
    const date = new Date(record.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    return monthKey === selectedMonth;
  });

  filteredManual.forEach((record) => {
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

  const months = getMonths();
  const filteredRecords = getFilteredRecords();
  const instructorStats = getInstructorStats();
  const schoolStats = getSchoolStats();
  const totalHours = filteredRecords.reduce((sum, r) => sum + Number(r.hours), 0);
  const manualInstructorStats = getManualInstructorStats();
  const manualSchoolStats = getManualSchoolStats();
  const exportAllStatsCsv = () => {
    const { downloadCsv } = require("@/lib/exportCsv");
    
    const monthName = selectedMonth ? formatMonthName(selectedMonth).replace(" ", "_") : "all";
    
    // טבלה 1: דיווחי נוכחות
    let csv = "=== דיווחי נוכחות ===\n";
    csv += "שם,אימייל,תאריך,בית ספר,עיר,שעות\n";
    filteredRecords.forEach(record => {
      csv += `"${record.profiles?.full_name || "-"}","${record.profiles?.email || "-"}","${new Date(record.date).toLocaleDateString("he-IL")}","${record.school_name}","${record.city || "-"}","${record.hours}"\n`;
    });
    
    // טבלה 2: שעות לפי מדריך
    csv += "\n=== שעות לפי מדריך ===\n";
    csv += "שם,אימייל,דיווחים,שעות\n";
    instructorStats.forEach(stat => {
      csv += `"${stat.name}","${stat.email}","${stat.reports}","${stat.hours}"\n`;
    });
    
    // טבלה 3: שעות לפי בית ספר
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
      {/* בחירת חודש */}
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
        {/* טבלת מדריכים */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="p-4 bg-purple-50 border-b flex items-center justify-between">
            <h2 className="font-bold text-lg">👥 שעות לפי מדריך</h2>
            <span className="text-sm text-gray-500">{instructorStats.length} מדריכים</span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="p-3 text-right">שם</th>
                  <th className="p-3 text-right">דיווחים</th>
                  <th className="p-3 text-right">שעות</th>
                </tr>
              </thead>
              <tbody>
                {instructorStats.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-gray-400">
                      אין נתונים בחודש זה
                    </td>
                  </tr>
                ) : (
                  instructorStats.map((stat, index) => (
                    <tr key={stat.email} className="border-t hover:bg-gray-50">
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
                      <td className="p-3 text-center">{stat.reports}</td>
                      <td className="p-3 font-bold text-blue-600">{stat.hours}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* טבלת בתי ספר */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="p-4 bg-orange-50 border-b flex items-center justify-between">
            <h2 className="font-bold text-lg">🏫 שעות לפי בית ספר</h2>
            <span className="text-sm text-gray-500">{schoolStats.length} בתי ספר</span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="p-3 text-right">בית ספר</th>
                  <th className="p-3 text-right">עיר</th>
                  <th className="p-3 text-right">דיווחים</th>
                  <th className="p-3 text-right">שעות</th>
                </tr>
              </thead>
              <tbody>
                {schoolStats.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-400">
                      אין נתונים בחודש זה
                    </td>
                  </tr>
                ) : (
                  schoolStats.map((stat, index) => (
                    <tr key={stat.school} className="border-t hover:bg-gray-50">
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
                      <td className="p-3 text-center">{stat.reports}</td>
                      <td className="p-3 font-bold text-orange-600">{stat.hours}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
{/* כותרת לטבלאות מנוכחות מדריכים */}
      <div className="mt-6 mb-4">
        <h2 className="font-bold text-lg text-gray-600">📝 מתוך נוכחות מדריכים (הזנה ידנית)</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* טבלת מדריכים - מנוכחות מדריכים */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="p-4 bg-indigo-50 border-b flex items-center justify-between">
            <h2 className="font-bold text-lg">👥 שעות לפי מדריך (ידני)</h2>
            <span className="text-sm text-gray-500">{manualInstructorStats.length} מדריכים</span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="p-3 text-right">שם</th>
                  <th className="p-3 text-right">דיווחים</th>
                  <th className="p-3 text-right">שעות</th>
                </tr>
              </thead>
              <tbody>
                {manualInstructorStats.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-gray-400">
                      אין נתונים בחודש זה
                    </td>
                  </tr>
                ) : (
                  manualInstructorStats.map((stat, index) => (
                    <tr key={stat.name} className="border-t hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${
                            index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : index === 2 ? "bg-orange-400" : "bg-gray-300"
                          }`}>
                            {index + 1}
                          </span>
                          <span className="font-medium">{stat.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center">{stat.reports}</td>
                      <td className="p-3 font-bold text-indigo-600">{stat.hours}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* טבלת בתי ספר - מנוכחות מדריכים */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="p-4 bg-teal-50 border-b flex items-center justify-between">
            <h2 className="font-bold text-lg">🏫 שעות לפי בית ספר (ידני)</h2>
            <span className="text-sm text-gray-500">{manualSchoolStats.length} בתי ספר</span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="p-3 text-right">בית ספר</th>
                  <th className="p-3 text-right">עיר</th>
                  <th className="p-3 text-right">דיווחים</th>
                  <th className="p-3 text-right">שעות</th>
                </tr>
              </thead>
              <tbody>
                {manualSchoolStats.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-400">
                      אין נתונים בחודש זה
                    </td>
                  </tr>
                ) : (
                  manualSchoolStats.map((stat, index) => (
                    <tr key={stat.school} className="border-t hover:bg-gray-50">
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
                      <td className="p-3 text-center">{stat.reports}</td>
                      <td className="p-3 font-bold text-teal-600">{stat.hours}</td>
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



export default function AdminPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [manualRecords, setManualRecords] = useState<AttendanceRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true); 
  const [activeTab, setActiveTab] = useState<"attendance" | "stats" | "users" | "schedules" | "settings">("attendance");
  // טפסים

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
  const [aiPrompt, setAiPrompt] = useState("");

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchRecords(),
      fetchManualRecords(),
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

  const fetchManualRecords = async () => {
    try {
      const res = await fetch("/api/admin/manual-attendance");
      const data = await res.json();
      if (Array.isArray(data)) setManualRecords(data);
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
          day_of_week: selectedDay,  // שולח את היום הנבחר
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

  const [selectedDay, setSelectedDay] = useState<string>("sunday");

  const daysOfWeek = [
    { key: "sunday", label: "ראשון" },
    { key: "monday", label: "שני" },
    { key: "tuesday", label: "שלישי" },
    { key: "wednesday", label: "רביעי" },
    { key: "thursday", label: "חמישי" },
    { key: "friday", label: "שישי" },
  ];




  return (
    <div className="min-h-screen bg-gray-100 p-6" dir="rtl">
      <Header userName="מנהל" isAdmin={true} />

      {/* טאבים */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveTab("attendance")}
          className={`px-4 py-2 rounded-lg ${activeTab === "attendance" ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-50"}`}
        >
          📊 דיווחי נוכחות
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
          ⚙️ הגדרות AI
        </button>
      </div>

      {/* דיווחי נוכחות */}
      {activeTab === "attendance" && (
        <AttendanceTab records={records} loading={loading} />
      )}

      {activeTab === "stats" && (
        <StatsTab records={records} manualRecords={manualRecords} />
      )}

      {/* משתמשים */}
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
                      <button
                        onClick={() => toggleRole(user.id, user.role)}
                        className={`px-3 py-1 rounded text-sm ${user.role === "admin" ? "bg-orange-100 text-orange-800 hover:bg-orange-200" : "bg-green-100 text-green-800 hover:bg-green-200"}`}
                      >
                        {user.role === "admin" ? "הפוך למדריך" : "הפוך למנהל"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}



      {/* מערכת שעות */}
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






          {/* טופס הוספה */}
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

          {/* טבלה */}
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

      {/* הגדרות AI */}
      {activeTab === "settings" && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="font-bold text-lg">⚙️ הגדרות AI</h2>
          </div>
          <div className="p-4">
            <label className="block mb-2 font-semibold">פרומפט למערכת AI:</label>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="w-full h-48 p-3 border rounded"
              placeholder="כתוב כאן את ההוראות ל-AI..."
            />
            <p className="text-sm text-gray-500 mt-2 mb-4">
              הפרומפט הזה יישלח ל-AI בכל שאילתה. הוא יכלול גם את רשימת המדריכים, הערים ובתי הספר.
            </p>
            <button
              onClick={saveAiPrompt}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              💾 שמור פרומפט
            </button>
          </div>
        </div>
      )}
    </div>
  );
}