import React from "react";

function AboutBlogs() {
  return (
    <div className="mt-42 px-6 min-h-screen flex flex-col gap-20">
      <div className="flex flex-col-reverse lg:flex-row justify-between gap-10">
        <div className="bg-secondaryBlue/25 w-full lg:w-1/2 rounded-[12px] flex items-center justify-center min-h-[200px]">
          prototyp
        </div>

        <div className="w-full lg:w-1/2 flex flex-col  items-end text-left lg:text-right lg:items-end">
          <h2 className="font-bold text-4xl md:text-5xl text-blackText">
            Why build{" "}
            <span className="font-normal text-blackText/75">
              on monday.com
            </span>
          </h2>
          <p className="text-blackText/75 leading-7 text-base md:text-lg mt-4 md:mt-6">
            Use our powerful app framework, flexible APIs, and robust SDK to
            build solutions customers truly need - and are ready to pay for.
            With built-in monetization, developer tools and resources, and a
            marketplace ecosystem designed to support and drive apps’ success,
            you’ll have everything you need to grow your business.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between gap-10">
        <div className="w-full lg:w-1/2 flex flex-col items-start text-left">
          <h2 className="font-normal text-4xl md:text-5xl text-blackText/75">
            Simple, native
          </h2>
          <span className="font-bold text-4xl md:text-5xl text-blackText">
            monetization
          </span>

          <p className="text-blackText/75 leading-7 text-base md:text-lg mt-4 md:mt-6">
            Easily set your pricing and plans - then let our platform handle the
            rest. Everything from payments to subscriptions and billing is
            seamlessly managed, so you can focus on building great apps, not
            transactions. Your users enjoy easy, secure payments, while you
            benefit from frictionless sales and predictable revenue.
          </p>
        </div>

        <div className="bg-secondaryBlue/25 w-full lg:w-1/2 rounded-[12px] flex items-center justify-center min-h-[200px]">
          prototyp
        </div>
      </div>
    </div>
  );
}

export default AboutBlogs;
