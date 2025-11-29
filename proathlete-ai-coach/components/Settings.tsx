import React from 'react';
import { AppSettings } from '../types';
import { AVAILABLE_MODELS } from '../constants';

interface SettingsProps {
  settings: AppSettings;
  onSave: (s: AppSettings) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSave, isOpen, onClose }) => {
  const [localSettings, setLocalSettings] = React.useState(settings);

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-dark-900 border border-dark-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-dark-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Coach Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        
        <div className="p-6 space-y-6">
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
        </div>

        <div className="p-6 border-t border-dark-800 bg-dark-950 flex justify-end gap-3">
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
