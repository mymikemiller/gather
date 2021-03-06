import { ActorSubclass } from "@dfinity/agent";
import toast from "react-hot-toast";
import { User, Profile, Rsvp, _SERVICE } from "../../declarations/gather/gather.did";

export function compareProfiles(p1: any | null, p2: any) {
  if (!p1) return false;

  for (const key in p1) {
    if (Object.prototype.hasOwnProperty.call(p1, key)) {
      const element = p1[key];
      if (element[0] !== p2[key][0]) return false;
    }
  }
  return true;
}

export async function pushProfile(actor: ActorSubclass<_SERVICE>, profile: Profile): Promise<User | undefined> {
  const result = await actor!.updateUser(profile);
  if ("ok" in result) {
    const profileResponse = await actor.readUser();
    if ("ok" in profileResponse) {
      return profileResponse.ok;
    } else {
      console.error(profileResponse.err);
      toast.error("Failed to read profile from IC");
      return;
    }
  } else {
    console.error(result.err);
    toast.error("Failed to save update to IC");
    return;
  }
};

export async function pushRsvp(actor: ActorSubclass<_SERVICE>, rsvp: Rsvp, gatheringId: bigint): Promise<boolean | undefined> {
  const result = await actor!.rsvp(rsvp, gatheringId);
  if ("ok" in result) {
    toast.success('RSVP sent, thanks!');
    return true;
    // const profileResponse = await actor.read();
    // if ("ok" in profileResponse) {
    //   return profileResponse.ok;
    // } else {
    //   console.error(profileResponse.err);
    //   toast.error("Failed to read profile from IC");
    //   return;
    // }
  } else {
    console.error(result.err);
    toast.error("Failed to send RSVP");
    return;
  }
};
