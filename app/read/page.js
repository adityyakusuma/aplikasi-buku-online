'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function ReaderCatalog() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchPublishedBooks = async () => {
      const { data } = await supabase
        .from('books')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      if (data) setBooks(data);
    };
    fetchPublishedBooks();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="bg-white border-b px-8 py-6 shadow-sm">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black tracking-tight text-indigo-600">Perpustakaan Online</h1>
          <a href="/" className="text-xs text-gray-500 hover:text-gray-800 font-medium">Masuk Mode Admin →</a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-8">
        <h2 className="text-xl font-bold mb-6">Buku Terbaru Dibaca</h2>
        
        {books.length === 0 ? (
          <p className="text-gray-400">Belum ada buku yang dipublikasikan.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {books.map((book) => (
              <a
                key={book.id}
                href={`/read/${book.id}`}
                className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col group"
              >
                <div className="h-56 bg-slate-200 overflow-hidden relative">
                  {book.cover_url ? (
                    <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-serif text-lg">
                      {book.title[0]}
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-base leading-snug group-hover:text-indigo-600 transition mb-1">{book.title}</h3>
                    <p className="text-slate-500 text-xs line-clamp-3">{book.description}</p>
                  </div>
                  <span className="mt-4 text-xs font-semibold text-indigo-600">Mulai Baca →</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}