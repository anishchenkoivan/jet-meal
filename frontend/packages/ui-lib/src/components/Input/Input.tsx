import type { InputProps } from "antd";
import { Input as AntInput } from "antd";

export function Input(props: InputProps) {
  return <AntInput {...props} />;
}

export const TextArea = AntInput.TextArea;
export const Search = AntInput.Search;
export const Password = AntInput.Password;
