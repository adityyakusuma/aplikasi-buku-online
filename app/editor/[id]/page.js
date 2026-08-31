'use client';
import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';

export default function BookEditor({ params }) {
  const resolvedParams = use(params);
  const bookId = resolvedParams.id;

  const [book, setBook] = useState(null);
  const [pages, setPages] = useState([]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBookData();
  }, [bookId]);

  const fetchBookData = async () => {
    const { data: bookData } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single();
    if (bookData) setBook(bookData);

    const { data: pageData } = await supabase
      .from('book_pages')
      .select('*')
      .eq('book_id', bookId)
      .order('page_number', { ascending: true });

    if (pageData && pageData.length > 0) {
      setPages(pageData);
      setContent(pageData[0].content || '');
    } else {
      await createNewPage(1);
    }
  };

  const createNewPage = async (nextPageNum) => {
    const newPageNumber = nextPageNum || pages.length + 1;
    const { data, error } = await supabase
      .from('book_pages')
      .insert([{ book_id: bookId, page_number: newPageNumber, content: '' }])
      .select();

    if (!error && data) {
      const updatedPages = [...pages, data[0]];
      setPages(updatedPages);
      setActivePageIndex(updatedPages.length - 1);
      setContent('');
    }
  };

  const handleSelectPage = (index) => {
    setActivePageIndex(index);
    setContent(pages[index]?.content || '');
  };

  const handleSaveContent = async () => {
    const currentPage = pages[activePageIndex];
    if (!currentPage) return;

    setSaving(true);
    const { error } = await supabase
      .from('book_pages')
      .update({ content })
      .eq('id', currentPage.id);

    if (!error) {
      const updatedPages = [...pages];
      updatedPages[activePageIndex].content = content;
      setPages(updatedPages);
    }
    setSaving(false);
  };

  if (!book) return <div className="p-8 font-sans text-gray-500">Memuat Studio Editor...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-800">
      <header className="bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-900 font-medium">
            ← Kembali ke Dashboard
          </a>
          <h1 className="font-bold text-lg border-l pl-4 border-gray-300">{book.title}</h1>
        </div>
        <button
          onClick={handleSaveContent}
          disabled={saving}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : 'Simpan Halaman Ini'}
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 bg-white border-r p-4 flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Daftar Halaman
            </h2>
            <div className="space-y-1 overflow-y-auto max-h-[70vh]">
              {pages.map((page, index) => (
                <button
                  key={page.id}
                  onClick={() => handleSelectPage(index)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition flex justify-between items-center ${
                    activePageIndex === index
                      ? 'bg-gray-900 text-white font-medium'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <span>Halaman {page.page_number}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => createNewPage()}
            className="w-full mt-4 border border-dashed border-gray-300 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            + Tambah Halaman
          </button>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto flex justify-center items-start">
          <div className="w-full max-w-2xl bg-white rounded-xl border border-gray-200 shadow-sm p-8 min-h-[600px] flex flex-col">
            <div className="text-xs font-mono text-gray-400 border-b pb-2 mb-4">
              HALAMAN {pages[activePageIndex]?.page_number || 1}
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Mulai tulis cerita Anda di sini..."
              className="w-full flex-1 focus:outline-none resize-none font-serif text-lg leading-relaxed text-gray-800"
            />
          </div>
        </main>
      </div>
    </div>
  );
}