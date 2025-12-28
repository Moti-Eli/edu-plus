"use client";

import { useState, useEffect } from "react";

type Schedule = {
  id: string;
  school_name: string;
  city: string;
  hours_count: number;
  day_of_week: string;
  instructor_id: string;
  instructor_name: string;
  instructor_email: string;
};

type NewRecord = {
  instructor_id: string;
  instructor_name: string;
  school_name: string;
  city: string;
  date: string;
  hours: number;
  notes: string;
  selected: boolean;
};

type Props = {
  onRecordAdded: () => void;
};

export default function AdminAttendanceForm({ onRecordAdded }: Props) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [todayRecords, setTodayRecords] = useState<NewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await fetch("/api/admin/schedules");
      const data = await res.json();
      if (Array.isArray(data)) {
        setSchedules(data);
        const todaySchedules = data.filter((s: Schedule) => s.day_of_week === currentDay);
        setTodayRecords(
          todaySchedules.map((s: Schedule) => ({
            instructor_id: s.instructor_id,
            instructor_name: s.instructor_name,
            school_name: s.school_name,
            city: s.city,
            date: todayStr,
            hours: s.hours_count,
            notes: "",
            selected: true,
          }))
        );
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index: number, field: keyof NewRecord, value: string | number | boolean) => {
    const updated = [...todayRecords];
    updated[index] = { ...updated[index], [field]: value };
    setTodayRecords(updated);
  };

  const toggleAll = (checked: boolean) => {
    setTodayRecords(todayRecords.map(r => ({ ...r, selected: checked })));
  };

  const submitOne = async (index: number) => {
    const record = todayRecords[index];
    try {
      const res = await fetch("/api/admin/manual-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructor_name: record.instructor_name,
          school_name: record.school_name,
          city: record.city,
          date: record.date,
          hours: record.hours,
          notes: record.notes,
        }),
      });
      if (res.ok) {
        const updated = [...todayRecords];
        updated.splice(index, 1);
        setTodayRecords(updated);
        onRecordAdded();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const submitAll = async () => {
    const selectedRecords = todayRecords.filter(r => r.selected);
    if (selectedRecords.length === 0) {
      alert("לא נבחרו רשומות");
      return;
    }

    setSubmitting(true);
    try {
      for (const record of selectedRecords) {
        await fetch("/api/admin/manual-attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instructor_name: record.instructor_name,
            school_name: record.school_name,
            city: record.city,
            date: record.date,
            hours: record.hours,
            notes: record.notes,
          }),
        });
      }
      setTodayRecords(todayRecords.filter(r => !r.selected));
      onRecordAdded();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center p-4">טוען מערכת שעות...</div>;
  }

  if (todayRecords.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center text-yellow-700">
        אין מערכת שעות ליום {hebrewDays[currentDay]}
      </div>
    );
  }

  const selectedCount = todayRecords.filter(r => r.selected).length;

  return (
    <div className="bg-white rounded-lg border overflow-hidden mb-6">
      <div className="p-4 bg-green-50 border-b flex items-center justify-between">
        <h2 className="font-bold text-lg">➕ הוספה מהירה - יום {hebrewDays[currentDay]}</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {selectedCount} מתוך {todayRecords.length} נבחרו
          </span>
          <button
            onClick={submitAll}
            disabled={submitting || selectedCount === 0}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {submitting ? "שומר..." : `✓ הוסף ${selectedCount} נבחרים`}
          </button>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="p-2 text-right w-10">
                <input
                  type="checkbox"
                  checked={selectedCount === todayRecords.length}
                  onChange={(e) => toggleAll(e.target.checked)}
                  className="w-4 h-4"
                />
              </th>
              <th className="p-2 text-right">מדריך</th>
              <th className="p-2 text-right">תאריך</th>
              <th className="p-2 text-right">בית ספר</th>
              <th className="p-2 text-right">עיר</th>
              <th className="p-2 text-right">שעות</th>
              <th className="p-2 text-right">הערות</th>
              <th className="p-2 text-right">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {todayRecords.map((record, index) => (
              <tr key={index} className={`border-t ${record.selected ? "bg-green-50" : ""}`}>
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={record.selected}
                    onChange={(e) => handleChange(index, "selected", e.target.checked)}
                    className="w-4 h-4"
                  />
                </td>
                <td className="p-2 font-medium">{record.instructor_name}</td>
                <td className="p-2">
                  <input
                    type="date"
                    value={record.date}
                    onChange={(e) => handleChange(index, "date", e.target.value)}
                    className="p-1 border rounded text-sm w-32"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={record.school_name}
                    onChange={(e) => handleChange(index, "school_name", e.target.value)}
                    className="p-1 border rounded text-sm w-28"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={record.city}
                    onChange={(e) => handleChange(index, "city", e.target.value)}
                    className="p-1 border rounded text-sm w-20"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    min="1"
                    value={record.hours}
                    onChange={(e) => handleChange(index, "hours", parseInt(e.target.value) || 1)}
                    className="p-1 border rounded text-sm w-14"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={record.notes}
                    onChange={(e) => handleChange(index, "notes", e.target.value)}
                    placeholder="הערות..."
                    className="p-1 border rounded text-sm w-24"
                  />
                </td>
                <td className="p-2">
                  <button
                    onClick={() => submitOne(index)}
                    className="text-green-600 hover:text-green-800 text-sm"
                  >
                    ✓ הוסף
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}