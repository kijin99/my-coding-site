import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';
import { useLocale } from '../store/LocaleContext';

export const Header: React.FC = () => {
  const { currentUser, logout } = useAppContext();
  const { locale, changeLocale, t } = useLocale();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const homePath = currentUser 
    ? (currentUser.role === 'teacher' ? '/teacher' : '/student/dashboard')
    : '/login';

  const welcomeMessage = currentUser ? (
    locale === 'ko' 
    ? <><span className="font-bold text-sky-400">{currentUser.name}</span>{t('header.welcome')}!</>
    : <>{t('header.welcome')}, <span className="font-bold text-sky-400">{currentUser.name}</span>!</>
  ) : null;

  return (
    <header className="bg-slate-800 p-4 shadow-lg sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-sky-400">
          <Link to={homePath}>{t('header.title')}</Link>
        </h1>
        <nav className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeLocale('en')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${locale === 'en' ? 'bg-sky-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              aria-pressed={locale === 'en'}
            >
              EN
            </button>
            <button
              onClick={() => changeLocale('ko')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${locale === 'ko' ? 'bg-sky-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              aria-pressed={locale === 'ko'}
            >
              KO
            </button>
          </div>
          {currentUser ? (
            <div className="flex items-center gap-4">
              <span className="text-slate-300">{welcomeMessage}</span>
              <button onClick={handleLogout} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg text-sm">{t('header.logout')}</button>
            </div>
          ) : (
            <Link to="/login" className="text-slate-300 hover:text-sky-400 px-3 py-2 rounded-md text-sm font-medium">{t('header.login')}</Link>
          )}
        </nav>
      </div>
    </header>
  );
};