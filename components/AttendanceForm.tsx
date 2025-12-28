"use client";

import { useState, useEffect } from "react";

type Schedule = {
  id: string;
  school_name: string;
  city: string;
  hours_count: number;
  day_of_week: string;
};

type AttendanceRecord = {
  id: string;
  school_name: string;
  city: string;
  date: string;
  hours: number;
  notes: string;
  admin_notes: string;
};

type NewRecord = {
  school_name: string;
  city: string;
  date: string;
  hours: number;
  notes: string;
};

type School = {
  school_name: string;
  city: string;
};

export default function AttendanceForm() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [newRows, setNewRows] = useState<NewRecord[]>([]);
  const [allSchools, setAllSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  const getDayOfWeek = (date: Date) => {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    return days[date.getDay()];
  };

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const currentDay = getDayOfWeek(today);

  const hebrewDays: { [key: string]: string } = {
    sunday: "ראשון",
    monday: "שני",
    tuesday: "שלישי",
    wednesday: "רביעי",
    thursday: "חמישי",
    friday: "שישי",
  };

  // בדיקה אם תאריך הוא מהחודש הנוכחי
  const isCurrentMonth = (date: string) => {
    const recordDate = new Date(date);
    const now = new Date();
    return recordDate.getMonth() === now.getMonth() && 
           recordDate.getFullYear() === now.getFullYear();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([fetchRecords(), fetchSchedules(), fetchAllSchools()]);
    setLoading(false);
  };

  const fetchRecords = async () => {
    try {
      const res = await fetch("/api/attendance");
      const data = await res.json();
      if (Array.isArray(data)) setRecords(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await fetch("/api/instructor/schedules");
      const data = await res.json();
      if (Array.isArray(data)) {
        setSchedules(data);
        const todaySchedules = data.filter((s: Schedule) => s.day_of_week === currentDay);
        if (todaySchedules.length > 0) {
          setNewRows(
            todaySchedules.map((s: Schedule) => ({
              school_name: s.school_name,
              city: s.city,
              date: todayStr,
              hours: s.hours_count,
              notes: "",
            }))
          );
        } else {
          setNewRows([{ school_name: "", city: "", date: todayStr, hours: 1, notes: "" }]);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setNewRows([{ school_name: "", city: "", date: todayStr, hours: 1, notes: "" }]);
    }
  };

  const fetchAllSchools = async () => {
    try {
      const res = await fetch("/api/schools");
      const data = await res.json();
      if (Array.isArray(data)) {
        const schools = data.map((s: any) => ({
          school_name: s.name,
          city: s.cities?.name || "",
        }));
        setAllSchools(schools);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleRowChange = (index: number, field: keyof NewRecord, value: string | number) => {
    const updated = [...newRows];
    updated[index] = { ...updated[index], [field]: value };

    // אם שינו בית ספר - עדכן עיר אוטומטית
    if (field === "school_name") {
      const school = allSchools.find((s) => s.school_name === value);
      if (school) {
        updated[index].city = school.city;
      }
    }

    // אם שינו תאריך - עדכן לפי המערכת של אותו יום
    if (field === "date") {
      const newDate = new Date(value as string);
      const newDay = getDayOfWeek(newDate);
      const daySchedule = schedules.find((s) => s.day_of_week === newDay);
      if (daySchedule) {
        updated[index].school_name = daySchedule.school_name;
        updated[index].city = daySchedule.city;
        updated[index].hours = daySchedule.hours_count;
      }
    }

    setNewRows(updated);
  };

  const submitRow = async (index: number) => {
    const row = newRows[index];
    if (!row.school_name || !row.city || !row.date || row.hours <= 0) {
      alert("יש למלא את כל השדות");
      return;
    }

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          school_name: row.school_name,
          city: row.city,
          date: row.date,
          hours: row.hours,
          notes: row.notes,
        }),
      });

      if (res.ok) {
        fetchRecords();
        const daySchedule = schedules.find((s) => s.day_of_week === currentDay);
        const updated = [...newRows];
        updated[index] = {
          school_name: daySchedule?.school_name || "",
          city: daySchedule?.city || "",
          date: todayStr,
          hours: daySchedule?.hours_count || 1,
          notes: "",
        };
        setNewRows(updated);
      } else {
        const data = await res.json();
        alert(data.error || "שגיאה בשמירה");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const deleteRecord = async (id: string) => {
    if (!confirm("למחוק דיווח זה?")) return;
    try {
      const res = await fetch(`/api/attendance?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchRecords();
      } else {
        const data = await res.json();
        alert(data.error || "שגיאה במחיקה");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const getMonths = () => {
    const months = new Set<string>();
    records.forEach((record) => {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      months.add(monthKey);
    });
    return Array.from(months).sort().reverse();
  };

  const formatMonthName = (monthKey: string) => {
    const [year, month] = monthKey.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("he-IL", { month: "long", year: "numeric" });
  };

  const getFilteredRecords = () => {
    if (!selectedMonth) return records;
    return records.filter((record) => {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      return monthKey === selectedMonth;
    });
  };

  const months = getMonths();
  const filteredRecords = getFilteredRecords();
  const totalHours = filteredRecords.reduce((sum, r) => sum + Number(r.hours), 0);

  useEffect(() => {
    if (months.length > 0 && !selectedMonth) {
      setSelectedMonth(months[0]);
    }
  }, [records, months.length]);

  if (loading) {
    return <div className="text-center p-8">טוען...</div>;
  }

  const exportCsv = () => {
    const headers = ["תאריך", "בית ספר", "עיר", "שעות", "הערות"];
    const rows = filteredRecords.map(record => [
      new Date(record.date).toLocaleDateString("he-IL"),
      record.school_name,
      record.city || "-",
      String(record.hours),
      record.notes || "-"
    ]);

    let csv = "\uFEFF" + headers.join(",") + "\n";
    rows.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `דיווחי_נוכחות_${selectedMonth || "all"}.csv`;
    link.click();
  };

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="p-4 bg-blue-50 border-b flex items-center justify-between">
        <h2 className="font-bold text-lg">📝 דיווח נוכחות - יום {hebrewDays[currentDay]}</h2>
        <button
          onClick={exportCsv}
          className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
        >
          📥 ייצוא
        </button>
      </div>

      <div className="p-4 bg-gray-50 border-b space-y-3">
        {newRows.map((row, index) => (
          <div key={index} className="flex flex-wrap gap-3 items-end p-3 bg-white rounded border">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">תאריך</label>
              <input
                type="date"
                value={row.date}
                onChange={(e) => handleRowChange(index, "date", e.target.value)}
                min={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`}
                className="p-1 border rounded text-sm"
              />
            </div>

            <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
              <label className="text-xs text-gray-500">בית ספר</label>
              <input
                type="text"
                value={row.school_name}
                onChange={(e) => handleRowChange(index, "school_name", e.target.value)}
                list={`schools-${index}`}
                placeholder="הקלד לחיפוש..."
                className="p-2 border rounded text-sm"
              />
              <datalist id={`schools-${index}`}>
                {allSchools.map((s, i) => (
                  <option key={i} value={s.school_name}>
                    {s.city}
                  </option>
                ))}
              </datalist>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">עיר</label>
              <input
                type="text"
                value={row.city}
                onChange={(e) => handleRowChange(index, "city", e.target.value)}
                className="p-2 border rounded text-sm w-28"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">שעות</label>
              <input
                type="number"
                min="1"
                value={row.hours}
                onChange={(e) => handleRowChange(index, "hours", parseInt(e.target.value) || 1)}
                className="p-2 border rounded text-sm w-16"
              />
            </div>

            <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
              <label className="text-xs text-gray-500">הערות</label>
              <input
                type="text"
                value={row.notes}
                onChange={(e) => handleRowChange(index, "notes", e.target.value)}
                placeholder="הערות..."
                className="p-2 border rounded text-sm"
              />
            </div>

            <button
              onClick={() => submitRow(index)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            >
              ✓ שמור
            </button>
          </div>
        ))}
      </div>

      {months.length > 0 && (
        <div className="p-3 border-b flex items-center justify-between">
          <div className="flex gap-2 overflow-x-auto">
            {months.map((month) => (
              <button
                key={month}
                onClick={() => setSelectedMonth(month)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                  selectedMonth === month
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {formatMonthName(month)}
              </button>
            ))}
          </div>
          <div className="text-sm text-gray-500 whitespace-nowrap mr-4">
            סה״כ: <span className="font-bold text-blue-600">{totalHours}</span> שעות
          </div>
        </div>
      )}

      <div className="max-h-96 overflow-y-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="p-3 text-right">תאריך</th>
              <th className="p-3 text-right">בית ספר</th>
              <th className="p-3 text-right">עיר</th>
              <th className="p-3 text-right">שעות</th>
              <th className="p-3 text-right">הערות</th>
              <th className="p-3 text-right">הערות מנהל</th>
              <th className="p-3 text-right">פעולות</th>
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
                  <td className="p-3">{new Date(record.date).toLocaleDateString("he-IL")}</td>
                  <td className="p-3">{record.school_name}</td>
                  <td className="p-3 text-sm text-gray-500">{record.city}</td>
                  <td className="p-3 font-semibold">{record.hours}</td>
                  <td className="p-3 text-sm">{record.notes || "-"}</td>
                  <td className="p-3 text-sm text-purple-600">{record.admin_notes || "-"}</td>
                  <td className="p-3">
                    {isCurrentMonth(record.date) ? (
                      <button
                        onClick={() => deleteRecord(record.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        🗑️
                      </button>
                    ) : (
                      <span className="text-gray-300 cursor-not-allowed" title="לא ניתן למחוק דיווחים מחודשים קודמים">
                        🔒
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}