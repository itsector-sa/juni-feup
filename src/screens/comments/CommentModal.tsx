import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  useCreateComment,
  useUpdateComment,
} from "@/services/comments/useComments";
import type { Comment } from "@/types";

const commentSchema = z.object({
  postId: z
    .number()
    .int()
    .min(1, "Min post ID is 1")
    .max(100, "Max post ID is 100"),
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be at most 100 characters"),
  email: z.string().email("Must be a valid email address"),
  body: z
    .string()
    .min(10, "Body must be at least 10 characters")
    .max(500, "Body must be at most 500 characters"),
});

type CommentFormValues = z.infer<typeof commentSchema>;

interface CommentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comment?: Comment;
}

export function CommentModal({
  open,
  onOpenChange,
  comment,
}: CommentModalProps) {
  const isEditing = !!comment;

  const createComment = useCreateComment();
  const updateComment = useUpdateComment();

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      postId: 1,
      name: "",
      email: "",
      body: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (comment) {
        form.reset({
          postId: comment.postId,
          name: comment.name,
          email: comment.email,
          body: comment.body,
        });
      } else {
        form.reset({ postId: 1, name: "", email: "", body: "" });
      }
    }
  }, [open, comment, form]);

  const onSubmit = (values: CommentFormValues) => {
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

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-2"
          >
            <FormField
              control={form.control}
              name="postId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Post ID</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      placeholder="1–100"
                      value={field.value}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        field.onChange(isNaN(v) ? "" : v);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter commenter's name…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="commenter@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write the comment content…"
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
        </Form>
      </DialogContent>
    </Dialog>
  );
}
