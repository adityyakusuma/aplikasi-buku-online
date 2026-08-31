'use client';
import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';

export default function BookReader({ params }) {
  const resolvedParams = use(params);
  const bookId = resolvedParams.id;

  const [book, setBook] = useState(null);
  const [pages, setPages] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  useEffect(() => {
    const loadBookContent = async () => {
      const { data: bookData } = await supabase.from('books').select('*').eq('id', bookId).single();
      if (bookData) setBook(bookData);

      const { data: pageData } = await supabase
        .from('book_pages')
        .select('*')
        .eq('book_id', bookId)
        .order('page_number', { ascending: true });
      if (pageData) setPages(pageData);
    };
    loadBookContent();
  }, [bookId]);

  if (!book || pages.length === 0) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400 font-sans">Memuat Buku...</div>;
  }

  const currentPage = pages[currentPageIndex];

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-serif text-slate-800 flex flex-col justify-between">
      {/* Top Bar */}
      <header className="px-6 py-4 flex justify-between items-center border-b border-stone-200/60 font-sans">
        <a href="/read" className="text-xs font-medium text-stone-500 hover:text-stone-900">
          ← Katalog Buku
        </a>
        <h1 className="text-sm font-bold text-stone-700">{book.title}</h1>
        <div className="text-xs text-stone-400 font-mono">
          {currentPageIndex + 1} / {pages.length}
        </div>
      </header>

      {/* Reader Content Area */}
      <main className="max-w-2xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="prose prose-stone lg:prose-lg leading-relaxed whitespace-pre-wrap text-justify">
          {currentPage?.content || <p className="italic text-stone-400 text-center">Halaman ini kosong.</p>}
        </div>
      </main>

      {/* Navigation Footer */}
      <footer className="border-t border-stone-200/60 py-4 px-6 font-sans">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <button
            disabled={currentPageIndex === 0}
            onClick={() => setCurrentPageIndex((prev) => prev - 1)}
            className="px-4 py-2 text-sm rounded-lg bg-stone-200/50 hover:bg-stone-200 disabled:opacity-30 font-medium transition"
          >
            ← Sebelumnya
          </button>
          
          <span className="text-xs text-stone-400 font-mono">Hal. {currentPage?.page_number}</span>

          <button
            disabled={currentPageIndex === pages.length - 1}
            onClick={() => setCurrentPageIndex((prev) => prev + 1)}
            className="px-4 py-2 text-sm rounded-lg bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-30 font-medium transition"
          >
            Selanjutnya →
          </button>
        </div>
      </footer>
    </div>
  );
}