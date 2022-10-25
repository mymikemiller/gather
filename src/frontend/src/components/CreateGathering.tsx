import * as React from "react";
import { useContext } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { AppContext } from "../App";
import toast from "react-hot-toast";
import {
  useNavigate,
} from "react-router-dom";
import {
  Gathering,
  GatheringInfo,
  Item,
  _SERVICE,
} from "../../../declarations/gather/gather.did";
import { ActorSubclass } from "@dfinity/agent";
interface Props {
  actor?: ActorSubclass<_SERVICE>;
}
import { FormContainer, Title, Label, Input, LargeButton, LargeBorder, LargeBorderWrap, ValidationError } from "./styles/styles";

const CreateGathering = (props: Props) => {
  const navigate = useNavigate();
  const { gather } = useContext(AppContext);
  const { register, control, handleSubmit, formState: { errors } } = useForm<GatheringInfo>({
    defaultValues: {
      title: "TED Talko Tuesday",
      description: "Eat tacos, watch TED Talks",
      datetime: "Tuesday at 7",
      location: "Mike's House",
      rsvps: []
    }
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const onSubmit = (gatheringInfo: GatheringInfo): void => {
    gather!.addGathering(gatheringInfo).then(async (gathering: Gathering) => {
      toast.success("Created Gathering: " + gathering.id);
      navigate("/gathering/" + gathering.id);
    });
  };

  return (
    <FormContainer>
      <Title>Create a new Gathering</Title>
      <form onSubmit={handleSubmit(onSubmit)}>

        <Label>
          Title:
          <Input
            type='textbox'
            {...register("title", {
              required: "Please enter a title for your Gathering",
            })}
          />
          <ValidationError>{errors.title?.message}</ValidationError>
        </Label>

        <Label>
          Description:
          <Input
            type='textbox'
            {...register("description", {
              required: "Please enter a description for your Gathering",
            })}
          />
          <ValidationError>{errors.description?.message}</ValidationError>
        </Label>

        <Label>
          Date/time:
          <Input
            type='textbox'
            {...register("datetime", {
              required: "Please enter a date and time for your Gathering",
            })}
          />
          <ValidationError>{errors.datetime?.message}</ValidationError>
        </Label>

        <Label>
          Location:
          <Input
            type='textbox'
            {...register("location", {
              required: "Please enter a location for your Gathering",
            })}
          />
          <ValidationError>{errors.location?.message}</ValidationError>
        </Label>

        <Label>
          Items:
          {fields.map((field, index) => {

            return (
              <div key={field.id}>
                <input
                  placeholder="Name"
                  {...register(`items.${index}.0.name` as const, {
                    required: "Please enter the item name"
                  })}
                  type="text"
                />
                <ValidationError>{errors?.items?.at(index)[0].name?.message}</ValidationError>
                <input
                  placeholder="Description"
                  {...register(`items.${index}.0.description` as const, {
                    // note: Item description is not required
                  })}
                  type="text"
                />
                {/* <ValidationError>{errors?.items?.at(index)[0].description?.message}</ValidationError> */}
                {/* Number of this Item required for the Gathering */}
                <Controller
                  name={`items.${index}.1` as const}
                  render={({ field }) => (
                    <input
                      type="number"
                      {...props}
                      onChange={(e) => {
                        field.onChange(parseInt(e.target.value, 10));
                      }}
                      defaultValue="1"
                    />
                  )}
                  control={control}
                />

                <button type="button" onClick={() => {
                  remove(index)
                }}>
                  Remove item
                </button>
              </div>
            );
          })}
        </Label>
        <button
          type="button"
          onClick={(e) => {
            append([[{ name: "", description: "" } as Item, BigInt(1)]])
          }}
        >
          Add item
        </button>

        <LargeBorderWrap>
          <LargeBorder>
            <LargeButton type="submit" />
          </LargeBorder>
        </LargeBorderWrap>
      </form >
    </FormContainer >
  );
};

export default CreateGathering;
