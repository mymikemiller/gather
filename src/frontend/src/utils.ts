import { ActorSubclass } from "@dfinity/agent";
import toast from "react-hot-toast";
import { Rsvp, _SERVICE } from "../../declarations/gather/gather.did";

export async function pushRsvp(actor: ActorSubclass<_SERVICE>, rsvp: Rsvp, gatheringId: bigint): Promise<boolean | undefined> {
  const result = await actor!.rsvp(rsvp, gatheringId);
  if ("ok" in result) {
    toast.success('RSVP sent, thanks!');
    return true;
  } else {
    console.error(result.err);
    toast.error("Failed to send RSVP");
    return;
  }
};
