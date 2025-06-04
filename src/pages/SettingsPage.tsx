import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Moon, 
  Sun, 
  Monitor, 
  Globe, 
  Bell, 
  Lock, 
  Database,
  Brain,
  HelpCircle,
  FileText,
  Mail,
  Info,
  X
} from 'lucide-react';
import Button from '../components/common/Button';
import { useAppSettings } from '../contexts/AppSettingsContext';
import { LLMProvider } from '../types';

interface SettingsPageProps {
  isModal?: boolean;
  onClose?: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ 
  isModal = false, 
  onClose 
}) => {
  const { t } = useTranslation();
  const { settings, updateSettings } = useAppSettings();
  const [saving, setSaving] = useState(false);
  
  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    try {
      await updateSettings({ theme });
    } catch (error) {
      console.error('Failed to update theme:', error);
    }
  };
  
  const handleLanguageChange = async (language: string) => {
    try {
      await updateSettings({ language });
    } catch (error) {
      console.error('Failed to update language:', error);
    }
  };
  
  const handleLLMProviderChange = async (llmProvider: LLMProvider) => {
    try {
      await updateSettings({ llmProvider });
    } catch (error) {
      console.error('Failed to update LLM provider:', error);
    }
  };
  
  const handleDataRetentionChange = async (days: number) => {
    try {
      await updateSettings({ dataRetentionDays: days });
    } catch (error) {
      console.error('Failed to update data retention:', error);
    }
  };
  
  const handleToggleSetting = async (setting: keyof typeof settings) => {
    try {
      await updateSettings({ [setting]: !settings[setting] });
    } catch (error) {
      console.error(`Failed to toggle ${setting}:`, error);
    }
  };
  
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      // Additional save logic if needed
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate save
      if (onClose) onClose();
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };
  
  const content = (
    <div className={`bg-white ${!isModal && 'min-h-screen'}`}>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800">
              {t('settings.title')}
            </h1>
            <p className="text-neutral-600">
              Customize your experience and manage app preferences
            </p>
          </div>
          
          {isModal && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-neutral-500" />
            </button>
          )}
        </div>
        
        {/* Settings Sections */}
        <div className="space-y-6">
          {/* General Settings */}
          <section className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-neutral-800 mb-4">
                {t('settings.general')}
              </h2>
              
              {/* Theme */}
              <div className="mb-6">
                <label className="text-sm font-medium text-neutral-700 mb-2 block">
                  {t('settings.theme')}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`flex items-center justify-center p-3 rounded-lg border ${
                      settings.theme === 'light'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <Sun size={18} className="mr-2" />
                    <span>{t('common.lightMode')}</span>
                  </button>
                  
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`flex items-center justify-center p-3 rounded-lg border ${
                      settings.theme === 'dark'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <Moon size={18} className="mr-2" />
                    <span>{t('common.darkMode')}</span>
                  </button>
                  
                  <button
                    onClick={() => handleThemeChange('system')}
                    className={`flex items-center justify-center p-3 rounded-lg border ${
                      settings.theme === 'system'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <Monitor size={18} className="mr-2" />
                    <span>{t('common.systemMode')}</span>
                  </button>
                </div>
              </div>
              
              {/* Language */}
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-2 block">
                  {t('settings.language')}
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="input"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="ar">العربية</option>
                  <option value="hi">हिन्दी</option>
                </select>
              </div>
            </div>
          </section>
          
          {/* Privacy & Security */}
          <section className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-neutral-800 mb-4">
                {t('settings.privacy')}
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Lock className="w-5 h-5 text-neutral-500 mr-3" />
                    <div>
                      <p className="font-medium text-neutral-800">Privacy Mode</p>
                      <p className="text-sm text-neutral-600">
                        Hide sensitive information from screen
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleSetting('privacyMode')}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      settings.privacyMode ? 'bg-primary-500' : 'bg-neutral-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        settings.privacyMode ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="w-5 h-5 text-neutral-500 mr-3" />
                    <div>
                      <p className="font-medium text-neutral-800">Notifications</p>
                      <p className="text-sm text-neutral-600">
                        Receive important alerts and reminders
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleSetting('notificationsEnabled')}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      settings.notificationsEnabled ? 'bg-primary-500' : 'bg-neutral-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        settings.notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </section>
          
          {/* AI Settings */}
          <section className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-neutral-800 mb-4">
                AI Provider
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-2 block">
                    Select AI Provider
                  </label>
                  <select
                    value={settings.llmProvider}
                    onChange={(e) => handleLLMProviderChange(e.target.value as LLMProvider)}
                    className="input"
                  >
                    <option value="openai">OpenAI GPT-4</option>
                    <option value="google">Google Med-PaLM</option>
                    <option value="azure">Azure Health Bot</option>
                    <option value="anthropic">Anthropic Claude</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Brain className="w-5 h-5 text-neutral-500 mr-3" />
                    <div>
                      <p className="font-medium text-neutral-800">Analytics</p>
                      <p className="text-sm text-neutral-600">
                        Help improve AI accuracy with anonymous data
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleSetting('analyticsOptIn')}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      settings.analyticsOptIn ? 'bg-primary-500' : 'bg-neutral-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        settings.analyticsOptIn ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </section>
          
          {/* Data Management */}
          <section className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-neutral-800 mb-4">
                {t('settings.dataStorage')}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-2 block">
                    {t('settings.dataRetention')}
                  </label>
                  <select
                    value={settings.dataRetentionDays}
                    onChange={(e) => handleDataRetentionChange(Number(e.target.value))}
                    className="input"
                  >
                    <option value={30}>{t('settings.days30')}</option>
                    <option value={90}>{t('settings.days90')}</option>
                    <option value={365}>{t('settings.year1')}</option>
                    <option value={-1}>{t('settings.forever')}</option>
                  </select>
                  <p className="mt-2 text-sm text-neutral-600">
                    {t('settings.dataRetentionDescription')}
                  </p>
                </div>
              </div>
            </div>
          </section>
          
          {/* Help & Support */}
          <section className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-neutral-800 mb-4">
                {t('settings.helpSupport')}
              </h2>
              
              <div className="space-y-3">
                <a 
                  href="#" 
                  className="flex items-center p-3 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <HelpCircle className="w-5 h-5 text-neutral-500 mr-3" />
                  <span className="flex-grow">Help Center</span>
                  <ChevronRight className="w-5 h-5 text-neutral-400" />
                </a>
                
                <a 
                  href="#" 
                  className="flex items-center p-3 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <FileText className="w-5 h-5 text-neutral-500 mr-3" />
                  <span className="flex-grow">Documentation</span>
                  <ChevronRight className="w-5 h-5 text-neutral-400" />
                </a>
                
                <a 
                  href="#" 
                  className="flex items-center p-3 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <Mail className="w-5 h-5 text-neutral-500 mr-3" />
                  <span className="flex-grow">Contact Support</span>
                  <ChevronRight className="w-5 h-5 text-neutral-400" />
                </a>
              </div>
            </div>
          </section>
          
          {/* About */}
          <section className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-neutral-800 mb-4">
                {t('settings.aboutApp')}
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center">
                    <Info className="w-5 h-5 text-neutral-500 mr-3" />
                    <span>Version</span>
                  </div>
                  <span className="text-neutral-600">0.1.0</span>
                </div>
                
                <a 
                  href="#" 
                  className="flex items-center p-3 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <FileText className="w-5 h-5 text-neutral-500 mr-3" />
                  <span className="flex-grow">{t('settings.termsOfService')}</span>
                  <ChevronRight className="w-5 h-5 text-neutral-400" />
                </a>
                
                <a 
                  href="#" 
                  className="flex items-center p-3 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <Lock className="w-5 h-5 text-neutral-500 mr-3" />
                  <span className="flex-grow">{t('settings.privacyPolicy')}</span>
                  <ChevronRight className="w-5 h-5 text-neutral-400" />
                </a>
              </div>
            </div>
          </section>
        </div>
        
        {/* Action Buttons */}
        {isModal && (
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              {t('common.cancel')}
            </Button>
            
            <Button
              variant="primary"
              onClick={handleSaveSettings}
              disabled={saving}
            >
              {saving ? t('common.saving') : t('common.save')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
  
  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-4xl bg-white rounded-xl shadow-xl"
          >
            {content}
          </motion.div>
        </div>
      </div>
    );
  }
  
  return content;
};

export default SettingsPage;