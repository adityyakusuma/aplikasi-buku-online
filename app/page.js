'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBooks = async () => {
    const { data } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setBooks(data);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleCreateBook = async (e) => {
    e.preventDefault();
    if (!title) return;
    setLoading(true);

    let coverUrl = null;
    if (coverFile) {
      const fileExt = coverFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('covers')
        .upload(fileName, coverFile);

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from('covers')
          .getPublicUrl(fileName);
        coverUrl = publicUrlData.publicUrl;
      }
    }

    const { error } = await supabase.from('books').insert([
      { title, description, status: 'draft', cover_url: coverUrl }
    ]);

    if (!error) {
      setTitle('');
      setDescription('');
      setCoverFile(null);
      fetchBooks();
    }
    setLoading(false);
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'draft' ? 'published' : 'draft';
    await supabase.from('books').update({ status: newStatus }).eq('id', id);
    fetchBooks();
  };

  const handleDeleteBook = async (id) => {
    if (confirm('Yakin ingin menghapus buku ini beserta seluruh isinya?')) {
      await supabase.from('book_pages').delete().eq('book_id', id);
      await supabase.from('books').delete().eq('id', id);
      fetchBooks();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-800">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold">Studio Penulis (Admin)</h1>
            <p className="text-xs text-gray-500">Kelola karya dan publikasi buku Anda</p>
          </div>
          <a
            href="/read"
            target="_blank"
            className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            👁️ Lihat Mode Pembaca
          </a>
        </header>

        {/* Form Tambah Buku */}
        <form onSubmit={handleCreateBook} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 space-y-4">
          <h2 className="text-lg font-semibold">Buat Buku Baru</h2>
          <input
            type="text"
            placeholder="Judul Buku..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            required
          />
          <textarea
            placeholder="Deskripsi singkat / Sinopsis..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 h-24"
          />
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Upload Cover Buku (Opsional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files[0])}
              className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-gray-900 text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : '+ Tambah Buku'}
          </button>
        </form>

        {/* Daftar Buku */}
        <h2 className="text-lg font-semibold mb-4">Daftar Buku Anda</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {books.map((book) => (
            <div key={book.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex gap-4">
              {book.cover_url ? (
                <img src={book.cover_url} alt={book.title} className="w-20 h-28 object-cover rounded-md flex-shrink-0 bg-gray-100" />
              ) : (
                <div className="w-20 h-28 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-400 flex-shrink-0">No Cover</div>
              )}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-base leading-snug">{book.title}</h3>
                  </div>
                  <p className="text-gray-500 text-xs line-clamp-2 mb-3">{book.description || 'Tanpa deskripsi'}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-medium">Status:</span>
                    <button
                      onClick={() => toggleStatus(book.id, book.status)}
                      className={`text-xs px-3 py-1 rounded-md font-semibold transition ${
                        book.status === 'published'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      }`}
                    >
                      {book.status === 'published' ? 'PUBLISHED (Klik ke Draft)' : 'DRAFT (Klik untuk Publish)'}
                    </button>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-100 text-xs">
                    <a href={`/editor/${book.id}`} className="flex-1 text-center bg-gray-900 text-white hover:bg-gray-800 px-3 py-1.5 rounded-md font-medium">
                      ✏️ Edit Cerita
                    </a>
                    <button onClick={() => handleDeleteBook(book.id)} className="text-red-600 hover:bg-red-50 px-2 py-1.5 rounded-md font-medium">
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}