function AboutPlatform() {
  return (
    <section className="w-full bg-blue-100/50 px-6 flex flex-col py-8 mt-12">
        <div className="bg-blackText w-full h-35 rounded flex justify-center items-center text-white">
            <p>Prototyp</p>
        </div>

        <div className="my-5 flex flex-col gap-1">
            <h3 className="text-blackText font-semibold text-xl">Lorem ipsum dolor sit amet.</h3>
            <p className="text-blackText/75 text-sm">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Voluptas, laboriosam? Libero, similique dolorum porro molestiae explicabo velit minus quia ab?</p>
            <button className="mt-6 w-full bg-darkBlue text-white py-2 rounded-lg cursor-pointer">Kup Kurs</button>
        </div>
    </section>
  )
}

export default AboutPlatform