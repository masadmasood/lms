/*
  useCategories Hook
  
  React Query hook for fetching all categories.
*/

import { useQuery } from "@tanstack/react-query";
import categoryService from "../services/categoryService";

export const CATEGORIES_QUERY_KEY = ["categories"];

export const useCategories = () => {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: categoryService.getAllCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export default useCategories;
