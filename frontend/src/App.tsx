import { useState, useEffect } from 'react';
import { ShortenForm } from './components/ShortenForm';
import { UrlCard } from './components/UrlCard';
import { api, PaginatedUrls } from './services/api';

function App() {
  const [urlData, setUrlData] = useState<PaginatedUrls | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchUrls = async (page = 1) => {
    setIsLoading(true);
    setError('');
    try {
      const data = await api.getAllUrls(page, itemsPerPage);
      setUrlData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch URLs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls(currentPage);
  }, [currentPage]);

  const handleUrlShortened = () => {
    fetchUrls(1);
    setCurrentPage(1);
  };

  const handleUrlDeleted = () => {
    fetchUrls(currentPage);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Сокротитель ссылок</h1>
          <p className="text-gray-600">Создавайте которкие ссылки и управляйте ими</p>
        </header>

        <ShortenForm onUrlShortened={handleUrlShortened} />

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Ваши короткие ссылки</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {isLoading ? (
            <div className="text-center py-8 bg-white rounded-lg shadow-md">
              <p className="text-gray-600">Загрузка...</p>
            </div>
          ) : !urlData || urlData.items.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow-md">
              <p className="text-gray-600">У вас пока нет коротких ссылок.</p>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {urlData.items.map((item) => (
                  <UrlCard 
                    key={item.shortUrl} 
                    shortUrl={item.shortUrl} 
                    onDelete={handleUrlDeleted} 
                  />
                ))}
              </div>
              
              {urlData.total > itemsPerPage && (
                <div className="flex justify-center mt-6">
                  <nav className="inline-flex rounded-md shadow">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="cursor-pointer px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Предыдущая
                    </button>
                    <span className="px-3 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-700">
                      Page {currentPage} of {Math.ceil(urlData.total / itemsPerPage)}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={currentPage >= Math.ceil(urlData.total / itemsPerPage)}
                      className="cursor-pointer px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Следующая
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
