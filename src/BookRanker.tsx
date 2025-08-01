import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import './styles.css';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface BookInfo {
  title: string;
  authors?: string[];
  industryIdentifiers?: { type: string; identifier: string }[];
}

interface BookItem {
  id: string;
  volumeInfo: BookInfo;
}


export default function BookRanker() {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<BookItem[]>([]);
  const [topBooks, setTopBooks] = useState<BookItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserFromDb = async () => {
      const storedEmail = localStorage.getItem("userEmail");
      if (!storedEmail) {
        window.location.href = "#/login";
        return;
      }

      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", storedEmail)
        .single();

      if (error || !user) {
        localStorage.removeItem("userEmail");
        window.location.href = "#/login";
        return;
      }

      setUserId(user.id);
      fetchTopBooks(user.id);
    };

    fetchUserFromDb();
  }, []);


  async function fetchTopBooks(uid: string) {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_top_books")
      .select("*, books(*)")
      .eq("user_id", uid)
      .order("rank");

    if (error) {
      setErrorMsg(error.message);
    }

    if (data) {
      const formatted: BookItem[] = data.map((entry: any) => ({
        id: entry.book_id,
        volumeInfo: {
          title: entry.books.title,
          authors: [entry.books.author],
        },
      }));
      setTopBooks(formatted);
    }
    setLoading(false);
  }

  async function searchBooks() {
    if (!query) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setResults(data.items || []);
    } catch (error) {
      setErrorMsg("Failed to fetch books");
    }
    setLoading(false);
  }

  async function addToTop(item: BookItem) {
    if (!userId || topBooks.length >= 10) return;
    if (topBooks.find((b) => b.id === item.id)) return;

    const info = item.volumeInfo;
    const title = info.title;
    const author = info.authors?.[0] || "Unknown";
    const isbn = info.industryIdentifiers?.[0]?.identifier;

    let { data: book, error: bookError } = await supabase
      .from("books")
      .select("id")
      .eq("title", title)
      .eq("author", author)
      .maybeSingle();

    if (bookError) {
      console.error("Error finding book:", bookError);
      setErrorMsg(bookError.message);
      return;
    }

    if (!book) {
      const { data: inserted, error: insertErr } = await supabase
        .from("books")
        .insert({ title, author, isbn })
        .select()
        .single();

      if (insertErr) {
        console.error("Error inserting book:", insertErr);
        setErrorMsg(insertErr.message);
        return;
      }

      book = inserted;
    }

    const rank = topBooks.length + 1;
    const { error: userBookError } = await supabase.from("user_top_books").insert({
      user_id: userId,
      book_id: book?.id,
      rank,
    });

    if (userBookError) {
      console.error("Error inserting user_top_books:", userBookError);
      setErrorMsg(userBookError.message);
      return;
    }

    setTopBooks([...topBooks, item]);
  }

  async function removeFromTop(id: string) {
    const removed = topBooks.find((b) => b.id === id);
    if (!removed) return;

    const { data: book } = await supabase
      .from("books")
      .select("id")
      .eq("title", removed.volumeInfo.title)
      .maybeSingle();

    await supabase
      .from("user_top_books")
      .delete()
      .eq("user_id", userId)
      .eq("book_id", book?.id);

    setTopBooks(topBooks.filter((b) => b.id !== id));
  }

  async function handleLogout() {
    localStorage.removeItem("userEmail");
    window.location.href = "#/login";
  }

  return (
    <div style={{ maxWidth: 768, margin: "0 auto", padding: 16 }}>

      <div className="header">
        <h1>Top 10 Books Tracker</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <div className="search-container" style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search for books..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: 8, width: "70%", marginRight: 8 }}
          className="search-input"
        />
        <button onClick={searchBooks} className="search-btn" style={{ padding: "8px 12px" }}>
          Search
        </button>
      </div>

      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      {loading && <p>Loading...</p>}

      <div style={{ display: "flex", gap: 24 }}>
        <div style={{ flex: 1 }}>
          <h2>Search Results</h2>
          {results.length === 0 && <p>No results</p>}
          {results.map((item) => {
            const info = item.volumeInfo;
            return (
              <div key={item.id} id="bookboxes">
                <div>
                  <div><strong>{info.title}</strong></div>
                  <div style={{ fontSize: 12, color: "#666" }}>{info.authors?.join(", ")}</div>
                </div>
                <button onClick={() => addToTop(item)} disabled={topBooks.length >= 10}>
                  Add
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ flex: 1 }}>
          <h2>Your Top Books</h2>
          {topBooks.length === 0 && <p>No books added yet.</p>}
          {topBooks.map((item, index) => {
            const info = item.volumeInfo;
            return (
              <div key={item.id} className="bookboxes">
                <div>
                  <div><strong>#{index + 1} - {info.title}</strong></div>
                  <div style={{ fontSize: 12 }}>{info.authors?.join(", ")}</div>
                </div>
                <button onClick={() => removeFromTop(item.id)}>Remove</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}