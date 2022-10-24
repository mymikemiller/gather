import * as React from "react";
import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import { AppContext } from "../App";
import toast from "react-hot-toast";
import Loading from "./Loading";
import {
  Rsvp,
  RsvpResult,
  _SERVICE,
} from "../../../declarations/gather/gather.did";
import { ActorSubclass } from "@dfinity/agent";
interface Props {
  actor?: ActorSubclass<_SERVICE>;
}
import {
  Gathering,
  GatheringInfo
} from "../../../declarations/gather/gather.did";
import { Section, FormContainer, Title, Label, Input, GrowableInput, LargeButton, LargeBorder, LargeBorderWrap, ValidationError } from "./styles/styles";

const RsvpForm = (props: Props) => {
  const params = useParams();
  const gatheringId = BigInt(params.gatheringId);
  const [rsvp, setRsvp] = useState<Rsvp>(null);
  const [gatheringInfo, setGatheringInfo] = useState<GatheringInfo>(null);
  const { gather } = useContext(AppContext);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<Rsvp>();//{ defaultValues });

  useEffect(() => {
    if (gather) {
      (async () => {
        const gatheringInfoResult = await gather.getGathering(gatheringId);
        if (gatheringInfoResult.length == 1) {
          setGatheringInfo(gatheringInfoResult[0].info);
        } else {
          console.error("Failed to fetch gathering " + gatheringId);
        }
      })();
    }
  }, []);

  useEffect(() => {
    console.dir(gatheringInfo);
  }, [gatheringInfo]);

  const onSubmit = (rsvp: Rsvp): void => {
    gather!.rsvp(rsvp, gatheringId).then(async (result: RsvpResult) => {
      if ("ok" in result) {
        toast.success("Successfully sent RSVP");
      } else {
        if ("GatheringNotFound" in result.err) {
          toast.error("Gathering " + gatheringId + " not found.");
        } else {
          toast.error("Error submitting RSVP.");
        };
        console.error(result.err);
        return;
      };
    });
  };

  if (!gatheringInfo) {
    return <Loading />;
  }

  return (
    <FormContainer>
      <Title>RSVP to {gatheringInfo.title}</Title>
      <form onSubmit={handleSubmit(onSubmit)}>

        <Label>
          Name:
          <Input
            type='textbox'
            {...register("name", {
              required: "Please enter your name",
            })}
          />
          {/* <ValidationError>{errors.key?.message}</ValidationError> */}
        </Label>

        <Label>
          Attending:
          <Input
            type='checkbox'
            {...register("attending", {
              required: "Response for \"Attending\" is required",
            })}
          />
          {/* <ValidationError>{errors.key?.message}</ValidationError> */}
        </Label>

        <LargeBorderWrap>
          <LargeBorder>
            <LargeButton type="submit" />
          </LargeBorder>
        </LargeBorderWrap>
      </form>
    </FormContainer>
  );
};

export default RsvpForm;
