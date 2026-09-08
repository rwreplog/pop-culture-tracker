import { toast } from "@/lib/toast";

type ActionState = { error?: string } | undefined;

/**
 * Wraps a `useActionState` action so the success toast fires as part of the
 * action's own resolution rather than a post-render effect keyed off
 * `isPending`. Several call sites cause their own component to unmount on
 * success (e.g. `revalidatePath` removing the row from a list, or swapping
 * to a different child based on the new status) — that unmount can land in
 * the same commit that would've flipped `isPending` to false, so an effect
 * in the unmounting component never runs. Firing inside the action itself
 * sidesteps that race entirely.
 */
export function withActionToast<State extends ActionState, Args extends unknown[]>(
  action: (...args: Args) => State | Promise<State>,
  successMessage: string | ((...args: Args) => string),
) {
  return async (...args: Args): Promise<State> => {
    const result = await action(...args);
    if (!result?.error) {
      toast.success(
        typeof successMessage === "function"
          ? successMessage(...args)
          : successMessage,
      );
    }
    return result;
  };
}
