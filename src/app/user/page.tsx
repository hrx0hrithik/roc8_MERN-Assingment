/* eslint-disable */
"use client";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

export default function User() {
  type Category = {
    id: number;
    name: string;
  };

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const categoriesPerPage = 6;
  const totalItems = 100;
  const totalPages = Math.ceil(totalItems / categoriesPerPage);

  const fetchCategories = api.user.getCategories.useQuery({ page });
  const fetchUserCategories = api.user.getUserCategories.useQuery();
  const saveUserCategories = api.user.saveUserCategories.useMutation();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (fetchCategories.data) {
      setCategories(fetchCategories.data);
    }
  }, [fetchCategories.data]);

  useEffect(() => {
    if (fetchUserCategories.data) {
      console.log("Fetched user categories:", fetchUserCategories.data);
      setSelectedCategories(
        fetchUserCategories.data.map((cat) => cat.categoryId),
      );
    }
  }, [fetchUserCategories.data]);

  const debouncedSaveCategories = useCallback(
    debounce(async (categories) => {
      try {
        await saveUserCategories.mutateAsync(categories);
      } catch (error) {
        console.error("Error saving categories", error);
      }
    }, 500),
    [],
  );

  useEffect(() => {
    console.log(selectedCategories);
  }, [selectedCategories]);

  const handleCategoryChange = (categoryId: number) => {
    const updatedCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];

    setSelectedCategories(updatedCategories);
    debouncedSaveCategories(updatedCategories);
  };

  const saveCategories = async (categories: number[]) => {
    try {
      await saveUserCategories.mutateAsync(categories);
    } catch (error) {
      console.error("Error saving categories", error);
    }
  };

  const handlePageChange = async (newPage: number) => {
    await saveCategories(selectedCategories);
    setPage(newPage);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    let startPage = Math.max(1, page - 3);
    let endPage = Math.min(totalPages, page + 3);

    if (endPage - startPage < 6) {
      if (startPage > 1) {
        endPage = Math.min(totalPages, endPage + (6 - (endPage - startPage)));
      } else {
        startPage = Math.max(1, startPage - (6 - (endPage - startPage)));
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="mx-auto mb-6 pt-10">
      <div className="flex h-[658px] w-[576px] flex-col rounded-[20px] border py-10 px-16">
        <h1 className="mb-5 text-center text-[32px] font-semibold">
          Please mark your interests!
        </h1>
        <div className=" text-center text-base font-normal">
          We will keep you notified.
        </div>
        <div className="mt-6 text-xl font-medium leading-[26px]">
          My saved interests
        </div>
        <div className="mt-4 flex flex-col">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-start my-5">
              <input
                className="accent-black w-6 h-6 rounded"
                type="checkbox"
                checked={selectedCategories.includes(category.id)}
                onChange={() => handleCategoryChange(category.id)}
              />
              <label className="ml-2 text-base font-normal">
                {category.name}
              </label>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-start">
          <button
            onClick={() => handlePageChange(1)}
            disabled={page === 1}
            className="mx-2 text-[#ACACAC]"
          >
            &laquo;
          </button>
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="mx-2 text-[#ACACAC]"
          >
            &lt;
          </button>
          {getPageNumbers().map((num) => (
            <button
              key={num}
              onClick={() => handlePageChange(num)}
              className={`mx-2 ${num === page ? 'text-black' : 'text-[#ACACAC]'}`}
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="mx-2 text-[#ACACAC]"
          >
            &gt;
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={page === totalPages}
            className="mx-2 text-[#ACACAC]"
          >
            &raquo;
          </button>
        </div>
      </div>
    </main>
  );
}

// Debouncing
/* eslint-disable @typescript-eslint/no-explicit-any */
function debounce<T extends (...args: any[]) => Promise<void>>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timerId: NodeJS.Timeout | undefined;

  return (...args: Parameters<T>) => {
    // Clear existing timer if it exists
    if (timerId) clearTimeout(timerId);

    // Set up a new timer
    timerId = setTimeout(() => {
      fn(...args).catch((error) => {
        console.error("Error executing debounced function:", error);
      });
    }, delay);
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
