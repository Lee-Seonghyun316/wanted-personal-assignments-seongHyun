import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';

export const reviewsApi = createApi({
  reducerPath: 'fetchReviews',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.balaan.co.kr',
    keepUnusedDataFor: 30,
  }),
  endpoints: (builder) => ({
    getReviews: builder.query({
      query: (query) => `/v1/contents?page=${query.page}&sort=${query.sort}&gender=unisex&brandno=&hashtags=&category=`,
      keepUnusedDataFor: 5,
    }),
  }),
});

export const { useGetReviewsQuery } = reviewsApi;
