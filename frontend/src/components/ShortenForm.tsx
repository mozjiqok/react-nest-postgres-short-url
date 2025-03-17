import { useState } from 'react';
import { api, ShortenUrlRequest } from '../services/api';

interface ShortenFormProps {
  onUrlShortened: (shortUrl: string) => void;
}

export function ShortenForm({ onUrlShortened }: ShortenFormProps) {
  const [originalUrl, setOriginalUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data: ShortenUrlRequest = {
        originalUrl,
      };

      if (alias) data.alias = alias;
      if (expiresAt) data.expiresAt = expiresAt;

      const result = await api.shortenUrl(data);
      onUrlShortened(result.shortUrl);
      setOriginalUrl('');
      setAlias('');
      setExpiresAt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Сократить ссылку</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="originalUrl" className="block text-gray-700 text-sm font-bold mb-2">
            URL для сокращения *
          </label>
          <input
            id="originalUrl"
            type="url"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="https://example.com"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="alias" className="block text-gray-700 text-sm font-bold mb-2">
            Своя ссылка (не обязательно)
          </label>
          <input
            id="alias"
            type="text"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="short-url"
            maxLength={20}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="expiresAt" className="block text-gray-700 text-sm font-bold mb-2">
            Срок жизни ссылки (не обязательно)
          </label>
          <input
            id="expiresAt"
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={isLoading}
            className="cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {isLoading ? 'Сокращаем...' : 'Сократить ссылку'}
          </button>
        </div>
      </form>
    </div>
  );
}