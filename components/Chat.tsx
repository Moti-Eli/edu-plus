"use client";

import { useState, useEffect } from "react";

type Message = {
  id: number;
  text: string;
  sender: "user" | "system";
  time: string;
};

type AttendanceRecord = {
  id: string;
  school_name: string;
  city: string;
  date: string;
  start_time: string;
  end_time: string;
  hours: number;
  instructor_name?: string;
};

export default function Chat({ userName, isAdmin }: { userName?: string; isAdmin?: boolean }) {



  const getInitialMessage = (): Message => ({
    id: 1,
    text: isAdmin 
      ? "שלום! דווח על שעות העבודה של העובדים.\nלדוגמה: \"אורה לוי לימדה במודיעין בענבלים מ-8 עד 10\"\nאו: \"בתאריך 01.01.2025 אורה לוי לימדה במודיעין בענבלים מ-8 עד 10\""
      : "שלום! דווח על שעות העבודה שלך.\nלדוגמה: \"לימדתי במודיעין בענבלים מ-8 עד 10\"\nאו: \"בתאריך 01.01.2025 לימדתי במודיעין בענבלים מ-8 עד 10\"",
    sender: "system",
    time: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
  });

  const [messages, setMessages] = useState<Message[]>([getInitialMessage()]);





  const [input, setInput] = useState("");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  const storageKey = isAdmin ? "chat_history_admin" : "chat_history_instructor";

  const [showAddForm, setShowAddForm] = useState(false);
  const [newRecord, setNewRecord] = useState({
    date: new Date().toISOString().split("T")[0],
    school_name: "",
    city: "",
    start_time: "08:00",
    end_time: "10:00",
    instructor_name: "",
  });
  const [schools, setSchools] = useState<{ id: string; name: string; cities: { name: string } }[]>([]);

  // טעינת הודעות מ-LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch (e) {
        console.error("Error loading chat history:", e);
      }
    }
  }, []);

  // שמירת הודעות ל-LocalStorage
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, storageKey]);



  useEffect(() => {
    fetchRecords();
    fetchSchools();
  }, []);

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

  useEffect(() => {
    const months = getMonths();
    if (months.length > 0 && !selectedMonth) {
      setSelectedMonth(months[0]);
    }
  }, [records]);

  const fetchRecords = async () => {
    try {
      const res = await fetch("/api/attendance");
      const data = await res.json();
      if (Array.isArray(data)) {
        setRecords(data);
      }
    } catch (error) {
      console.error("Error fetching records:", error);
    }
  };


  const fetchSchools = async () => {
    try {
      const res = await fetch("/api/schools");
      const data = await res.json();
      if (Array.isArray(data)) {
        setSchools(data);
      }
    } catch (error) {
      console.error("Error fetching schools:", error);
    }
  };

  const deleteRecord = async (id: string) => {
    if (!confirm("האם למחוק את הרשומה?")) return;

    try {
      const res = await fetch(`/api/attendance/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchRecords();
        addSystemMessage("הרשומה נמחקה ✅");
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const newMessage: Message = {
      id: Date.now(),
      text: input,
      sender: "user",
      time: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    // ניקוי הטקסט - הסרת רווחים מיותרים
    const cleanInput = input.trim().replace(/\s+/g, " ");
    
    let instructorName = "";
    let city = "";
    let school = "";
    let startHour = "";
    let endHour = "";
    let recordDate = new Date().toISOString().split("T")[0]; // ברירת מחדל: היום

    // בדיקה אם יש תאריך בהודעה
    const dateMatch = cleanInput.match(/בתאריך\s+(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})/i);
    let textWithoutDate = cleanInput;
    
    if (dateMatch) {
      const day = dateMatch[1].padStart(2, "0");
      const month = dateMatch[2].padStart(2, "0");
      const year = dateMatch[3];
      recordDate = `${year}-${month}-${day}`;
      // הסרת התאריך מהטקסט להמשך עיבוד
      textWithoutDate = cleanInput.replace(/בתאריך\s+\d{1,2}[.\/]\d{1,2}[.\/]\d{4}\s*/i, "").trim();
    }

    if (isAdmin) {
      // פורמט מנהל: "אורה לוי לימד/לימדה במודיעין בענבלים מ-8 עד 10"
      const adminMatch = textWithoutDate.match(
        /^(.+?)\s+(?:לימד|לימדה|עבד|עבדה|הדריך|הדריכה)\s+ב(.+?)\s+ב(.+?)\s+מ[־\-]?\s*(\d{1,2})\s+עד\s+(\d{1,2})$/i
      );
      
      if (adminMatch) {
        instructorName = adminMatch[1].trim();
        city = adminMatch[2].trim();
        school = adminMatch[3].trim();
        startHour = adminMatch[4].padStart(2, "0");
        endHour = adminMatch[5].padStart(2, "0");
      }
    } else {
      // פורמט מדריך: "לימדתי במודיעין בענבלים מ-8 עד 10"
      const instructorMatch = textWithoutDate.match(
        /(?:לימדתי|עבדתי|הדרכתי)\s+ב(.+?)\s+ב(.+?)\s+מ[־\-]?\s*(\d{1,2})\s+עד\s+(\d{1,2})$/i
      );
      
      if (instructorMatch) {
        city = instructorMatch[1].trim();
        school = instructorMatch[2].trim();
        startHour = instructorMatch[3].padStart(2, "0");
        endHour = instructorMatch[4].padStart(2, "0");
      }
    }

    // בדיקה שכל הנתונים נמצאו
    if (city && school && startHour && endHour && (!isAdmin || instructorName)) {
      const hours = parseInt(endHour) - parseInt(startHour);

      if (hours <= 0) {
        addSystemMessage("❌ שעת הסיום חייבת להיות אחרי שעת ההתחלה");
        setLoading(false);
        return;
      }

      // בדיקת תקינות תאריך
      const dateObj = new Date(recordDate);
      if (isNaN(dateObj.getTime())) {
        addSystemMessage("❌ התאריך לא תקין");
        setLoading(false);
        return;
      }

      try {
        const body: Record<string, unknown> = {
          school_name: school,
          city: city,
          date: recordDate,
          start_time: `${startHour}:00`,
          end_time: `${endHour}:00`,
          hours,
        };

        // אם מנהל - נוסיף את שם המדריך
        if (isAdmin && instructorName) {
          body.instructor_name = instructorName;
        }

        const res = await fetch("/api/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (res.ok) {
          await fetchRecords();
          const formattedDate = new Date(recordDate).toLocaleDateString("he-IL");
          const dateText = recordDate === new Date().toISOString().split("T")[0] ? "" : ` (${formattedDate})`;
          
          if (isAdmin) {
            addSystemMessage(`✅ נרשמו ${hours} שעות ל${instructorName} ב${school} ב${city}${dateText}`);
          } else {
            addSystemMessage(`✅ מעולה! נרשמו ${hours} שעות ב${school} ב${city}${dateText}`);
          }
        } else {
          addSystemMessage("❌ שגיאה בשמירה, נסה שוב");
        }
      } catch {
        addSystemMessage("❌ שגיאה בחיבור לשרת");
      }
    } else {
      // הודעת שגיאה מותאמת
      if (isAdmin) {
        addSystemMessage("🤔 לא הבנתי. נסה בפורמט:\n\"אורה לוי לימדה במודיעין בענבלים מ-8 עד 10\"\nאו עם תאריך:\n\"בתאריך 01.01.2025 אורה לוי לימדה במודיעין בענבלים מ-8 עד 10\"");
      } else {
        addSystemMessage("🤔 לא הבנתי. נסה בפורמט:\n\"לימדתי במודיעין בענבלים מ-8 עד 10\"\nאו עם תאריך:\n\"בתאריך 01.01.2025 לימדתי במודיעין בענבלים מ-8 עד 10\"");
      }
    }

    setLoading(false);
  };

  const addSystemMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text,
        sender: "system",
        time: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const exportMyCsv = () => {
    const { downloadCsv, arrayToCsv } = require("@/lib/exportCsv");
    
    const headers = ["תאריך", "בית ספר", "עיר", "שעת התחלה", "שעת סיום", "סה״כ שעות"];
    const rows = filteredRecords.map(record => [
      new Date(record.date).toLocaleDateString("he-IL"),
      record.school_name,
      record.city || "-",
      record.start_time?.slice(0, 5) || "-",
      record.end_time?.slice(0, 5) || "-",
      String(record.hours)
    ]);

    const csv = arrayToCsv(headers, rows);
    const monthName = selectedMonth ? formatMonthName(selectedMonth).replace(" ", "_") : "all";
    downloadCsv(`הנוכחות_שלי_${monthName}.csv`, csv);
  };

  const handleAddRecord = async () => {
    const start = parseInt(newRecord.start_time.split(":")[0]);
    const end = parseInt(newRecord.end_time.split(":")[0]);
    const hours = end - start;

    if (hours <= 0) {
      alert("שעת הסיום חייבת להיות אחרי שעת ההתחלה");
      return;
    }

    if (!newRecord.school_name || !newRecord.city) {
      alert("יש לבחור בית ספר");
      return;
    }

    if (isAdmin && !newRecord.instructor_name.trim()) {
      alert("יש להזין שם מדריך");
      return;
    }

    try {
      const body: Record<string, unknown> = {
        school_name: newRecord.school_name,
        city: newRecord.city,
        date: newRecord.date,
        start_time: newRecord.start_time,
        end_time: newRecord.end_time,
        hours,
      };

      if (isAdmin && newRecord.instructor_name) {
        body.instructor_name = newRecord.instructor_name;
      }

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await fetchRecords();
        setShowAddForm(false);
        setNewRecord({
          date: new Date().toISOString().split("T")[0],
          school_name: "",
          city: "",
          start_time: "08:00",
          end_time: "10:00",
          instructor_name: "",
        });
        addSystemMessage(`✅ נוספה רשומה חדשה!`);
      }
    } catch (error) {
      console.error("Error adding record:", error);
    }
  };

  const handleSchoolChange = (schoolName: string) => {
    const school = schools.find(s => s.name === schoolName);
    setNewRecord({
      ...newRecord,
      school_name: schoolName,
      city: school?.cities?.name || "",
    });
  };

  const months = getMonths();
  const filteredRecords = getFilteredRecords();
  const totalHours = filteredRecords.reduce((sum, r) => sum + Number(r.hours), 0);

  return (
    <div className="flex gap-6 h-[600px]">
      {/* טבלה - צד ימין */}
      <div className="w-1/2 bg-white rounded-lg border overflow-hidden flex flex-col">


          <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-lg">{isAdmin ? "📊 נוכחות מדריכים" : "📊 הנוכחות שלי"}</h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {showAddForm ? "✕ ביטול" : "➕ הוסף"}
              </button>
              <button
                onClick={() => exportMyCsv()}
                className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
              >
                📥 ייצוא
              </button>
            </div>


          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-gray-500">שעות:</span>
              <span className="font-bold text-blue-600">{totalHours}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-500">דיווחים:</span>
              <span className="font-bold text-green-600">{filteredRecords.length}</span>
            </div>
            {isAdmin && (
              <>
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">מדריכים:</span>
                  <span className="font-bold text-purple-600">
                    {new Set(filteredRecords.map((r) => r.instructor_name)).size}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">בתי ספר:</span>
                  <span className="font-bold text-orange-600">
                    {new Set(filteredRecords.map((r) => r.school_name)).size}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>


        {/* טופס הוספה */}
        {showAddForm && (
          <div className="p-4 border-b bg-blue-50">
            <div className="flex flex-wrap gap-3 items-end">
              {isAdmin && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">שם מדריך</label>
                  <input
                    type="text"
                    value={newRecord.instructor_name}
                    onChange={(e) => setNewRecord({ ...newRecord, instructor_name: e.target.value })}
                    placeholder="שם המדריך..."
                    className="p-2 border rounded text-sm w-32"
                  />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">תאריך</label>
                <input
                  type="date"
                  value={newRecord.date}
                  onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                  className="p-2 border rounded text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">בית ספר</label>
                <select
                  value={newRecord.school_name}
                  onChange={(e) => handleSchoolChange(e.target.value)}
                  className="p-2 border rounded text-sm"
                >
                  <option value="">בחר בית ספר...</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.name}>
                      {school.name} - {school.cities?.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">עיר</label>
                <input
                  type="text"
                  value={newRecord.city}
                  readOnly
                  className="p-2 border rounded text-sm w-24 bg-gray-100"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">משעה</label>
                <input
                  type="time"
                  value={newRecord.start_time}
                  onChange={(e) => setNewRecord({ ...newRecord, start_time: e.target.value })}
                  className="p-2 border rounded text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">עד שעה</label>
                <input
                  type="time"
                  value={newRecord.end_time}
                  onChange={(e) => setNewRecord({ ...newRecord, end_time: e.target.value })}
                  className="p-2 border rounded text-sm"
                />
              </div>
              <button
                onClick={handleAddRecord}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
              >
                ✓ שמור
              </button>
            </div>
          </div>
        )}







        {/* בחירת חודש */}
        {months.length > 0 && (
          <div className="p-2 border-b overflow-x-auto whitespace-nowrap">
            <div className="flex gap-2">
              {months.map((month) => (
                <button
                  key={month}
                  onClick={() => setSelectedMonth(month)}
                  className={`px-3 py-1 rounded-full text-sm ${
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

        {/* טבלה עם גלילה */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                {userName && <th className="p-2 text-right text-sm">שם</th>}
                <th className="p-2 text-right text-sm">תאריך</th>
                <th className="p-2 text-right text-sm">בית ספר</th>
                <th className="p-2 text-right text-sm">עיר</th>
                <th className="p-2 text-right text-sm">שעות</th>
                <th className="p-2 text-right text-sm">מחק</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={userName ? 6 : 5} className="p-4 text-center text-gray-400">
                    אין רשומות בחודש זה
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="border-t">
                    {userName && <td className="p-2 text-sm">{record.instructor_name || userName}</td>}
                    <td className="p-2 text-sm">{new Date(record.date).toLocaleDateString("he-IL")}</td>
                    <td className="p-2 text-sm">{record.school_name}</td>
                    <td className="p-2 text-sm">{record.city || "-"}</td>
                    <td className="p-2 text-sm">
                      {record.start_time?.slice(0, 5)} - {record.end_time?.slice(0, 5)} ({record.hours})
                    </td>
                    <td className="p-2 text-sm">
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
        </div>
      </div>

      {/* צ'אט - צד שמאל */}
      <div className="w-1/2 flex flex-col bg-white rounded-lg border overflow-hidden">



        <div className="p-4 bg-blue-500 text-white flex justify-between items-center">
          <h2 className="font-bold">💬 דיווח נוכחות</h2>
          <button
            onClick={() => {
              if (confirm("למחוק את היסטוריית הצ'אט?")) {
                setMessages([getInitialMessage()]);
                localStorage.removeItem(storageKey);
              }
            }}
            className="text-xs opacity-70 hover:opacity-100"
          >
            🗑️ נקה
          </button>
        </div>




        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-100">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.sender === "user"
                    ? "bg-green-500 text-white rounded-br-none"
                    : "bg-white rounded-bl-none shadow"
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>
                <span className="text-xs opacity-70 block mt-1">{msg.time}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t bg-white flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="כתוב כאן..."
            className="flex-1 p-2 border rounded-full px-4"
            dir="rtl"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="w-10 h-10 bg-green-500 text-white rounded-full hover:bg-green-600 flex items-center justify-center disabled:opacity-50"
          >
            {loading ? "..." : "➤"}
          </button>
        </div>
      </div>
    </div>
  );
}