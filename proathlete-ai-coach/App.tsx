import React, { useState, useEffect } from 'react';
import { InitialSettings } from './types';
import { UserProfile, TrainingPlan, DailyFeedback, AppSettings } from './types';
import Settings from './components/Settings';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import { generateInitialPlan, iteratePlan } from './services/geminiService';

const App = () => {
  // --- State ---
  const [settings, setSettings] = useState<AppSettings>(InitialSettings);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [trainingPlan, setTrainingPlan] = useState<TrainingPlan | null>(null);
  const [feedbacks, setFeedbacks] = useState<DailyFeedback[]>([]);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Persistence ---
  useEffect(() => {
    const loadData = () => {
      const savedSettings = localStorage.getItem('athlete_settings');
      if (savedSettings) setSettings(JSON.parse(savedSettings));

      const savedProfile = localStorage.getItem('athlete_profile');
      if (savedProfile) setUserProfile(JSON.parse(savedProfile));

      const savedPlan = localStorage.getItem('athlete_plan');
      if (savedPlan) setTrainingPlan(JSON.parse(savedPlan));

      const savedFeedback = localStorage.getItem('athlete_feedback');
      if (savedFeedback) setFeedbacks(JSON.parse(savedFeedback));
    };
    loadData();
  }, []);

  useEffect(() => {
    localStorage.setItem('athlete_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (userProfile) localStorage.setItem('athlete_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    if (trainingPlan) localStorage.setItem('athlete_plan', JSON.stringify(trainingPlan));
  }, [trainingPlan]);

  useEffect(() => {
    localStorage.setItem('athlete_feedback', JSON.stringify(feedbacks));
  }, [feedbacks]);


  // --- Handlers ---
  const handleSettingsSave = (newSettings: AppSettings) => {
    setSettings(newSettings);
    // If we have profile but no plan, maybe try generating?
  };

  const handleProfileComplete = async (profile: UserProfile) => {
    setUserProfile(profile);
    setIsLoading(true);
    setError(null);
    try {
      if (!settings.apiKey) {
        setIsSettingsOpen(true);
        throw new Error("Please configure your API Key first.");
      }
      const newPlan = await generateInitialPlan(profile, settings);
      setTrainingPlan(newPlan);
      setFeedbacks([]); // Reset feedback for new plan
    } catch (err: any) {
      setError(err.message || "Failed to generate plan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitFeedback = (feedback: DailyFeedback) => {
    setFeedbacks(prev => [...prev, feedback]);
  };

  const handleIteratePlan = async () => {
    if (!trainingPlan || !userProfile) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const nextPlan = await iteratePlan(trainingPlan, feedbacks, userProfile, settings);
      
      // Archive old plan logic could go here (not in MVP)
      
      setTrainingPlan(nextPlan);
      setFeedbacks([]); // Clear feedback for the new week
    } catch (err: any) {
      setError(err.message || "Failed to iterate plan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if(window.confirm("Are you sure? This will delete your plan and profile.")) {
      setUserProfile(null);
      setTrainingPlan(null);
      setFeedbacks([]);
      localStorage.clear();
      // Keep settings though
      localStorage.setItem('athlete_settings', JSON.stringify(settings));
    }
  };


  // --- Render ---

  return (
    <div className="min-h-screen bg-dark-950 text-slate-200 font-sans selection:bg-brand-500 selection:text-white">
      {/* Navigation */}
      <nav className="border-b border-dark-800 bg-dark-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-brand-500/30">
                AI
              </div>
              <span className="font-bold text-xl tracking-tight text-white">Pro<span className="text-brand-500">Athlete</span></span>
            </div>
            <div className="flex items-center gap-4">
              {userProfile && (
                <button onClick={handleReset} className="text-xs text-red-500 hover:text-red-400">
                  Reset Data
                </button>
              )}
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Settings"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main>
        {error && (
          <div className="max-w-7xl mx-auto mt-6 px-4">
             <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-lg flex justify-between items-center">
                <span>{error}</span>
                <button onClick={() => setError(null)}>&times;</button>
             </div>
          </div>
        )}

        {!settings.apiKey ? (
           <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
             <div className="w-16 h-16 bg-dark-800 rounded-2xl flex items-center justify-center mb-6 text-3xl">🔑</div>
             <h2 className="text-2xl font-bold text-white mb-2">Configuration Required</h2>
             <p className="text-gray-400 max-w-md mb-6">Please set your Google Gemini API Key to start generating elite training programs.</p>
             <button onClick={() => setIsSettingsOpen(true)} className="btn-primary px-8 py-3 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-500">Open Settings</button>
           </div>
        ) : !userProfile || !trainingPlan ? (
          <Onboarding 
            onComplete={handleProfileComplete} 
            initialData={userProfile || undefined}
            isGenerating={isLoading}
          />
        ) : (
          <Dashboard 
            plan={trainingPlan} 
            feedbacks={feedbacks}
            onSubmitFeedback={handleSubmitFeedback}
            onIteratePlan={handleIteratePlan}
            isIterating={isLoading}
          />
        )}
      </main>

      <Settings 
        settings={settings} 
        onSave={handleSettingsSave} 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
};

export default App;
