'use client';

import React, { useState, useRef } from 'react';
import {
  Search,
  DollarSign,
  Printer,
  Calendar,
  CreditCard,
  User,
  Activity,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Receipt,
  Download,
} from 'lucide-react';

export default function FeesCollectionPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  
  // Payment Form States
  const [selectedInstallment, setSelectedInstallment] = useState<any | null>(null);
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [receiptNo, setReceiptNo] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Active Receipt state for printing
  const [activeReceipt, setActiveReceipt] = useState<any | null>(null);

  const printAreaRef = useRef<HTMLDivElement>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSelectedStudent(null);
    setSelectedInstallment(null);

    try {
      const res = await fetch(`/api/students/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
        if (data.students.length === 0) {
          alert('No students found with those search terms.');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to search student registry.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStudent = (studentData: any) => {
    setSelectedStudent(studentData);
    setSelectedInstallment(null);
    setFormError(null);
  };

  const openPaymentModal = (inst: any) => {
    setSelectedInstallment(inst);
    setAmountPaid((inst.amount - inst.paidAmount).toString());
    setReceiptNo(`REC-${Date.now().toString().slice(-6)}`);
    setRemarks('');
    setFormError(null);
  };

  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountPaid || Number(amountPaid) <= 0 || !receiptNo || !paymentDate) {
      setFormError('Please enter all required fields.');
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      const res = await fetch('/api/fees/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.profile._id,
          installmentName: selectedInstallment.name,
          amountPaid: Number(amountPaid),
          paymentMode,
          receiptNo,
          paymentDate,
          remarks,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to record payment');
      }

      // Success
      alert('Fee payment successfully logged!');
      
      // Setup active receipt data for immediate print option
      setActiveReceipt({
        receiptNo: data.payment.receiptNo,
        studentName: selectedStudent.profile.user.name,
        rollNo: selectedStudent.profile.rollNo,
        class: selectedStudent.profile.class.name,
        section: selectedStudent.profile.section.name,
        installment: data.payment.installmentName,
        amount: data.payment.amountPaid,
        mode: data.payment.paymentMode,
        date: data.payment.paymentDate,
        remarks: data.payment.remarks,
        cashier: 'Office Cashier',
      });

      // Reload search to update ledger
      const reloadRes = await fetch(`/api/students/search?q=${encodeURIComponent(selectedStudent.profile.user.name)}`);
      const reloadData = await reloadRes.json();
      if (reloadData.success) {
        const updated = reloadData.students.find((s: any) => s.profile._id === selectedStudent.profile._id);
        if (updated) {
          setSelectedStudent(updated);
        }
      }

      setSelectedInstallment(null);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Fee Operations Desk</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Search student accounts, view active payment schedules, and log offline cashier receipts.
          </p>
        </div>
      </div>

      {/* 2. Search Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4.5 w-4.5" />
            <input
              type="text"
              required
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, roll number, or admission number..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 text-sm font-semibold text-white transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Searching...' : 'Search Account'}
          </button>
        </form>
      </div>

      {/* 3. Main Split Panel: Student results on left, Ledger on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Results List (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Search Results ({students.length})
          </h3>
          <div className="space-y-3">
            {students.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center text-xs text-slate-400">
                Enter a query and click search to list students.
              </div>
            ) : (
              students.map((student) => {
                const isSelected = selectedStudent?.profile?._id === student.profile._id;
                return (
                  <button
                    key={student.profile._id}
                    onClick={() => handleSelectStudent(student)}
                    className={`w-full text-left rounded-2xl p-4 border transition flex items-center gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60 shadow-sm'
                        : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850/50'
                    }`}
                  >
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold uppercase shrink-0">
                      {student.profile.user.name.substring(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <span className="block font-bold text-xs text-slate-900 dark:text-white truncate">
                        {student.profile.user.name}
                      </span>
                      <span className="block text-[10px] text-slate-450 dark:text-slate-400 truncate">
                        Roll: {student.profile.rollNo} | {student.profile.class.name} - {student.profile.section.name}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Ledger Details (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedStudent ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
              {/* Student dossier card */}
              <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-950 dark:text-white">{selectedStudent.profile.user.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Admission No: <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedStudent.profile.admissionNo}</span> | 
                    Class: <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedStudent.profile.class.name}</span>
                  </p>
                </div>
              </div>

              {/* Installment ledger list */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Installments Schedule</h4>
                <div className="space-y-3">
                  {selectedStudent.feeLedger?.installments.map((inst: any) => {
                    const outstanding = inst.amount - inst.paidAmount;
                    const statusColors: any = {
                      Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900',
                      Partial: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900',
                      Unpaid: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900',
                    };

                    return (
                      <div
                        key={inst._id}
                        className="rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                      >
                        <div className="space-y-1">
                          <span className="block text-xs font-bold text-slate-900 dark:text-white">{inst.name}</span>
                          <span className="block text-[10px] text-slate-450 dark:text-slate-400">
                            Due date: {new Date(inst.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-6 text-xs text-center">
                          <div>
                            <span className="block text-slate-400 text-[10px]">Total</span>
                            <span className="font-bold text-slate-850 dark:text-slate-350">₹{inst.amount}</span>
                          </div>
                          <div>
                            <span className="block text-slate-400 text-[10px]">Paid</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{inst.paidAmount}</span>
                          </div>
                          <div>
                            <span className="block text-slate-400 text-[10px]">Due</span>
                            <span className="font-bold text-rose-500">₹{outstanding}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusColors[inst.status]}`}>
                            {inst.status}
                          </span>

                          {inst.status !== 'Paid' && (
                            <button
                              onClick={() => openPaymentModal(inst)}
                              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-1.5 transition cursor-pointer"
                            >
                              Collect Fee
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-450 dark:text-slate-500">
              <DollarSign className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-sm">Search and select a student account to view their active ledger.</p>
            </div>
          )}
        </div>
      </div>

      {/* 4. Payment Collection Modal */}
      {selectedInstallment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl w-full max-w-md p-6 relative">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">Record Fee Collection</h3>
            <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">
              Logging manual offline payment for <span className="font-bold">{selectedStudent?.profile?.user?.name}</span>.
            </p>

            {formError && (
              <div className="flex items-center gap-3 mt-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 p-3 text-xs text-rose-600 dark:text-rose-400">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={submitPayment} className="space-y-4 mt-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Installment Details
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedInstallment.name}
                  className="w-full rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Amount Paid (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Receipt / Transaction No *
                  </label>
                  <input
                    type="text"
                    required
                    value={receiptNo}
                    onChange={(e) => setReceiptNo(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Payment Mode *
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Cashier Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paid in cash at reception"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedInstallment(null)}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 text-xs font-semibold text-slate-650 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-2.5 text-xs font-semibold text-white shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {formLoading ? 'Logging...' : 'Confirm Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Printable Fee Receipt Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 overflow-y-auto print:relative print:bg-white print:p-0 print:border-none">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl shadow-xl w-full max-w-2xl p-8 relative print:shadow-none print:border-none print:p-0 print:w-full print:max-w-none">
            
            {/* Action Bar (hidden when printing) */}
            <div className="flex justify-between items-center pb-6 border-b border-slate-100 dark:border-slate-800 mb-6 print:hidden">
              <span className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Receipt className="h-5 w-5 text-indigo-500" /> Payment Receipt Logged
              </span>
              <div className="flex gap-2.5">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition cursor-pointer"
                >
                  <Printer className="h-4 w-4" /> Print Receipt
                </button>
                <button
                  onClick={() => setActiveReceipt(null)}
                  className="rounded-xl border border-slate-250 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-855 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-350 cursor-pointer"
                >
                  Close Panel
                </button>
              </div>
            </div>

            {/* Printable Area */}
            <div ref={printAreaRef} className="space-y-6 text-slate-800 font-sans print:text-black">
              {/* Receipt Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-black uppercase tracking-tight text-slate-950 print:text-black">
                    KVS Academy
                  </h2>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    45, Palm Avenue, Sector 5, New Delhi - 110001
                  </p>
                  <p className="text-[10px] text-slate-500">Contact: +1 (555) 019-2834 | info@excellence.edu</p>
                </div>
                <div className="text-right">
                  <span className="block text-lg font-black text-slate-950 uppercase tracking-widest">
                    Receipt
                  </span>
                  <span className="block text-[11px] font-mono font-bold text-indigo-600 mt-1">
                    No: {activeReceipt.receiptNo}
                  </span>
                </div>
              </div>

              {/* Student Metadata grid */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200/50 print:bg-slate-50 print:text-black">
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">Student Name</span>
                  <span className="font-bold text-slate-900">{activeReceipt.studentName}</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">Academic Grade</span>
                  <span className="font-bold text-slate-900">{activeReceipt.class} - {activeReceipt.section}</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">Roll Reference</span>
                  <span className="font-bold text-slate-900">{activeReceipt.rollNo}</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">Receipt Date</span>
                  <span className="font-bold text-slate-900">
                    {new Date(activeReceipt.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Fee Transaction Table */}
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-950 font-bold">
                    <th className="py-2.5">Installment Particulars</th>
                    <th className="py-2.5 text-right">Payment Mode</th>
                    <th className="py-2.5 text-right">Settled Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className="font-semibold text-slate-900">
                    <td className="py-3">{activeReceipt.installment}</td>
                    <td className="py-3 text-right">{activeReceipt.mode}</td>
                    <td className="py-3 text-right font-black">₹{activeReceipt.amount.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              {/* Total Summary */}
              <div className="flex justify-end border-t border-slate-200 pt-4">
                <div className="w-48 text-right space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Gross Total:</span>
                    <span className="font-semibold">₹{activeReceipt.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black border-t border-slate-200 pt-1 text-indigo-600">
                    <span>Total Paid:</span>
                    <span>₹{activeReceipt.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-450 leading-relaxed italic border-l-2 border-indigo-500 pl-3">
                Remarks: {activeReceipt.remarks || 'Collected at main front office desk.'}
              </div>

              {/* Audit Signatures */}
              <div className="grid grid-cols-2 gap-12 pt-10 text-xs">
                <div className="text-center border-t border-slate-350 pt-2 text-slate-500">
                  Parent/Guardian Signature
                </div>
                <div className="text-center border-t border-slate-350 pt-2 text-slate-500">
                  Authorized Desk Signatory
                  <span className="block text-[9px] text-slate-400 mt-1 font-mono">Logged by: {activeReceipt.cashier}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
