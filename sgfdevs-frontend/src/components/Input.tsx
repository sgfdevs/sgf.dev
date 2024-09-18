import { cn } from '@/utils/cn';

interface InputProps {
  inputType: string;
  inputName: string;
  inputPlaceholder?: string;
}

export default function Input({
  inputType,
  inputName,
  inputPlaceholder,
}: InputProps) {
  return (
    <div>
      <input
        type={inputType}
        name={inputName}
        placeholder={inputPlaceholder}
        className={cn(
          'mb-[35px] block h-[64px] w-full border border-[#c0c0c0] pl-[14px] text-black',
          'placeholder:text-[#919191] focus:outline-none',
        )}
      />
    </div>
  );
}
