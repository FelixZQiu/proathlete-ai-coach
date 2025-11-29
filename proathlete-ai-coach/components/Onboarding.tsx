import React, { useState } from 'react';
import { UserProfile, Sport, InjuryStatus } from '../types';
import { DEFAULT_PROFILE } from '../constants';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  initialData?: UserProfile;
  isGenerating: boolean;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, initialData, isGenerating }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<UserProfile>(initialData || DEFAULT_PROFILE);

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Athlete Assessment</h1>
        <p className="text-gray-400">Step {step} of 3: {step === 1 ? 'Bio & Sport' : step === 2 ? 'Performance Metrics' : 'Goals & Constraints'}</p>
        <div className="w-full bg-dark-800 h-2 rounded-full mt-4 overflow-hidden">
          <div 
            className="bg-brand-500 h-full transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="label">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="input"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="label">Sport</label>
                <select 
                  value={formData.sport}
                  onChange={(e) => handleChange('sport', e.target.value)}
                  className="input"
                >
                  {Object.values(Sport).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Age</label>
                <input type="number" value={formData.age} onChange={(e) => handleChange('age', Number(e.target.value))} className="input" />
              </div>
              <div>
                <label className="label">Training Age (Years)</label>
                <input type="number" value={formData.trainingAge} onChange={(e) => handleChange('trainingAge', Number(e.target.value))} className="input" />
              </div>
              <div>
                <label className="label">Height (cm)</label>
                <input type="number" value={formData.heightCm} onChange={(e) => handleChange('heightCm', Number(e.target.value))} className="input" />
              </div>
              <div>
                <label className="label">Weight (kg)</label>
                <input type="number" value={formData.weightKg} onChange={(e) => handleChange('weightKg', Number(e.target.value))} className="input" />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="p-4 bg-brand-900/20 border border-brand-900 rounded-lg text-brand-100 text-sm">
              Provide accurate metrics to calibrate intensity. Leave blank if unknown.
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="label">Est. 1RM Squat (kg)</label>
                <input type="number" value={formData.strengthSquat || ''} onChange={(e) => handleChange('strengthSquat', Number(e.target.value))} className="input" placeholder="Optional" />
              </div>
              <div>
                <label className="label">10m Sprint (sec)</label>
                <input type="number" step="0.01" value={formData.speed10m || ''} onChange={(e) => handleChange('speed10m', Number(e.target.value))} className="input" placeholder="Optional" />
              </div>
              <div>
                <label className="label">Endurance (VO2max)</label>
                <input type="number" value={formData.enduranceVo2 || ''} onChange={(e) => handleChange('enduranceVo2', Number(e.target.value))} className="input" placeholder="Optional" />
              </div>
            </div>
            <div>
              <label className="label">Sport Specific Metrics</label>
              <textarea 
                value={formData.sportSpecificStats} 
                onChange={(e) => handleChange('sportSpecificStats', e.target.value)} 
                className="input h-24"
                placeholder="e.g. Avg match distance: 11km, 30 sprints per game..." 
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="label">Injury Status</label>
                <select 
                  value={formData.injuryStatus}
                  onChange={(e) => handleChange('injuryStatus', e.target.value)}
                  className="input"
                >
                  {Object.values(InjuryStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Injury History Details</label>
                <input 
                  type="text" 
                  value={formData.injuryHistory} 
                  onChange={(e) => handleChange('injuryHistory', e.target.value)} 
                  className="input"
                  placeholder="e.g. ACL reconstruction 2021"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="label">Primary Goals (SMARTS)</label>
              <textarea 
                value={formData.goals} 
                onChange={(e) => handleChange('goals', e.target.value)} 
                className="input h-32"
                placeholder="Specific, Measurable, Achievable, Relevant, Time-bound goals. E.g., Increase vertical jump by 5cm in 6 weeks." 
              />
            </div>
            <div>
              <label className="label">Constraints & Preferences</label>
              <textarea 
                value={formData.constraints} 
                onChange={(e) => handleChange('constraints', e.target.value)} 
                className="input h-24"
                placeholder="e.g. Can only train Mon, Tue, Thu, Fri. No access to sleds." 
              />
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-between pt-6 border-t border-dark-800">
          {step > 1 ? (
            <button onClick={prevStep} className="btn-secondary">Back</button>
          ) : (
            <div></div>
          )}
          
          {step < 3 ? (
            <button onClick={nextStep} className="btn-primary">Next Step</button>
          ) : (
            <button 
              onClick={() => onComplete(formData)} 
              disabled={isGenerating}
              className={`btn-primary ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Designing Plan...
                </span>
              ) : 'Generate Training Plan'}
            </button>
          )}
        </div>
      </div>
      
      {/* Tailwind Helper Classes */}
      <style>{`
        .label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #94a3b8;
          margin-bottom: 0.5rem;
        }
        .input {
          width: 100%;
          background-color: #020617;
          border: 1px solid #1e293b;
          border-radius: 0.5rem;
          padding: 0.75rem 1rem;
          color: white;
          outline: none;
          transition: border-color 0.2s;
        }
        .input:focus {
          border-color: #22c55e;
          box-shadow: 0 0 0 1px #22c55e;
        }
        .btn-primary {
          background-color: #16a34a;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          transition: background-color 0.2s;
        }
        .btn-primary:hover {
          background-color: #15803d;
        }
        .btn-secondary {
          background-color: transparent;
          color: #94a3b8;
          padding: 0.75rem 1.5rem;
          font-weight: 600;
        }
        .btn-secondary:hover {
          color: white;
        }
      `}</style>
    </div>
  );
};

export default Onboarding;
