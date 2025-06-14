interface props {
  children: React.ReactNode;
}

export default function TechBox({ children }: props) {
  return (
    <div className="h-64 w-64 rounded-sm shadow-md md:w-[20rem] lg:w-[30rem] xl:w-[38rem]">
      {children}
    </div>
  );
}
