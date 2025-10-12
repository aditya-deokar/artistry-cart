'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosinstance';



export const ShopReviews: React.FC<{ shopId: string; totalReviews: number }> = ({ shopId, totalReviews }) => {
  const [page, setPage] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();

  // Query to fetch existing reviews
  const { data, isLoading } = useQuery({
    queryKey: ['shopReviews', shopId, page],
    queryFn: async () => {
      const res = await axiosInstance.get(`/product/api/shops/${shopId}/reviews?page=${page}`);
      return res.data.data; // Access data from the nested data property in the new API response
    },
  });

  // Mutation to create a new review
  const { mutate, isPending } = useMutation({
      mutationFn: (newReview: { shopId: string, rating: number, review: string }) => {
          return axiosInstance.post(`/product/api/shops/${shopId}/reviews`, newReview);
      },
      onSuccess: () => {
          // When a review is successfully submitted, invalidate the queries
          // to refetch the latest reviews and the main shop data (to update avg rating)
          queryClient.invalidateQueries({ queryKey: ['shopReviews', shopId] });
          queryClient.invalidateQueries({ queryKey: ['shop', /* shopSlug */] });
          setRating(0);
          setComment("");
      },
      onError: (error) => {
          // Handle error, e.g., show a toast notification
          console.error("Failed to submit review:", error);
      }
  });

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (rating > 0 && comment.trim() !== "") {
          mutate({ shopId, rating, review: comment });
      }
  };

  return (
    <div>
      <h2 className="font-display text-3xl mb-6">Reviews ({totalReviews})</h2>
      
      {/* Review Submission Form */}
      <div className="mb-12 p-6 border border-neutral-800 rounded-lg">
          <h3 className="font-semibold mb-4">Leave a Review</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star rating input component would go here */}
              <div>Your Rating: {rating}</div> 
              <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this artist..."
                  className="w-full p-2 bg-neutral-800 rounded"
                  rows={4}
              />
              <button type="submit" disabled={isPending} className="px-6 py-2 bg-accent rounded font-semibold disabled:bg-neutral-600">
                  {isPending ? "Submitting..." : "Submit Review"}
              </button>
          </form>
      </div>

      {/* List of Existing Reviews */}
      <div>
          {isLoading ? <p>Loading reviews...</p> : <p>Review list would be rendered here.</p>}
      </div>
    </div>
  );
};