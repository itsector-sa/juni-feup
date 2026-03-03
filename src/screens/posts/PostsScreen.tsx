import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ArrowUpDown,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/data-table/DataTable";
import { useGetPosts } from "@/services/posts/useGetPosts";
import { useDeletePost } from "@/services/posts/useDeletePost";
import type { Post } from "@/types";
import { PostModal } from "./PostModal";

export default function PostsScreen() {
  const { data: posts = [], fetch: fetchPosts, loading, error } = useGetPosts();
  const deletePost = useDeletePost();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | undefined>(undefined);
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingPost(undefined);
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setDeletingPostId(id);
  };

  const confirmDelete = async () => {
    if (deletingPostId === null) return;
    try {
      await deletePost.remove(deletingPostId);
      toast.success("Post deleted successfully");
      setDeletingPostId(null);
    } catch {
      toast.error("Failed to delete post");
      setDeletingPostId(null);
    }
  };

  const columns: ColumnDef<Post>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          #
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.getValue<number>("id")}
        </span>
      ),
      size: 60,
    },
    {
      accessorKey: "userId",
      header: "User",
      cell: ({ row }) => (
        <Badge variant="secondary">User {row.getValue<number>("userId")}</Badge>
      ),
      size: 90,
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium line-clamp-1 max-w-[280px] block">
          {row.getValue<string>("title")}
        </span>
      ),
    },
    {
      accessorKey: "body",
      header: "Body",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm line-clamp-1 max-w-[360px] block">
          {row.getValue<string>("body")}
        </span>
      ),
      enableSorting: false,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const post = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <circle cx="8" cy="3" r="1.5" />
                  <circle cx="8" cy="8" r="1.5" />
                  <circle cx="8" cy="13" r="1.5" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => navigate(`/posts/${post.id}/comments`)}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                View Comments
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleEdit(post)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => handleDelete(post.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      size: 56,
    },
  ];

  const table = useReactTable({
    data: posts,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and browse all posts from the API.
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          New Post
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          Loading posts…
        </div>
      )}
      {error && (
        <div className="flex items-center justify-center h-48 text-destructive">
          Failed to load posts. Please try again.
        </div>
      )}

      {/* Table */}
      {!loading && !error && <DataTable table={table} />}

      {/* Create / Edit modal */}
      <PostModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditingPost(undefined);
        }}
        post={editingPost}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={deletingPostId !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingPostId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Post #{deletingPostId} will be
              permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
