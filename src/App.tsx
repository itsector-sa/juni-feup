import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppLayout } from "@/layout/AppLayout";
import PostsScreen from "@/screens/posts/PostsScreen";
import CommentsScreen from "@/screens/comments/CommentsScreen";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/posts" replace />} />
            <Route path="/posts" element={<PostsScreen />} />
            <Route
              path="/posts/:postId/comments"
              element={<CommentsScreen />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
