import React from 'react';
import { useTranslation } from 'react-i18next';

interface ProfilePageProps {
  isModal?: boolean;
  onClose?: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ isModal, onClose }) => {
  const { t } = useTranslation();

  return (
    <div className={`${isModal ? 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center' : ''}`}>
      <div className="container mx-auto px-4 py-8 bg-white rounded-lg shadow-lg max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{t('profile.title', 'Profile')}</h1>
          {isModal && onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          )}
        </div>
        <div className="bg-white rounded-lg p-6">
          <p className="text-gray-600">{t('profile.comingSoon', 'Profile page coming soon...')}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
