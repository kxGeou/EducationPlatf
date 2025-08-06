import React from "react";

function AboutPost({
  first_description,
  first_header,
  first_image,
  second_description,
  second_header,
  second_image,
}) {
  return (
    <div className="mt-42 px-6 min-h-screen flex flex-col gap-20">
      <div className="flex flex-col-reverse lg:flex-row justify-between gap-10">
        <img
          className="bg-secondaryBlue/25 dark:text-white w-full lg:w-1/2 rounded-[12px] flex items-center justify-center max-h-[400px] min-h-[200px]"
          src={first_image}
        ></img>

        <div className="w-full lg:w-1/2 flex flex-col  items-end text-left lg:text-right lg:items-end">
          <h2 className="font-bold text-4xl md:text-5xl text-blackText dark:text-white">
            {first_header}
          </h2>
          <p className="text-blackText/75 dark:text-white/75 leading-7 text-base md:text-lg mt-4 md:mt-6">
            {first_description}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between gap-10">
        <div className="w-full lg:w-1/2 flex flex-col items-start text-left">
          <h2 className="font-bold text-4xl md:text-5xl text-blackText dark:text-white">
            {second_header}
          </h2>

          <p className="text-blackText/75 dark:text-white/75 leading-7 text-base md:text-lg mt-4 md:mt-6">
            {second_description}
          </p>
        </div>

        <img
          className="bg-secondaryBlue/25 dark:text-white w-full lg:w-1/2 rounded-[12px] flex items-center justify-center max-h-[400px] min-h-[200px]"
          src={second_image}
        ></img>
      </div>
    </div>
  );
}

export default AboutPost;
