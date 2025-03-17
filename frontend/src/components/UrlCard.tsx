import { useState } from 'react';
import { api, UrlInfo, Analytics, API_BASE_URL } from '../services/api';
import { Popup } from './Popup';

interface UrlCardProps {
  shortUrl: string;
  onDelete: () => void;
}

export function UrlCard({ shortUrl, onDelete }: UrlCardProps) {
  const [urlInfo, setUrlInfo] = useState<UrlInfo | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  const fullShortUrl = `${API_BASE_URL}/${shortUrl}`;

  const fetchUrlInfo = async () => {
    setIsLoading(true);
    setError('');
    try {
      const info = await api.getUrlInfo(shortUrl);
      setUrlInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить информацию о ссылке');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await api.getAnalytics(shortUrl);
      setAnalytics(data);
      setShowAnalytics(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить аналитику');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setPopupMessage('Вы уверены, что хотите удалить эту ссылку?');
    setShowPopup(true);
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    setError('');
    try {
      await api.deleteUrl(shortUrl);
      onDelete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить ссылку');
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullShortUrl);
    setPopupMessage('Ссылка скопирована!');
    setShowPopup(true);
  };

  return (
    <div className="w-full bg-white shadow-sm border rounded-lg p-4 mb-2 hover:shadow-md transition-shadow">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <div className="flex items-center w-full sm:w-auto sm:flex-grow sm:mr-4">
          <a 
            href={fullShortUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-medium truncate max-w-[200px] sm:max-w-none"
          >
            {fullShortUrl}
          </a>
          <button 
            onClick={copyToClipboard}
            className="cursor-pointer ml-2 text-gray-500 hover:text-gray-700 flex-shrink-0"
            title="Скопировать ссылку"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 w-full sm:w-auto">
          <button 
            onClick={fetchUrlInfo}
            disabled={isLoading}
            className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium py-1 px-2 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 text-sm w-full sm:w-auto"
          >
            Информация
          </button>
          <button 
            onClick={fetchAnalytics}
            disabled={isLoading}
            className="cursor-pointer text-green-600 hover:text-green-800 font-medium py-1 px-2 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 text-sm w-full sm:w-auto"
          >
            Аналитика
          </button>
          <button 
            onClick={handleDelete}
            disabled={isLoading}
            className="cursor-pointer text-red-600 hover:text-red-800 font-medium py-1 px-2 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 text-sm w-full sm:w-auto"
          >
            Удалить
          </button>
        </div>
      </div>

      {urlInfo && (
        <div className="mt-4 border-t pt-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold text-gray-700">Исходная ссылка</p>
              <p className="text-gray-600 truncate">{urlInfo.originalUrl}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Дата создания</p>
              <p className="text-gray-600">{new Date(urlInfo.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Колочество кликов</p>
              <p className="text-gray-600">{urlInfo.clickCount}</p>
            </div>
          </div>
          
          <div className="mt-4 flex space-x-2">
            <button 
              onClick={() => setUrlInfo(null)}
              className="cursor-pointer text-gray-600 hover:text-gray-800 font-medium py-1 px-2 rounded focus:outline-none focus:shadow-outline text-sm"
            >
              Скрыть
            </button>
          </div>
        </div>
      )}

      {showAnalytics && analytics && (
        <div className="mt-4 border-t pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-gray-700">Всего кликов</p>
              <p className="text-gray-600">{analytics.clickCount}</p>
            </div>
            {analytics.recentVisitors.length > 0 && (
              <div>
                <p className="font-semibold text-gray-700">Последние посетители</p>
                <div className="text-gray-600 space-y-1">
                  {analytics.recentVisitors.map((visit, index) => (
                    <p key={index} className="text-sm">{visit.ipAddress}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4 flex space-x-2">
            <button 
              onClick={() => setShowAnalytics(false)}
              className="cursor-pointer text-gray-600 hover:text-gray-800 font-medium py-1 px-2 rounded focus:outline-none focus:shadow-outline text-sm"
            >
              Скрыть
            </button>
          </div>
        </div>
      )}
      <Popup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        message={popupMessage}
        type={popupMessage.startsWith('Вы уверены') ? 'confirm' : 'success'}
        onConfirm={popupMessage.startsWith('Вы уверены') ? confirmDelete : undefined}
      />
    </div>
  );
}