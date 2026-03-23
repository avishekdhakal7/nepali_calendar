'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, Download, AlertTriangle, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import SchoolAdminLayout from '@/components/layout/school-admin-layout';
import {
  BS_MONTHS_DATA,
  validateMonthDays,
  computeDateDiff,
  detectFebruary,
  generatePreview,
  generateYearJson,
  downloadJson,
  formatDate,
  getDayName,
  getMonthInfo,
  TYPICAL_MONTH_DAYS,
  PreviewMonth,
} from '@/lib/calendar-builder';

const BS_YEAR_START = 2083;

export default function CalendarBuilderPage() {
  const [step, setStep] = useState(1);
  const [bsYear, setBsYear] = useState(BS_YEAR_START);
  const [monthDays, setMonthDays] = useState<number[]>([...TYPICAL_MONTH_DAYS]);
  const [baisakh1Ad, setBaisakh1Ad] = useState('');
  const [baisakh1DayName, setBaisakh1DayName] = useState('');
  const [baisakh1DayNameOverride, setBaisakh1DayNameOverride] = useState('');
  const [chaitraLastAd, setChaitraLastAd] = useState('');
  const [chaitraLastDayName, setChaitraLastDayName] = useState('');
  const [chaitraLastDayNameOverride, setChaitraLastDayNameOverride] = useState('');

  const [febResult, setFebResult] = useState<{ febYear: number; febDays: number; isLeap: boolean } | null>(null);
  const [febConfirmed, setFebConfirmed] = useState(false);
  const [febUserSays, setFebUserSays] = useState<number | null>(null);
  const [preview, setPreview] = useState<{ months: PreviewMonth[]; totalDays: number } | null>(null);
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);

  const monthValidation = validateMonthDays(monthDays);
  const totalDaysFromMonths = monthValidation.total;

  const baisakh1Date = baisakh1Ad ? new Date(baisakh1Ad) : null;
  const chaitraLastDate = chaitraLastAd ? new Date(chaitraLastAd) : null;
  const totalDaysFromDates = (baisakh1Date && chaitraLastDate)
    ? computeDateDiff(baisakh1Date, chaitraLastDate)
    : 0;
  const daysMatch = totalDaysFromMonths === totalDaysFromDates && totalDaysFromDates > 0;

  useEffect(() => {
    if (baisakh1Date) {
      const name = getDayName(baisakh1Date);
      setBaisakh1DayName(name);
      setBaisakh1DayNameOverride(name);
    } else {
      setBaisakh1DayName('');
      setBaisakh1DayNameOverride('');
    }
  }, [baisakh1Ad]);

  useEffect(() => {
    if (chaitraLastDate) {
      const name = getDayName(chaitraLastDate);
      setChaitraLastDayName(name);
      setChaitraLastDayNameOverride(name);
    } else {
      setChaitraLastDayName('');
      setChaitraLastDayNameOverride('');
    }
  }, [chaitraLastAd]);

  const handleDetectFebruary = () => {
    if (!baisakh1Date || !chaitraLastDate) return;
    const result = detectFebruary(baisakh1Date, chaitraLastDate);
    setFebResult(result);
    setFebConfirmed(false);
    setFebUserSays(null);
  };

  const handleFebConfirm = (userSays: number) => {
    setFebUserSays(userSays);
    if (febResult) {
      setFebConfirmed(userSays === febResult.febDays);
    }
  };

  const handleGeneratePreview = () => {
    if (!baisakh1Date) return;
    const lastDate = new Date(baisakh1Date);
    lastDate.setDate(lastDate.getDate() + totalDaysFromMonths - 1);
    const p = generatePreview(bsYear, monthDays, baisakh1Date, lastDate);
    setPreview(p);
  };

  const handleDownload = () => {
    if (!baisakh1Date) return;
    const data = generateYearJson(bsYear, monthDays, baisakh1Date);
    downloadJson(bsYear, data);
  };

  const step2Valid = monthValidation.valid;
  const step3Valid = baisakh1Ad !== '' && baisakh1DayNameOverride !== '';
  const step4Valid = chaitraLastAd !== '' && chaitraLastDayNameOverride !== '';
  const step5Valid = daysMatch && febConfirmed;
  const step6Valid = preview !== null;

  const canProceed = () => {
    switch (step) {
      case 1: return bsYear >= BS_YEAR_START;
      case 2: return step2Valid;
      case 3: return step3Valid;
      case 4: return step4Valid;
      case 5: return step5Valid;
      case 6: return step6Valid;
      default: return false;
    }
  };

  return (
    <SchoolAdminLayout title="Calendar Builder" activeRoute="/school-admin/calendar">
      <div className="max-w-3xl mx-auto">
        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5, 6].map(s => (
            <div key={s} className="flex items-center gap-2 flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                s < step ? 'bg-green-600 text-white' : s === step ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-zinc-400'
              }`}>
                {s < step ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 6 && <div className={`w-8 h-0.5 ${s < step ? 'bg-green-600' : 'bg-zinc-700'}`} />}
            </div>
          ))}
        </div>

        {/* Step Labels */}
        <div className="flex items-center gap-2 mb-6 text-xs text-zinc-500 overflow-x-auto">
          <span className={step === 1 ? 'text-blue-400 font-medium' : ''}>Year</span>
          <span>›</span>
          <span className={step === 2 ? 'text-blue-400 font-medium' : ''}>Months</span>
          <span>›</span>
          <span className={step === 3 ? 'text-blue-400 font-medium' : ''}>Baisakh 1</span>
          <span>›</span>
          <span className={step === 4 ? 'text-blue-400 font-medium' : ''}>Chaitra Last</span>
          <span>›</span>
          <span className={step === 5 ? 'text-blue-400 font-medium' : ''}>Verify</span>
          <span>›</span>
          <span className={step === 6 ? 'text-blue-400 font-medium' : ''}>Preview</span>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-6">

          {/* STEP 1 — Select Year */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Select BS Year</h2>
              <p className="text-sm text-zinc-500 mb-6">Choose the Bikram Sambat year to create. Years 2000–2082 are read-only.</p>

              <label className="block text-sm text-zinc-400 mb-2">Bikram Sambat Year</label>
              <select
                value={bsYear}
                onChange={e => setBsYear(parseInt(e.target.value))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white text-lg font-semibold focus:outline-none focus:border-blue-500"
              >
                {Array.from({ length: 50 }, (_, i) => BS_YEAR_START + i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <p className="text-sm text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Years 2000–2082 are pre-filled from official data and cannot be replaced.</span>
                </p>
              </div>
            </div>
          )}

          {/* STEP 2 — Month Days */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Enter Month Days</h2>
              <p className="text-sm text-zinc-500 mb-4">How many days does each month have in BS {bsYear}?</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {BS_MONTHS_DATA.map((m, i) => (
                  <div key={m.num} className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{m.nameNp}</span>
                      <span className="text-xs text-zinc-500">{m.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const next = [...monthDays];
                          next[i] = Math.max(29, next[i] - 1);
                          setMonthDays(next);
                        }}
                        className="w-8 h-8 bg-zinc-700 hover:bg-zinc-600 rounded flex items-center justify-center text-white"
                      >−</button>
                      <input
                        type="number"
                        min={29}
                        max={32}
                        value={monthDays[i]}
                        onChange={e => {
                          const next = [...monthDays];
                          next[i] = parseInt(e.target.value) || 30;
                          setMonthDays(next);
                        }}
                        className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-center text-white font-semibold focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => {
                          const next = [...monthDays];
                          next[i] = Math.min(32, next[i] + 1);
                          setMonthDays(next);
                        }}
                        className="w-8 h-8 bg-zinc-700 hover:bg-zinc-600 rounded flex items-center justify-center text-white"
                      >+</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`text-center py-3 rounded-lg font-semibold text-lg ${
                monthValidation.valid
                  ? totalDaysFromMonths === 365
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                Total: {totalDaysFromMonths} days
                {monthValidation.valid && <span className="ml-2">✓ Valid</span>}
                {!monthValidation.valid && <span className="ml-2">— Must be 365 or 366</span>}
              </div>
            </div>
          )}

          {/* STEP 3 — Baisakh 1 */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Baisakh 1 — English Date</h2>
              <p className="text-sm text-zinc-500 mb-6">What is the English (AD) date for Baisakh 1, {bsYear}?</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">English Date</label>
                  <input
                    type="date"
                    value={baisakh1Ad}
                    onChange={e => setBaisakh1Ad(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {baisakh1Date && (
                  <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-zinc-400">Auto-detected day name:</span>
                      <span className="text-white font-semibold">{baisakh1DayName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">Override (if needed):</span>
                      <input
                        type="text"
                        value={baisakh1DayNameOverride}
                        onChange={e => setBaisakh1DayNameOverride(e.target.value)}
                        className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1 text-white text-sm w-40 focus:outline-none focus:border-blue-500"
                        placeholder="e.g. Tuesday"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4 — Chaitra Last */}
          {step === 4 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Chaitra Last — English Date</h2>
              <p className="text-sm text-zinc-500 mb-6">What is the English (AD) date for the last day of Chaitra, {bsYear}?</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">English Date</label>
                  <input
                    type="date"
                    value={chaitraLastAd}
                    onChange={e => setChaitraLastAd(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {chaitraLastDate && (
                  <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-zinc-400">Auto-detected day name:</span>
                      <span className="text-white font-semibold">{chaitraLastDayName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">Override (if needed):</span>
                      <input
                        type="text"
                        value={chaitraLastDayNameOverride}
                        onChange={e => setChaitraLastDayNameOverride(e.target.value)}
                        className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1 text-white text-sm w-40 focus:outline-none focus:border-blue-500"
                        placeholder="e.g. Thursday"
                      />
                    </div>
                  </div>
                )}

                {/* Date Diff Validation */}
                {baisakh1Date && chaitraLastDate && (
                  <div className={`p-3 rounded-lg text-sm font-medium ${
                    daysMatch
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {daysMatch ? (
                      <>Days match ✓ — {totalDaysFromDates} days from Baisakh 1 to Chaitra last</>
                    ) : (
                      <>Mismatch ❌ — Month days sum to {totalDaysFromMonths} but Chaitra last is {totalDaysFromDates} days from Baisakh 1. Check your inputs.</>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5 — Leap Year Check */}
          {step === 5 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Verify February</h2>
              <p className="text-sm text-zinc-500 mb-4">
                Click the button below to detect which February falls in this BS year and how many days it has.
                Cross-check with Hamro Patro.
              </p>

              {!febResult ? (
                <button
                  onClick={handleDetectFebruary}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-colors"
                >
                  Check February for Leap Year
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4">
                    <p className="text-white font-semibold mb-2">
                      February <span className="text-blue-400">{febResult.febYear}</span> falls inside this BS year
                    </p>
                    <p className={`text-2xl font-bold ${
                      febResult.isLeap ? 'text-blue-400' : 'text-zinc-400'
                    }`}>
                      {febResult.febDays} days
                      {febResult.isLeap && <span className="text-sm ml-2">(Leap Year)</span>}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {febResult.isLeap
                        ? `${febResult.febYear} is divisible by 4, not a century`
                        : `${febResult.febYear} is not a leap year`}
                    </p>
                  </div>

                  <p className="text-sm text-zinc-400">
                    Does this match Hamro Patro? Check February {febResult.febYear} on Hamro Patro.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleFebConfirm(29)}
                      className={`py-3 rounded-lg font-semibold transition-colors ${
                        febUserSays === 29
                          ? febResult.febDays === 29 ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                          : 'bg-zinc-700 hover:bg-zinc-600 text-white'
                      }`}
                    >
                      February has 29 days
                    </button>
                    <button
                      onClick={() => handleFebConfirm(28)}
                      className={`py-3 rounded-lg font-semibold transition-colors ${
                        febUserSays === 28
                          ? febResult.febDays === 28 ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                          : 'bg-zinc-700 hover:bg-zinc-600 text-white'
                      }`}
                    >
                      February has 28 days
                    </button>
                  </div>

                  {febUserSays !== null && (
                    <div className={`p-3 rounded-lg text-sm font-medium ${
                      febConfirmed
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {febConfirmed ? (
                        <>Leap year verified ✓ — Your input is correct.</>
                      ) : (
                        <>Mismatch ❌ — You said {febUserSays} days but our calculation shows {febResult.febDays} days. Go back and check your dates.</>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 6 — Preview */}
          {step === 6 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Preview — BS {bsYear}</h2>
              <p className="text-sm text-zinc-500 mb-4">
                Scroll through all 12 months. Cross-check with Hamro Patro. If everything looks correct, download the JSON.
              </p>

              {!preview ? (
                <button
                  onClick={handleGeneratePreview}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-colors"
                >
                  Generate Preview
                </button>
              ) : (
                <div className="space-y-3">
                  {preview.months.map(m => (
                    <div key={m.month} className="border border-zinc-700/50 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedMonth(expandedMonth === m.month ? null : m.month)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-pink-400" />
                          <span className="text-white font-semibold">{m.monthNameNp} ({m.monthName})</span>
                          <span className="text-zinc-500 text-sm">— {m.totalDays} days</span>
                        </div>
                        {expandedMonth === m.month ? (
                          <ChevronUp className="w-4 h-4 text-zinc-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-zinc-400" />
                        )}
                      </button>

                      {expandedMonth === m.month && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-t border-zinc-700/50">
                                <th className="text-left px-4 py-2 text-zinc-500 font-medium">BS Date</th>
                                <th className="text-left px-4 py-2 text-zinc-500 font-medium">Day</th>
                                <th className="text-left px-4 py-2 text-zinc-500 font-medium">AD Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {m.days.map((d, i) => (
                                <tr key={i} className="border-t border-zinc-700/30 hover:bg-zinc-800/30">
                                  <td className="px-4 py-2 text-white font-medium">{d.bsDay}</td>
                                  <td className="px-4 py-2 text-zinc-400">{d.dayName}</td>
                                  <td className="px-4 py-2 text-zinc-400">{d.adDate}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-sm text-green-400">
                    ✓ Preview generated — {preview.totalDays} days total. Cross-check and download if correct.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-zinc-800/40">
            <button
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {step < 6 ? (
              <button
                onClick={() => {
                  if (step === 5) {
                    setStep(6);
                  } else {
                    setStep(s => s + 1);
                  }
                }}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Download JSON
              </button>
            )}
          </div>
        </div>

        {/* Download Instructions */}
        {step === 6 && (
          <div className="mt-4 p-4 bg-zinc-900/40 border border-zinc-800/40 rounded-xl">
            <h3 className="text-sm font-semibold text-white mb-2">After Downloading:</h3>
            <ol className="text-sm text-zinc-500 space-y-1 list-decimal list-inside">
              <li>Save the downloaded <code className="text-blue-400">{bsYear}.json</code> file</li>
              <li>Copy it to <code className="text-blue-400">src/data/bs-calendar/{bsYear}.json</code></li>
              <li>Commit and push to GitHub</li>
              <li>The app will automatically include the new year on next deploy</li>
            </ol>
          </div>
        )}
      </div>
    </SchoolAdminLayout>
  );
}
