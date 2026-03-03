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
import {
  useCreateComment,
  useUpdateComment,
} from "@/services/comments/useComments";
import type { Comment } from "@/types";

interface CommentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comment?: Comment;
}

const defaultValues = { postId: 1, name: "", email: "", body: "" };

type CommentErrors = Partial<
  Record<"postId" | "name" | "email" | "body", string>
>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateComment(values: {
  postId: number;
  name: string;
  email: string;
  body: string;
}): CommentErrors {
  const errors: CommentErrors = {};
  if (values.postId < 1 || values.postId > 100) {
    errors.postId = "Post ID must be between 1 and 100";
  }
  if (values.name.length < 3) {
    errors.name = "Name must be at least 3 characters";
  } else if (values.name.length > 100) {
    errors.name = "Name must be at most 100 characters";
  }
  if (!EMAIL_REGEX.test(values.email)) {
    errors.email = "Must be a valid email address";
  }
  if (values.body.length < 10) {
    errors.body = "Body must be at least 10 characters";
  } else if (values.body.length > 500) {
    errors.body = "Body must be at most 500 characters";
  }
  return errors;
}

function CommentFormContent({
  comment,
  onOpenChange,
}: {
  comment?: Comment;
  onOpenChange: (open: boolean) => void;
}) {
  const isEditing = !!comment;
  const [postId, setPostId] = useState(comment?.postId ?? defaultValues.postId);
  const [name, setName] = useState(comment?.name ?? defaultValues.name);
  const [email, setEmail] = useState(comment?.email ?? defaultValues.email);
  const [body, setBody] = useState(comment?.body ?? defaultValues.body);
  const [errors, setErrors] = useState<CommentErrors>({});

  const createComment = useCreateComment();
  const updateComment = useUpdateComment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const values = { postId, name, email, body };
    const nextErrors = validateComment(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});

    if (isEditing && comment) {
      updateComment.mutate(
        { ...values, id: comment.id },
        {
          onSuccess: () => {
            toast.success("Comment updated successfully");
            onOpenChange(false);
          },
          onError: () => toast.error("Failed to update comment"),
        },
      );
    } else {
      createComment.mutate(values, {
        onSuccess: () => {
          toast.success("Comment created successfully");
          onOpenChange(false);
        },
        onError: () => toast.error("Failed to create comment"),
      });
    }
  };

  const isPending = createComment.isPending || updateComment.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      <div className="grid gap-2">
        <Label htmlFor="comment-postId">Post ID</Label>
        <Input
          id="comment-postId"
          type="number"
          min={1}
          max={100}
          placeholder="1–100"
          value={postId}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            setPostId(isNaN(v) ? 1 : v);
            if (errors.postId) setErrors((e) => ({ ...e, postId: undefined }));
          }}
          aria-invalid={!!errors.postId}
        />
        {errors.postId && (
          <p className="text-sm text-destructive">{errors.postId}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="comment-name">Name</Label>
        <Input
          id="comment-name"
          placeholder="Enter commenter's name…"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
          }}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="comment-email">Email</Label>
        <Input
          id="comment-email"
          type="email"
          placeholder="commenter@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
          }}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="comment-body">Body</Label>
        <Textarea
          id="comment-body"
          placeholder="Write the comment content…"
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
              : "Create Comment"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CommentModal({
  open,
  onOpenChange,
  comment,
}: CommentModalProps) {
  const isEditing = !!comment;
  const formKey = open ? (comment ? `edit-${comment.id}` : "new") : "closed";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Comment" : "New Comment"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the fields below to edit this comment."
              : "Fill in the fields below to create a new comment."}
          </DialogDescription>
        </DialogHeader>
        <CommentFormContent
          key={formKey}
          comment={comment}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}
