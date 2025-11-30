import React, { useState } from 'react';
import { AppSettings } from '../types';
import { AVAILABLE_MODELS, DEFAULT_INITIAL_PLAN_PROMPT, DEFAULT_ITERATE_PLAN_PROMPT } from '../constants';

interface SettingsProps {
  settings: AppSettings;
  onSave: (s: AppSettings) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSave, isOpen, onClose }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [activeTab, setActiveTab] = useState<'general' | 'prompts'>('general');

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleResetPrompts = () => {
    if (window.confirm("Reset prompts to default system templates?")) {
      setLocalSettings(prev => ({
        ...prev,
        initialPlanPrompt: DEFAULT_INITIAL_PLAN_PROMPT,
        iteratePlanPrompt: DEFAULT_ITERATE_PLAN_PROMPT
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-dark-900 border border-dark-800 rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-dark-800 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-white">Coach Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-dark-800 shrink-0">
          <button 
            className={`flex-1 px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'general' ? 'text-brand-500 border-b-2 border-brand-500 bg-brand-900/10' : 'text-gray-400 hover:text-gray-200'}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button 
            className={`flex-1 px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'prompts' ? 'text-brand-500 border-b-2 border-brand-500 bg-brand-900/10' : 'text-gray-400 hover:text-gray-200'}`}
            onClick={() => setActiveTab('prompts')}
          >
            Prompt Engineering
          </button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          {activeTab === 'general' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Gemini API Key <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={localSettings.apiKey}
                  onChange={(e) => setLocalSettings({ ...localSettings, apiKey: e.target.value })}
                  placeholder="AIza..."
                  className="w-full bg-dark-950 border border-dark-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Your key is stored locally in your browser. Get one at <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-brand-500 underline">Google AI Studio</a>.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  AI Model
                </label>
                <select
                  value={localSettings.model}
                  onChange={(e) => setLocalSettings({ ...localSettings, model: e.target.value })}
                  className="w-full bg-dark-950 border border-dark-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none appearance-none"
                >
                  {AVAILABLE_MODELS.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button onClick={handleResetPrompts} className="text-xs text-brand-500 hover:text-brand-400 underline">
                  Restore Defaults
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Initial Plan Prompt Template
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Available placeholders: {'{{SPORT}}'}, {'{{AGE}}'}, {'{{HEIGHT}}'}, {'{{WEIGHT}}'}, {'{{TRAINING_AGE}}'}, {'{{INJURY_HISTORY}}'}, {'{{INJURY_STATUS}}'}, {'{{GOALS}}'}, {'{{SQUAT}}'}, {'{{SPEED}}'}, {'{{ENDURANCE}}'}, {'{{SPORT_SPECIFIC}}'}, {'{{CONSTRAINTS}}'}
                </p>
                <textarea
                  value={localSettings.initialPlanPrompt}
                  onChange={(e) => setLocalSettings({ ...localSettings, initialPlanPrompt: e.target.value })}
                  className="w-full h-64 bg-dark-950 border border-dark-800 rounded-lg p-3 text-white font-mono text-sm focus:ring-2 focus:ring-brand-500 outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Weekly Iteration Prompt Template
                </label>
                <p className="text-xs text-gray-500 mb-2">
                   Available placeholders: {'{{SPORT}}'}, {'{{GOALS}}'}, {'{{INJURY_STATUS_TEXT}}'}, {'{{PLAN_ID}}'}, {'{{WEEK_NUMBER}}'}, {'{{PLAN_SUMMARY}}'}, {'{{FEEDBACK_SUMMARY}}'}, {'{{NEXT_WEEK_NUMBER}}'}
                </p>
                <textarea
                  value={localSettings.iteratePlanPrompt}
                  onChange={(e) => setLocalSettings({ ...localSettings, iteratePlanPrompt: e.target.value })}
                  className="w-full h-64 bg-dark-950 border border-dark-800 rounded-lg p-3 text-white font-mono text-sm focus:ring-2 focus:ring-brand-500 outline-none leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-dark-800 bg-dark-950 flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => { onSave(localSettings); onClose(); }}
            className="px-6 py-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-lg shadow-lg shadow-brand-900/20 transition-all"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
