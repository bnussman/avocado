import { Control, useController } from "react-hook-form";
import { IInputProps, Input as _Input } from "native-base";

interface Props {
  name: string;
  control: Control<any, any>;
}

export function Input({ name, control, ...rest }: IInputProps & Props) {
  const { field } = useController({
    control,
    defaultValue: '',
    name,
  });

  return (
    <_Input 
      {...rest}
      value={field.value}
      onChangeText={field.onChange}
    />
  );
}
