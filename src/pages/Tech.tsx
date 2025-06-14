import TechBox from "../components/TechBox";

export default function Tech() {
  return (
    <div>
      <h1 className="m-4 text-center text-[36px] font-bold">TECHS</h1>
      <div className="grid h-5/6 w-screen grid-cols-1 place-items-center p-4 md:grid-cols-2 md:grid-rows-2">
        <TechBox>1</TechBox>
        <TechBox>2</TechBox>
        <TechBox>3</TechBox>
        <TechBox>4</TechBox>
      </div>
    </div>
  );
}
