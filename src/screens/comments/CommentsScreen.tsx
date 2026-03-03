import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { useGetPost } from "@/services/posts/useGetPost";
import {
  useGetComments,
  useDeleteComment,
} from "@/services/comments/useComments";
import type { Comment } from "@/types";
import { CommentModal } from "./CommentModal";

export default function CommentsScreen() {
  const { postId: postIdParam } = useParams<{ postId: string }>();
  const postId = Number(postIdParam);
  const navigate = useNavigate();

  const {
    data: post,
    loading: isPostLoading,
    error: postError,
    fetch: fetchPost,
  } = useGetPost(postId);

  useEffect(() => {
    if (postId > 0) fetchPost();
  }, [postId]);

  const isPostError = !!postError;

  const {
    data: comments = [],
    isLoading: isCommentsLoading,
    isError: isCommentsError,
  } = useGetComments(postId);
  const deleteComment = useDeleteComment();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingComment, setEditingComment] = useState<Comment | undefined>(
    undefined,
  );
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(
    null,
  );

  const handleEdit = (comment: Comment) => {
    setEditingComment(comment);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingComment(undefined);
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setDeletingCommentId(id);
  };

  const confirmDelete = () => {
    if (deletingCommentId === null) return;
    deleteComment.mutate(deletingCommentId, {
      onSuccess: () => {
        toast.success("Comment deleted successfully");
        setDeletingCommentId(null);
      },
      onError: () => {
        toast.error("Failed to delete comment");
        setDeletingCommentId(null);
      },
    });
  };

  const columns: ColumnDef<Comment>[] = [
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
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium line-clamp-1 max-w-[200px] block">
          {row.getValue<string>("name")}
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <a
          href={`mailto:${row.getValue<string>("email")}`}
          className="text-sm text-primary underline-offset-4 hover:underline line-clamp-1 max-w-[180px] block"
        >
          {row.getValue<string>("email")}
        </a>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "body",
      header: "Body",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm line-clamp-1 max-w-[300px] block">
          {row.getValue<string>("body")}
        </span>
      ),
      enableSorting: false,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const comment = row.original;
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
              <DropdownMenuItem onClick={() => handleEdit(comment)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => handleDelete(comment.id)}
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
    data: comments,
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
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate("/posts")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Comments</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Comments for post #{postId}
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          New Comment
        </Button>
      </div>

      {/* Post details card */}
      {isPostLoading && (
        <div className="h-24 rounded-xl border bg-card animate-pulse" />
      )}
      {isPostError && (
        <div className="flex items-center justify-center h-24 rounded-xl border text-destructive text-sm">
          Failed to load post details.
        </div>
      )}
      {post && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary">Post #{post.id}</Badge>
              <Badge variant="outline">User {post.userId}</Badge>
            </div>
            <CardTitle className="text-base">{post.title}</CardTitle>
            <CardDescription>{post.body}</CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search comments…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* States */}
      {isCommentsLoading && (
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          Loading comments…
        </div>
      )}
      {isCommentsError && (
        <div className="flex items-center justify-center h-48 text-destructive">
          Failed to load comments. Please try again.
        </div>
      )}

      {/* Table */}
      {!isCommentsLoading && !isCommentsError && <DataTable table={table} />}

      {/* Create / Edit modal */}
      <CommentModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditingComment(undefined);
        }}
        comment={editingComment}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={deletingCommentId !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingCommentId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Comment #{deletingCommentId} will be
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
