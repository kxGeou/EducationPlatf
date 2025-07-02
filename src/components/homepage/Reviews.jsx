import { Star } from 'lucide-react'

function Review({user, description}) {
    const i = 5;
    return(
        <div className='w-full shadow-lg rounded-[12px] p-5 flex flex-col gap-2'>
            <div className='flex gap-3 items-center'>
                <span className='w-12 h-12 bg-darkBlue rounded-full'></span>
                <div>
                    <p className='text-lg'>{user}</p>
                    <div className='flex gap-1'>
                    <Star size={20}></Star>
                    <Star size={20} ></Star>
                    <Star size={20}></Star>
                    <Star size={20} className='opacity-50'></Star>
                    <Star size={20} className='opacity-50'></Star>
                </div>
            </div>
            </div>
         

            <p className=' mt-2 opacity-75'>{description}</p>
        </div>
    )
}


function Reviews() {

    const reviews = [
        {
            user: "New User 3213",
            description: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quo eius quas voluptatibus quisquam excepturi dolorum aperiam asperiores repellendus. Dignissimos, pariatur!"
        },
        {
            user: "New User 3213",
            description: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quo eius quas voluptatibus quisquam excepturi dolorum aperiam asperiores repellendus. Dignissimos, pariatur!"
        },
        {
            user: "New User 3213",
            description: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quo eius quas voluptatibus quisquam excepturi dolorum aperiam asperiores repellendus. Dignissimos, pariatur!"
        },
    ]

  return (
    <section className='px-6 flex flex-col justify-start items-center  mt-26 max-w-[1100px] '>
        <div className='w-full'>
            <h2 className='flex gap-2 items-center opacity-50 mb-6'><Star size={17}></Star>Opinie</h2>
        </div>
        <ul className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {reviews.map((r, index) => (
                <Review user={r.user} description={r.description} key={index}></Review>
            ))}
        </ul>

        <button className='cursor-pointer w-full bg-darkBlue  text-white py-2 rounded-[12px] mt-8 max-w-[50%] transition-all hover:bg-darkBlue/90 md:mt-12'>Więcej opini..</button>
    </section>
  )
}

export default Reviews