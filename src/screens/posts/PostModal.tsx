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
import { useCreatePost, useUpdatePost } from "@/services/posts";
import type { Post } from "@/types";

const postSchema = z.object({
  userId: z
    .number()
    .int()
    .min(1, "Min user ID is 1")
    .max(10, "Max user ID is 10"),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be at most 100 characters"),
  body: z
    .string()
    .min(10, "Body must be at least 10 characters")
    .max(500, "Body must be at most 500 characters"),
});

type PostFormValues = z.infer<typeof postSchema>;

interface PostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post?: Post;
}

export function PostModal({ open, onOpenChange, post }: PostModalProps) {
  const isEditing = !!post;

  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      userId: 1,
      title: "",
      body: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (post) {
        form.reset({ userId: post.userId, title: post.title, body: post.body });
      } else {
        form.reset({ userId: 1, title: "", body: "" });
      }
    }
  }, [open, post, form]);

  const onSubmit = (values: PostFormValues) => {
    if (isEditing && post) {
      updatePost.mutate(
        { ...values, id: post.id },
        {
          onSuccess: () => {
            toast.success("Post updated successfully");
            onOpenChange(false);
          },
          onError: () => toast.error("Failed to update post"),
        },
      );
    } else {
      createPost.mutate(values, {
        onSuccess: () => {
          toast.success("Post created successfully");
          onOpenChange(false);
        },
        onError: () => toast.error("Failed to create post"),
      });
    }
  };

  const isPending = createPost.isPending || updatePost.isPending;

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

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-2"
          >
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User ID</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      placeholder="1–10"
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter post title…" {...field} />
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
                      placeholder="Write the post content…"
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
                    : "Create Post"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
