import { useState, useEffect } from "react";

const useSearchFilter = (items, query, key = "name") => {
  const [results, setResults] = useState(items);

  useEffect(() => {
    if (!query) {
      setResults(items);
    } else {
      setResults(
        items.filter((item) =>
          item[key]?.toLowerCase().includes(query.toLowerCase())
        )
      );
    }
  }, [query, items, key]);

  return results;
};

export default useSearchFilter;
