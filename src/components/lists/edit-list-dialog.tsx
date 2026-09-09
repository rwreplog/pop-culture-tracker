"use client";

import { Pencil } from "lucide-react";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { renameListAction } from "@/lib/actions/lists";
import { withActionToast } from "@/lib/action-toast";

export function EditListDialog({
  listId,
  name,
  description,
}: {
  listId: string;
  name: string;
  description: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    async (
      prevState: Awaited<ReturnType<typeof renameListAction>>,
      formData: FormData,
    ) => {
      const result = await withActionToast(renameListAction, "List updated")(
        prevState,
        formData,
      );
      if (!result?.error) setOpen(false);
      return result;
    },
    undefined,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="outline" size="icon" aria-label="Edit list" />}
      >
        <Pencil className="size-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit list</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="listId" value={listId} />
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-list-name">Name</Label>
            <Input
              id="edit-list-name"
              name="name"
              defaultValue={name}
              required
              maxLength={100}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-list-description">Description</Label>
            <Textarea
              id="edit-list-description"
              name="description"
              defaultValue={description ?? ""}
              rows={3}
              maxLength={500}
            />
          </div>
          {state?.error ? (
            <p role="alert" className="text-destructive text-sm">
              {state.error}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
