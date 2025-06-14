import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, ...rest }, ref) => {
    return (
      <div className="flex flex-col">
        <label className="text-left">{label}</label>
        <input className="h-8 w-52 border p-2 md:w-80" {...rest} ref={ref} />
      </div>
    );
  },
);

export default Input;
