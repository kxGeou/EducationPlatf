function AboutPlatform() {
  return (
    <section className="w-full px-6 flex flex-col py-16 md:flex-row md:justify-between md:gap-20">
        <div className="bg-blackText w-full h-35 md:w-[50%] md:h-70 rounded flex justify-center items-center text-white">
            <p>Prototyp</p>
        </div>

        <div className="my-5 flex flex-col gap-1 md:justify-between">
          <div className="flex flex-col gap-2">
            <h3 className="text-blackText font-semibold text-xl md:text-3xl">Lorem ipsum dolor sit amet.</h3>
            <p className="text-blackText/75 text-sm md:max-w-[400px] md:w-full">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Voluptas, laboriosam? Libero, similique dolorum porro molestiae explicabo velit minus quia ab?</p>
          </div>
            <button className="mt-6 w-full bg-darkBlue text-white py-2 rounded-lg cursor-pointer">Kup Kurs</button>
        </div>
    </section>
  )
}

export default AboutPlatform