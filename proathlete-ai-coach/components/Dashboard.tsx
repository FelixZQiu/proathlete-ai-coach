import React, { useState } from 'react';
import { TrainingPlan, TrainingDay, DailyFeedback, Exercise } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip, YAxis } from 'recharts';

interface DashboardProps {
  plan: TrainingPlan;
  feedbacks: DailyFeedback[];
  onSubmitFeedback: (feedback: DailyFeedback) => void;
  onIteratePlan: () => void;
  isIterating: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ plan, feedbacks, onSubmitFeedback, onIteratePlan, isIterating }) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  
  // Feedback Form State
  const [rpe, setRpe] = useState(7);
  const [fatigue, setFatigue] = useState(5);
  const [pain, setPain] = useState(1);
  const [completion, setCompletion] = useState(100);
  const [notes, setNotes] = useState('');

  const selectedDay = plan.days.find(d => d.dayIndex === selectedDayIndex) || plan.days[0];
  const hasFeedbackToday = feedbacks.some(f => f.planId === plan.id && f.dayIndex === selectedDayIndex);

  const handleSubmit = () => {
    onSubmitFeedback({
      planId: plan.id,
      dayIndex: selectedDayIndex,
      rpe,
      fatigue,
      sleepQuality: 3, // simplified
      painLevel: pain,
      completionRate: completion,
      notes
    });
    setShowFeedbackModal(false);
  };

  // Simple Chart Data
  const chartData = feedbacks.filter(f => f.planId === plan.id).map(f => ({
    day: `Day ${f.dayIndex + 1}`,
    rpe: f.rpe,
    fatigue: f.fatigue
  }));

  const completionCount = feedbacks.filter(f => f.planId === plan.id).length;
  const isWeekComplete = completionCount >= 5; // Allow iteration after 5 days

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="col-span-1 md:col-span-3 bg-dark-900 border border-dark-800 rounded-xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Week {plan.weekNumber}</h2>
              <p className="text-gray-400 mt-1">{plan.summary}</p>
            </div>
            {isWeekComplete && (
               <button 
               onClick={onIteratePlan}
               disabled={isIterating}
               className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-brand-900/20 transition-all flex items-center gap-2"
             >
               {isIterating ? (
                 <span className="animate-spin text-xl">⟳</span>
               ) : (
                 <span>Generate Next Week &rarr;</span>
               )}
             </button>
            )}
          </div>
          <div className="flex gap-2 mt-4">
             {/* Progress bar of week */}
             <div className="flex-1 bg-dark-950 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-brand-500 h-full transition-all"
                  style={{ width: `${(completionCount / 7) * 100}%` }}
                />
             </div>
             <span className="text-xs text-brand-500 font-mono">{completionCount}/7 Days</span>
          </div>
        </div>

        <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 flex flex-col justify-center">
            <h3 className="text-gray-400 text-sm font-medium mb-4">Load Trend (RPE)</h3>
            <div className="h-24 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <Line type="monotone" dataKey="rpe" stroke="#22c55e" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="fatigue" stroke="#94a3b8" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-600 text-xs">No data yet</div>
              )}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar: Days */}
        <div className="lg:col-span-3 space-y-2">
          {plan.days.map((day) => {
            const isCompleted = feedbacks.some(f => f.planId === plan.id && f.dayIndex === day.dayIndex);
            const isSelected = selectedDayIndex === day.dayIndex;
            return (
              <button
                key={day.dayIndex}
                onClick={() => setSelectedDayIndex(day.dayIndex)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  isSelected 
                    ? 'bg-brand-900/20 border-brand-600 text-white' 
                    : 'bg-dark-900 border-dark-800 text-gray-400 hover:bg-dark-800'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold">{day.dayName}</span>
                  {isCompleted && <span className="text-brand-500 text-xs font-mono">✓ DONE</span>}
                </div>
                <div className="text-sm opacity-80 truncate">{day.isRestDay ? 'Rest & Recovery' : day.focus}</div>
              </button>
            );
          })}
        </div>

        {/* Main Content: Workout Detail */}
        <div className="lg:col-span-9">
          <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden min-h-[600px] flex flex-col">
            <div className="p-8 border-b border-dark-800 bg-gradient-to-r from-dark-900 to-dark-950">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{selectedDay.focus}</h1>
                  <p className="text-gray-400 max-w-2xl leading-relaxed">{selectedDay.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                   {/* Feedback Button */}
                   {!hasFeedbackToday && !selectedDay.isRestDay && (
                     <button 
                       onClick={() => setShowFeedbackModal(true)}
                       className="bg-white text-black px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                     >
                       Log Session
                     </button>
                   )}
                   {/* Rest Day Logger */}
                   {!hasFeedbackToday && selectedDay.isRestDay && (
                     <button 
                        onClick={() => setShowFeedbackModal(true)}
                        className="text-brand-500 border border-brand-500 px-4 py-2 rounded-lg font-bold hover:bg-brand-900/20 transition-colors"
                      >
                        Log Recovery Stats
                      </button>
                   )}
                </div>
              </div>
            </div>

            <div className="p-8 flex-1">
              {selectedDay.isRestDay ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-60">
                  <div className="text-6xl">🧘‍♂️</div>
                  <h3 className="text-2xl font-bold text-gray-300">Active Recovery</h3>
                  <p className="max-w-md text-gray-400">
                    Focus on mobility, hydration, and nutrition today. Prepare your body for the upcoming intensity.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-12 text-xs font-mono text-gray-500 uppercase tracking-wider mb-2 px-4">
                    <div className="col-span-5">Exercise</div>
                    <div className="col-span-2 text-center">Sets</div>
                    <div className="col-span-2 text-center">Reps</div>
                    <div className="col-span-3 text-right">Intensity / Rest</div>
                  </div>
                  
                  {selectedDay.exercises.map((ex: Exercise, idx: number) => (
                    <div key={idx} className="bg-dark-950 border border-dark-800 rounded-xl p-4 grid grid-cols-12 items-center hover:border-dark-700 transition-colors group">
                      <div className="col-span-5">
                        <div className="font-bold text-white text-lg">{ex.name}</div>
                        {ex.notes && <div className="text-xs text-gray-500 mt-1">{ex.notes}</div>}
                      </div>
                      <div className="col-span-2 text-center font-mono text-xl text-brand-500">{ex.sets}</div>
                      <div className="col-span-2 text-center font-mono text-white">{ex.reps}</div>
                      <div className="col-span-3 text-right">
                        <div className="text-sm font-bold text-brand-400">{ex.intensity}</div>
                        <div className="text-xs text-gray-500">{ex.rest} rest</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-dark-900 rounded-2xl w-full max-w-lg overflow-hidden border border-dark-700 shadow-2xl">
            <div className="p-6 border-b border-dark-800">
              <h3 className="text-xl font-bold text-white">Session Feedback</h3>
              <p className="text-sm text-gray-400">How did today's session go?</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Sliders */}
              <div>
                <label className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-gray-300">RPE (Exertion)</span>
                  <span className="text-brand-500 font-bold">{rpe}/10</span>
                </label>
                <input 
                  type="range" min="1" max="10" value={rpe} onChange={(e) => setRpe(Number(e.target.value))}
                  className="w-full h-2 bg-dark-950 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                   <span>Easy</span><span>Max Effort</span>
                </div>
              </div>

              <div>
                <label className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-gray-300">Fatigue Level</span>
                  <span className="text-brand-500 font-bold">{fatigue}/10</span>
                </label>
                <input 
                  type="range" min="1" max="10" value={fatigue} onChange={(e) => setFatigue(Number(e.target.value))}
                  className="w-full h-2 bg-dark-950 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
              </div>

              <div>
                <label className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-gray-300">Pain/Discomfort</span>
                  <span className={`font-bold ${pain > 3 ? 'text-red-500' : 'text-brand-500'}`}>{pain}/10</span>
                </label>
                <input 
                  type="range" min="1" max="10" value={pain} onChange={(e) => setPain(Number(e.target.value))}
                  className="w-full h-2 bg-dark-950 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>

              <div>
                <label className="label">Completion (%)</label>
                <div className="flex gap-2">
                  {[25, 50, 75, 100].map(val => (
                    <button 
                      key={val}
                      onClick={() => setCompletion(val)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        completion === val ? 'bg-brand-600 text-white' : 'bg-dark-950 text-gray-400 hover:bg-dark-800'
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Notes / Adjustments Needed</label>
                <textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                  className="input h-20 resize-none"
                  placeholder="Knee felt funny during squats..."
                />
              </div>
            </div>

            <div className="p-6 bg-dark-950 flex justify-end gap-3">
              <button onClick={() => setShowFeedbackModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
              <button onClick={handleSubmit} className="px-6 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-bold">Submit Feedback</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
