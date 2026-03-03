import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreatePost } from "@/services/posts/useCreatePost";
import { useUpdatePost } from "@/services/posts/useUpdatePost";
import type { Post } from "@/types";

interface PostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post?: Post;
}

// TODO: 6 - Create zod schema for post validation and use it in PostFormContent instead of the custom validatePost function.

const defaultValues = { userId: 1, title: "", body: "" };

type PostErrors = Partial<Record<"userId" | "title" | "body", string>>;

function validatePost(values: {
  userId: number;
  title: string;
  body: string;
}): PostErrors {
  const errors: PostErrors = {};
  if (values.userId < 1 || values.userId > 10) {
    errors.userId = "User ID must be between 1 and 10";
  }
  if (values.title.length < 3) {
    errors.title = "Title must be at least 3 characters";
  } else if (values.title.length > 100) {
    errors.title = "Title must be at most 100 characters";
  }
  if (values.body.length < 10) {
    errors.body = "Body must be at least 10 characters";
  } else if (values.body.length > 500) {
    errors.body = "Body must be at most 500 characters";
  }
  return errors;
}

function PostFormContent({
  post,
  onOpenChange,
}: {
  post?: Post;
  onOpenChange: (open: boolean) => void;
}) {
  const isEditing = !!post;

  // TODO: 7 - Refactor to use react hook form (useForm) for better form state management and validation.
  const [userId, setUserId] = useState(post?.userId ?? defaultValues.userId);
  const [title, setTitle] = useState(post?.title ?? defaultValues.title);
  const [body, setBody] = useState(post?.body ?? defaultValues.body);
  const [errors, setErrors] = useState<PostErrors>({});

  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const values = { userId, title, body };
    const nextErrors = validatePost(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});

    if (isEditing && post) {
      const result = await updatePost.update({ ...values, id: post.id });
      if (result) {
        toast.success("Post updated successfully");
        onOpenChange(false);
      } else {
        toast.error("Failed to update post");
      }
    } else {
      const result = await createPost.create(values);
      if (result) {
        toast.success("Post created successfully");
        onOpenChange(false);
      } else {
        toast.error("Failed to create post");
      }
    }
  };

  const isPending = createPost.loading || updatePost.loading;

  // TODO: 8 - Refactor to use react-hoo-form (register) for better form state management.
  // TODO: 9 - Refactor to use react-hoo-form (formState) for better validation and show errors.
  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      <div className="grid gap-2">
        <Label htmlFor="post-userId">User ID</Label>
        <Input
          id="post-userId"
          type="number"
          min={1}
          max={10}
          placeholder="1–10"
          value={userId}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            setUserId(isNaN(v) ? 1 : v);
            if (errors.userId) setErrors((e) => ({ ...e, userId: undefined }));
          }}
          aria-invalid={!!errors.userId}
        />
        {errors.userId && (
          <p className="text-sm text-destructive">{errors.userId}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="post-title">Title</Label>
        <Input
          id="post-title"
          placeholder="Enter post title…"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((e) => ({ ...e, title: undefined }));
          }}
          aria-invalid={!!errors.title}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="post-body">Body</Label>
        <Textarea
          id="post-body"
          placeholder="Write the post content…"
          className="min-h-[120px] resize-none"
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            if (errors.body) setErrors((e) => ({ ...e, body: undefined }));
          }}
          aria-invalid={!!errors.body}
        />
        {errors.body && (
          <p className="text-sm text-destructive">{errors.body}</p>
        )}
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? isEditing
              ? "Saving…"
              : "Creating…"
            : isEditing
              ? "Save Changes"
              : "Create Post"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function PostModal({ open, onOpenChange, post }: PostModalProps) {
  const isEditing = !!post;
  const formKey = open ? (post ? `edit-${post.id}` : "new") : "closed";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Post" : "New Post"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the fields below to edit this post."
              : "Fill in the fields below to create a new post."}
          </DialogDescription>
        </DialogHeader>
        <PostFormContent
          key={formKey}
          post={post}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}
