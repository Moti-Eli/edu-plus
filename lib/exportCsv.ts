// פונקציה להורדת CSV
export function downloadCsv(filename: string, csvContent: string) {
  // הוספת BOM לתמיכה בעברית באקסל
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// המרת מערך לפורמט CSV
export function arrayToCsv(headers: string[], rows: string[][]): string {
  const headerLine = headers.join(",");
  const dataLines = rows.map(row => 
    row.map(cell => `"${(cell || "").replace(/"/g, '""')}"`).join(",")
  );
  return [headerLine, ...dataLines].join("\n");
}