export default function AboutUs() {
  return (
    <div className="mx-auto flex w-4/5 flex-col items-center justify-center md:w-1/3">
      <div className="flex flex-col gap-3 rounded-md border p-6">
        <h1 className="text-center text-lg font-bold">About</h1>
        <p className="indent-[2rem]">
          Started in 2024 as a side project, this banking app was made to
          practice using essential react libraries such as React-Router-Dom and
          React-Redux-Toolkit. The decision was made later on in development to
          incorporate a bankend, fetching data from a local database using
          postgres and express.
        </p>
      </div>
    </div>
  );
}
