import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Product', 'Cart', 'Note', 'Order', 'Notification', 'User'],
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (queryString = '') => `/products${queryString ? '?' + queryString : ''}`,
      providesTags: ['Product'],
    }),
    getProductById: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    getNewArrivals: builder.query({
      query: () => '/products/new-arrivals',
      providesTags: ['Product'],
    }),
    searchProducts: builder.query({
      query: (q) => `/products/search?q=${encodeURIComponent(q)}`,
      providesTags: ['Product'],
    }),
    getProductsByCategory: builder.query({
      query: (category) => `/products/category/${encodeURIComponent(category)}`,
      providesTags: ['Product'],
    }),
    addProduct: builder.mutation({
      query: (formData) => ({
        url: '/products',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Product'],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    sendOtp: builder.mutation({
      query: (data) => ({
        url: '/auth/send-otp',
        method: 'POST',
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),
    createPurchaseRequest: builder.mutation({
      query: (data) => ({
        url: '/requests',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),
    updatePurchaseRequest: builder.mutation({
      query: ({ id, status }) => ({
        url: `/requests/${id}`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Product'],
    }),
    getConversations: builder.query({
      query: () => '/chat',
    }),
    createDirectChat: builder.mutation({
      query: (data) => ({
        url: '/chat/direct',
        method: 'POST',
        body: data,
      }),
    }),
    getMessages: builder.query({
      query: (conversationId) => `/chat/${conversationId}`,
    }),
    getCart: builder.query({
      query: () => '/cart',
      providesTags: ['Cart'],
    }),
    addToCart: builder.mutation({
      query: (data) => ({
        url: '/cart',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Cart'],
    }),
    removeFromCart: builder.mutation({
      query: (productId) => ({
        url: `/cart/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
    getNotes: builder.query({
      query: () => '/notes',
      providesTags: ['Note'],
    }),
    addNote: builder.mutation({
      query: (formData) => ({
        url: '/notes',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Note'],
    }),
    createOrder: builder.mutation({
      query: (data) => ({
        url: '/orders',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Cart', 'Order'],
    }),
    getPurchases: builder.query({
      query: () => '/orders/purchases',
      providesTags: ['Order'],
    }),
    getNotifications: builder.query({
      query: () => '/notifications',
      providesTags: ['Notification'],
    }),
    markRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),
    clearNotifications: builder.mutation({
      query: () => ({
        url: '/notifications/clear',
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),
    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),
    getProfileDashboard: builder.query({
      query: () => '/users/profile',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: '/users/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User', 'Product', 'Note', 'Order'],
    }),
    chatWithAI: builder.mutation({
      query: (data) => ({
        url: '/ai/chat',
        method: 'POST',
        body: data,
      }),
    }),
    getAdminAnalytics: builder.query({
      query: () => '/admin/analytics',
      providesTags: ['User', 'Product'],
    }),
    getAdminUsers: builder.query({
      query: () => '/admin/users',
      providesTags: ['User'],
    }),
    updateAdminUserStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/users/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['User'],
    }),
    deleteAdminUser: builder.mutation({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User', 'Product'],
    }),
    getAdminProducts: builder.query({
      query: () => '/admin/products',
      providesTags: ['Product'],
    }),
    deleteAdminProduct: builder.mutation({
      query: (id) => ({
        url: `/admin/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
    updateAdminProductStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/products/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Product'],
    }),
    getAdminChats: builder.query({
      query: () => '/admin/chats',
    }),
    deleteAdminChat: builder.mutation({
      query: (id) => ({
        url: `/admin/chats/${id}`,
        method: 'DELETE',
      }),
    }),
    getAdminNotifications: builder.query({
      query: () => '/admin/notifications',
      providesTags: ['Notification'],
    }),
    deleteAdminNotification: builder.mutation({
      query: (id) => ({
        url: `/admin/notifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),
    getAdminSupport: builder.query({
      query: () => '/admin/support',
    }),
    deleteAdminSupport: builder.mutation({
      query: (id) => ({
        url: `/admin/support/${id}`,
        method: 'DELETE',
      }),
    }),
    getAdminNotes: builder.query({
      query: () => '/admin/notes',
      providesTags: ['Product'],
    }),
    updateAdminNoteStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/notes/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Product'],
    }),
    deleteAdminNote: builder.mutation({
      query: (id) => ({
        url: `/admin/notes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
    postAdminNotification: builder.mutation({
      query: (data) => ({
        url: '/admin/notifications',
        method: 'POST',
        body: data,
      }),
    }),
    getAdminSettings: builder.query({
      query: () => '/admin/settings',
    }),
    updateAdminSettings: builder.mutation({
      query: (settings) => ({
        url: '/admin/settings',
        method: 'PUT',
        body: settings,
      }),
    }),
    getPublicProfile: builder.query({
      query: (id) => `/auth/users/${id}`,
    }),
  }),
})

export const { 
  useGetProductsQuery, 
  useGetProductByIdQuery, 
  useGetNewArrivalsQuery,
  useSearchProductsQuery,
  useGetProductsByCategoryQuery,
  useAddProductMutation,
  useDeleteProductMutation,
  useLoginMutation,
  useRegisterMutation,
  useSendOtpMutation,
  useResetPasswordMutation,
  useCreatePurchaseRequestMutation,
  useUpdatePurchaseRequestMutation,
  useGetConversationsQuery,
  useGetMessagesQuery,
  useGetCartQuery,
  useAddToCartMutation,
  useRemoveFromCartMutation,
  useGetNotesQuery,
  useAddNoteMutation,
  useCreateOrderMutation,
  useGetPurchasesQuery,
  useGetNotificationsQuery,
  useMarkReadMutation,
  useClearNotificationsMutation,
  useDeleteNotificationMutation,
  useGetProfileDashboardQuery,
  useGetUserStatsQuery,
  useUpdateProfileMutation,
  useCreateDirectChatMutation,
  useChatWithAIMutation,
  useGetAdminAnalyticsQuery,
  useGetAdminUsersQuery,
  useUpdateAdminUserStatusMutation,
  useDeleteAdminUserMutation,
  useGetAdminProductsQuery,
  useDeleteAdminProductMutation,
  useUpdateAdminProductStatusMutation,
  useGetAdminChatsQuery,
  useDeleteAdminChatMutation,
  useGetAdminNotificationsQuery,
  useDeleteAdminNotificationMutation,
  useGetAdminSupportQuery,
  useDeleteAdminSupportMutation,
  useGetAdminNotesQuery,
  useUpdateAdminNoteStatusMutation,
  useDeleteAdminNoteMutation,
  usePostAdminNotificationMutation,
  useGetAdminSettingsQuery,
  useUpdateAdminSettingsMutation,
  useGetPublicProfileQuery,
} = apiSlice
