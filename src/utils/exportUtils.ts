import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Transaction {
  id: string;
  plate_number: string;
  vehicle_type: string;
  entry_time: string;
  exit_time: string | null;
  duration_hours: number | null;
  amount: number;
  status: string;
  created_at: string;
}

interface ReportData {
  transactions: Transaction[];
  period: string;
  totalRevenue: number;
  totalTransactions: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
};

export const exportToExcel = (data: ReportData, fileName: string = "laporan-parkir") => {
  // Prepare transaction data
  const transactionRows = data.transactions.map((tx, index) => ({
    "No": index + 1,
    "Plat Nomor": tx.plate_number,
    "Jenis Kendaraan": tx.vehicle_type === "motor" ? "Motor" : "Mobil",
    "Waktu Masuk": format(new Date(tx.entry_time), "dd/MM/yyyy HH:mm", { locale: id }),
    "Waktu Keluar": tx.exit_time ? format(new Date(tx.exit_time), "dd/MM/yyyy HH:mm", { locale: id }) : "-",
    "Durasi (Jam)": tx.duration_hours || 0,
    "Biaya": formatCurrency(tx.amount || 0),
    "Status": tx.status === "completed" ? "Selesai" : "Parkir"
  }));

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryData = [
    ["LAPORAN PARKIR E-PARKING"],
    [],
    ["Periode", data.period],
    ["Total Pendapatan", formatCurrency(data.totalRevenue)],
    ["Total Transaksi", data.totalTransactions.toString()],
    ["Tanggal Export", format(new Date(), "dd MMMM yyyy HH:mm", { locale: id })]
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, "Ringkasan");

  // Transactions sheet
  const transactionSheet = XLSX.utils.json_to_sheet(transactionRows);
  XLSX.utils.book_append_sheet(wb, transactionSheet, "Transaksi");

  // Auto-size columns
  const maxWidths = Object.keys(transactionRows[0] || {}).map(key => ({
    wch: Math.max(key.length, 15)
  }));
  transactionSheet["!cols"] = maxWidths;

  // Download file
  XLSX.writeFile(wb, `${fileName}-${format(new Date(), "yyyyMMdd")}.xlsx`);
};

export const exportToPDF = (data: ReportData, fileName: string = "laporan-parkir") => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("LAPORAN PARKIR E-PARKING", 105, 20, { align: "center" });

  // Subtitle
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Periode: ${data.period}`, 105, 30, { align: "center" });

  // Summary box
  doc.setDrawColor(200);
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(14, 40, 182, 30, 3, 3, "FD");

  doc.setFontSize(10);
  doc.text("Total Pendapatan", 30, 52);
  doc.setFont("helvetica", "bold");
  doc.text(formatCurrency(data.totalRevenue), 30, 60);

  doc.setFont("helvetica", "normal");
  doc.text("Total Transaksi", 100, 52);
  doc.setFont("helvetica", "bold");
  doc.text(data.totalTransactions.toString(), 100, 60);

  doc.setFont("helvetica", "normal");
  doc.text("Tanggal Export", 160, 52);
  doc.setFont("helvetica", "bold");
  doc.text(format(new Date(), "dd/MM/yyyy"), 160, 60);

  // Table
  const tableData = data.transactions.map((tx, index) => [
    index + 1,
    tx.plate_number,
    tx.vehicle_type === "motor" ? "Motor" : "Mobil",
    format(new Date(tx.entry_time), "dd/MM HH:mm"),
    tx.exit_time ? format(new Date(tx.exit_time), "dd/MM HH:mm") : "-",
    tx.duration_hours ? `${tx.duration_hours}h` : "-",
    formatCurrency(tx.amount || 0),
    tx.status === "completed" ? "Selesai" : "Parkir"
  ]);

  autoTable(doc, {
    startY: 80,
    head: [["No", "Plat Nomor", "Jenis", "Masuk", "Keluar", "Durasi", "Biaya", "Status"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [44, 62, 80],
      textColor: 255,
      fontSize: 9,
      halign: "center"
    },
    bodyStyles: {
      fontSize: 8,
      halign: "center"
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 25 },
      6: { halign: "right" }
    }
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Halaman ${i} dari ${pageCount} | E-Parking Management System`,
      105,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );
  }

  // Download
  doc.save(`${fileName}-${format(new Date(), "yyyyMMdd")}.pdf`);
};
